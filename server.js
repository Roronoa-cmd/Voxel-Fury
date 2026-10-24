/* VOXEL FURY 3D - multiplayer + web server (sirf Node.js, koi npm install nahi)
   Chalane ke liye:  node server.js      (PORT / HOST env se badal sakte ho)
   Ye ek hi server game files bhi serve karta hai aur multiplayer (rooms, friends, chat) bhi. */
'use strict';
const http=require('http'),fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto');
const PORT=+process.env.PORT||3000, HOST=process.env.HOST||'0.0.0.0', ROOT=__dirname;
const TRUST_PROXY=process.env.TRUST_PROXY==='1';           // nginx/Cloudflare ke peeche ho to 1 karo
const MAX_PLAYERS=+process.env.MAX_PLAYERS||200, MAX_ROOM=+process.env.MAX_ROOM||16, MAX_PER_IP=+process.env.MAX_PER_IP||12;
const TICK_MS=50, TIMEOUT_MS=12000, FRESH_MS=3000;

const players=new Map();                                    // id -> player
const now=()=>Date.now();
const str=(v,n)=>String(v==null?'':v).slice(0,n);
const num=(v,d=0)=>Number.isFinite(+v)?+v:d;
const roomOf=r=>str(r,8).toUpperCase().replace(/[^A-Z0-9]/g,'');
const newId=()=>{let i;do{i=crypto.randomInt(1000000,2147483647)}while(players.has(i));return i};

/* ---------- helpers ---------- */
function ipOf(req){if(TRUST_PROXY){const f=req.headers['x-forwarded-for'];if(f)return f.split(',')[0].trim()}return req.socket.remoteAddress||'?'}
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type')}
function json(res,obj,code=200){const b=JSON.stringify(obj);res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(b)}
function body(req,cb){let s='',dead=false;req.on('data',c=>{s+=c;if(s.length>8192&&!dead){dead=true;req.destroy()}});req.on('end',()=>{if(dead)return;try{cb(JSON.parse(s||'{}'))}catch(e){cb(null)}})}
const inRoom=p=>[...players.values()].filter(o=>o.room===p.room);
const fresh=o=>now()-o.stateAt<FRESH_MS;
const push=(p,ev)=>{if(p.evq.length<200)p.evq.push(ev)};
const others=p=>inRoom(p).filter(o=>o!==p);
function payload(p){
  const list=others(p).map(o=>({id:o.id,nm:o.nm,tm:o.team,x:o.x,y:o.y,z:o.z,yaw:o.yaw,pit:o.pit,k:o.k,d:o.d,dead:o.dead?1:0,ac:fresh(o)?1:0}));
  return {p:list,ev:p.evq.splice(0)}}

/* ---------- multiplayer API ---------- */
function join(req,res,m){
  const ip=ipOf(req);
  if(players.size>=MAX_PLAYERS)return json(res,{err:'server full'});
  if([...players.values()].filter(o=>o.ip===ip).length>=MAX_PER_IP)return json(res,{err:'too many connections from your IP'});
  const room=roomOf(m.room);
  const mates=[...players.values()].filter(o=>o.room===room);
  if(room&&mates.length>=MAX_ROOM)return json(res,{err:'room full'});
  const t0=mates.filter(o=>o.team===0).length,t1=mates.length-t0,team=t0<=t1?0:1;
  const p={id:newId(),ip,nm:str(m.nm,14)||'Player',room,team,x:0,y:0,z:0,yaw:0,pit:0,dead:false,k:0,d:0,seen:now(),stateAt:0,evq:[],res:null,lastReport:0};
  players.set(p.id,p);json(res,{id:p.id,team})}

