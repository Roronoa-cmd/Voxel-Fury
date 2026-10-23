// Voxel Fury server — run: node server.js   (koi npm install nahi chahiye)
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,DIR=__dirname;
const HTML=['voxel_fury_3d_v4.html','voxel_fury_3d_v3.html','index.html'].find(f=>fs.existsSync(path.join(DIR,f)))||'index.html';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const P=new Map(),PEND=new Map(),GAP={chat:300,freq:800,inv:1000,report:10000};let NID=1;
const now=()=>Date.now(),str=(v,n)=>String(v==null?'':v).slice(0,n);
const push=(p,e)=>{p.q.push(e);if(p.q.length>200)p.q.shift()};
const room=p=>[...P.values()].filter(o=>o.room===p.room),byNick=n=>[...P.values()].filter(o=>o.nm===n);
const snap=p=>({p:room(p).filter(o=>o!==p).map(o=>({id:o.id,nm:o.nm,x:o.x,y:o.y,z:o.z,yaw:o.yaw,pit:o.pit,dead:o.dead,k:o.k,d:o.d,tm:o.tm,ac:now()-o.lastS<2500?1:0})),ev:p.q.splice(0)});
function join(b){const p={id:NID++,nm:str(b.nm||'Player',14),room:str(b.room,8).toUpperCase(),tm:0,q:[],res:null,lastSeen:now(),lastS:0,x:0,y:0,z:0,yaw:0,pit:0,dead:0,k:0,d:0,lt:{}};
 const t=[0,0];room(p).forEach(o=>t[o.tm]++);p.tm=t[0]<=t[1]?0:1;P.set(p.id,p);
 (PEND.get(p.nm)||[]).filter(x=>now()-x.at<864e5).forEach(x=>push(p,x.ev));PEND.delete(p.nm);return p}
function msg(p,b){p.lastSeen=now();const t=b.t,g=GAP[t];
 if(g){if(now()-(p.lt[t]||0)<g)return{err:'thoda ruko'};p.lt[t]=now()}
 if(t==='s'){Object.assign(p,{x:+b.x||0,y:+b.y||0,z:+b.z||0,yaw:+b.yaw||0,pit:+b.pit||0,dead:b.dead?1:0,k:b.k|0,d:b.d|0,lastS:now()});return}
 if(t==='hit'||t==='kill'){const to=P.get(+b.to);if(to&&to.room===p.room)push(to,{t,from:p.id,amt:+b.amt||0,head:!!b.head,wn:b.wn});return}
 if(t==='f'){if(Array.isArray(b.a)&&Array.isArray(b.b))room(p).forEach(o=>{if(o!==p)push(o,{t:'f',from:p.id,a:b.a,b:b.b})});return}
 if(t==='start'){room(p).forEach(o=>push(o,{t:'start',map:b.map,mode:b.mode,diff:b.diff}));return}
 if(t==='chat'){const m=str(b.m,120);if(m)room(p).forEach(o=>{if(o!==p)push(o,{t:'chat',nm:p.nm,m})});return}
 if(t==='freq'||t==='facc'){const to=str(b.to,14);if(!to||to===p.nm)return{err:'galat nickname'};
  const ev={t,to,from:p.nm},tg=byNick(to);if(tg.length){tg.forEach(o=>push(o,ev));return{ok:1,delivered:1}}
  const l=PEND.get(to)||[];if(!l.some(x=>x.ev.t===t&&x.ev.from===p.nm))l.push({ev,at:now()});PEND.set(to,l.slice(-20));return{ok:1,delivered:0}}
 if(t==='inv'){byNick(str(b.to,14)).forEach(o=>push(o,{t:'inv',to:o.nm,from:p.nm,room:str(b.room,8).toUpperCase()}));return}
 if(t==='report'){const r={at:new Date().toISOString(),reporter:p.nm,target:str(b.target,14),reason:str(b.reason,40),note:str(b.note,100),room:p.room};
  if(!r.target||r.target===p.nm)return{err:'galat player'};fs.appendFile(path.join(DIR,'reports.jsonl'),JSON.stringify(r)+'\n',()=>{});console.log('REPORT',r);return{ok:1}}
}
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','*');
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
 const J=(o,c=200)=>{res.writeHead(c,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(o))};
 const pid=()=>P.get(+u.searchParams.get('id'));
 if(req.method==='POST'){let s='';req.on('data',d=>{s+=d;if(s.length>8e3)req.destroy()});
  req.on('end',()=>{let b={};try{b=JSON.parse(s||'{}')}catch(e){}
   if(u.pathname==='/join'){const p=join(b);return J({id:p.id,team:p.tm})}
   if(u.pathname==='/m'){const p=P.get(+b.id);if(!p)return J({err:'server se connect nahi'},404);return J(msg(p,b)||{ok:1})}
   J({err:'?'},404)});return}
 if(u.pathname==='/ev'){const p=pid();if(!p){res.writeHead(404);return res.end()}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
  res.write(':ok\n\n');p.res=res;req.on('close',()=>{if(p.res===res)p.res=null});return}
 if(u.pathname==='/poll'){const p=pid();if(!p)return J({err:'gone'},404);p.lastSeen=now();return J(snap(p))}
 if(u.pathname==='/players'){const m=new Map();for(const o of P.values()){const st=now()-o.lastS<2500?'play':'lobby';if(!m.has(o.nm)||st==='play')m.set(o.nm,{nm:o.nm,st})}return J([...m.values()])}
 const f=u.pathname==='/'?HTML:decodeURIComponent(u.pathname).slice(1),fp=path.join(DIR,f);
 if(!fp.startsWith(DIR+path.sep)||/server\.js|reports\.jsonl/.test(f)){res.writeHead(404);return res.end('404')}
 fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end('404')}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})
}).listen(PORT,'0.0.0.0',()=>console.log('Voxel Fury server: http://localhost:'+PORT+'  (game file: '+HTML+')'));
setInterval(()=>{const t=now();for(const p of P.values()){if(t-p.lastSeen>9000){if(p.res)p.res.end();P.delete(p.id);continue}
 if(p.res)p.res.write('data:'+JSON.stringify(snap(p))+'\n\n')}},50);
setInterval(()=>{for(const p of P.values())if(p.res)p.res.write(':ka\n\n')},15000);