function msg(req,res,m){
  const p=players.get(num(m.id,-1));
  if(!p)return json(res,{err:'session expired - page reload karo'});
  p.seen=now();const t=m.t;
  const target=()=>{const o=players.get(num(m.to,-1));return o&&o.room===p.room?o:null};
  const byName=()=>[...players.values()].find(o=>o.nm===str(m.to,14)&&o!==p);
  const vec=a=>Array.isArray(a)&&a.length===3?a.map(v=>num(v)):null;
  switch(t){
    case 's':p.x=num(m.x);p.y=num(m.y);p.z=num(m.z);p.yaw=num(m.yaw);p.pit=num(m.pit);p.dead=!!m.dead;p.k=num(m.k)|0;p.d=num(m.d)|0;if(m.nm)p.nm=str(m.nm,14);p.stateAt=now();break;
    case 'hb':break;
    case 'hit':{const o=target();if(o)push(o,{t:'hit',amt:Math.max(0,Math.min(150,num(m.amt))),head:!!m.head,wn:str(m.wn,12),from:p.id});break}
    case 'kill':{const o=target();if(o)push(o,{t:'kill',head:!!m.head,wn:str(m.wn,12),from:p.id});break}
    case 'f':{const a=vec(m.a),b=vec(m.b);if(a&&b)for(const o of others(p))push(o,{t:'f',a,b,from:p.id});break}
    case 'start':if(p.room)for(const o of others(p))push(o,{t:'start',map:str(m.map,16),mode:str(m.mode,8),diff:num(m.diff)|0});break;
    case 'chat':{const text=str(m.m,120).trim();if(text)for(const o of others(p))push(o,{t:'chat',nm:p.nm,m:text});break}
    case 'freq':{const o=byName();if(o)push(o,{t:'freq',to:o.nm,from:p.nm});return json(res,{delivered:!!o})}
    case 'facc':{const o=byName();if(o)push(o,{t:'facc',to:o.nm,from:p.nm});break}
    case 'inv':{const o=byName();if(o)push(o,{t:'inv',to:o.nm,from:p.nm,room:roomOf(m.room)});break}
    case 'report':{
      if(now()-p.lastReport<10000)return json(res,{err:'thoda ruko, phir report karo'});
      p.lastReport=now();
      fs.appendFile(path.join(ROOT,'reports.log'),JSON.stringify({time:new Date().toISOString(),ip:p.ip,from:p.nm,target:str(m.target,14),reason:str(m.reason,40),note:str(m.note,100)})+'\n',()=>{});
      return json(res,{ok:1})}
  }
  json(res,{ok:1})}

function sse(req,res,id){
  const p=players.get(id);if(!p){res.writeHead(404);return res.end()}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
  res.write(': ok\n\n');p.res=res;
  req.on('close',()=>{if(p.res===res)p.res=null})}

setInterval(()=>{
  const t=now();
  for(const p of players.values()){
    if(t-p.seen>TIMEOUT_MS){if(p.res)try{p.res.end()}catch(e){}players.delete(p.id);continue}
    if(p.res){p.seen=t;try{p.res.write('data: '+JSON.stringify(payload(p))+'\n\n')}catch(e){p.res=null}}}
},TICK_MS);

/* ---------- static files ---------- */
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.txt':'text/plain; charset=utf-8'};
const BLOCK=new Set(['server.js','package.json','reports.log']);
function serve(req,res,url){
  let rel=decodeURIComponent(url.pathname);if(rel.endsWith('/'))rel+='index.html';
  const file=path.normalize(path.join(ROOT,rel));
  const parts=path.relative(ROOT,file).split(path.sep);
  if(!file.startsWith(ROOT+path.sep)||parts.some(s=>s.startsWith('.')||s==='node_modules')||BLOCK.has(parts[parts.length-1])||!MIME[path.extname(file).toLowerCase()]){res.writeHead(404);return res.end('Not found')}
  fs.stat(file,(e,st)=>{
    if(e||!st.isFile()){res.writeHead(404);return res.end('Not found')}
    const ext=path.extname(file).toLowerCase(),audio=ext==='.mp3'||ext==='.ogg'||ext==='.wav';
    res.writeHead(200,{'Content-Type':MIME[ext],'Content-Length':st.size,'X-Content-Type-Options':'nosniff','Cache-Control':audio?'public, max-age=3600':'no-cache'});
    fs.createReadStream(file).pipe(res)})}

/* ---------- http server ---------- */
const server=http.createServer((req,res)=>{
  cors(res);
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  let url;try{url=new URL(req.url,'http://x')}catch(e){res.writeHead(400);return res.end()}
  const P=url.pathname;
  try{
    if(req.method==='POST'&&(P==='/join'||P==='/m'))return body(req,m=>{if(!m||typeof m!=='object')return json(res,{err:'bad request'},400);P==='/join'?join(req,res,m):msg(req,res,m)});
    if(req.method==='GET'){
      if(P==='/ev')return sse(req,res,num(url.searchParams.get('id'),-1));
      if(P==='/poll'){const p=players.get(num(url.searchParams.get('id'),-1));if(!p)return json(res,{p:[],ev:[]},404);p.seen=now();return json(res,payload(p))}
      if(P==='/players')return json(res,[...players.values()].map(o=>({nm:o.nm,st:fresh(o)?'play':'lobby'})));
      if(P==='/health')return json(res,{ok:1,players:players.size});
      return serve(req,res,url)}
    res.writeHead(405);res.end()
  }catch(e){console.error(e);if(!res.headersSent)res.writeHead(500);res.end()}});
server.on('clientError',(e,s)=>s.destroy());
server.listen(PORT,HOST,()=>{
  console.log('Voxel Fury server chal raha hai -> port '+PORT);
  console.log('  Local : http://localhost:'+PORT);
  for(const l of Object.values(os.networkInterfaces()))for(const a of l||[])if(a.family==='IPv4'&&!a.internal)console.log('  LAN   : http://'+a.address+':'+PORT)});
for(const s of['SIGINT','SIGTERM'])process.on(s,()=>{console.log('\nband ho raha hai...');server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),1500)});
