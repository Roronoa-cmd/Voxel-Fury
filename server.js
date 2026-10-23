// Voxel Fury 3D - LAN server (koi npm package nahi chahiye)
// Chalao:  node server.js   (voxel_fury_3d_v3.html isi folder me rakho)
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const GAME=path.join(__dirname,'voxel_fury_3d_v3.html'),PORT=process.env.PORT||3000;
const lastStart={};let nid=1;const players={},clients={};
const body=req=>new Promise(r=>{let d='';req.on('data',c=>d+=c);req.on('end',()=>{try{r(JSON.parse(d||'{}'))}catch(e){r({})}})});
const drop=id=>{if(players[id])console.log('Chala gaya: '+players[id].nm+' (id '+id+')');delete players[id];delete clients[id]};
http.createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','*');
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
 const u=new URL(req.url,'http://x');
 if(u.pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok')}
 if(u.pathname==='/'){fs.readFile(GAME,(e,b)=>{if(e){res.writeHead(500);return res.end('voxel_fury_3d_v3.html ko server.js ke saath isi folder me rakho')}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(b)});return}
 if(u.pathname.startsWith('/sounds/')){const f=path.join(__dirname,'sounds',path.basename(u.pathname));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end()}
  const t={'.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'}[path.extname(f).toLowerCase()]||'application/octet-stream';res.writeHead(200,{'Content-Type':t});res.end(b)});return}
 if(u.pathname==='/join'){const j=await body(req),id=nid++;
  players[id]={id,nm:String(j.nm||'Player').slice(0,16),room:String(j.room||'').toUpperCase().slice(0,8),tm:id%2,x:0,y:0,z:0,yaw:0,pit:0,dead:0,k:0,d:0,seen:Date.now()};
  clients[id]={res:null,ev:[]};console.log('Join hua: '+players[id].nm+' (id '+id+', room '+(players[id].room||'public')+')');res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({id,team:id%2}))}
 if(u.pathname==='/ev'){const id=+u.searchParams.get('id');if(!clients[id]){res.writeHead(404);return res.end()}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive','X-Accel-Buffering':'no'});
  clients[id].res=res;req.on('close',()=>drop(id));return}
 if(u.pathname==='/m'){const m=await body(req),p=players[m.id];res.writeHead(204);res.end();if(!p)return;p.seen=Date.now();
  if(m.t==='s'){p.s=Date.now();Object.assign(p,{x:m.x,y:m.y,z:m.z,yaw:m.yaw,pit:m.pit,dead:m.dead,k:m.k,d:m.d,tm:m.tm,nm:String(m.nm||p.nm).slice(0,16)})}
  else if(m.t==='hit'&&clients[m.to])clients[m.to].ev.push({t:'hit',from:m.id,amt:m.amt,head:m.head,wn:m.wn});
  else if(m.t==='start'){const lead=Math.min(...Object.values(players).filter(o=>o.room===p.room).map(o=>o.id));if(p.room&&p.id===lead&&Date.now()-(lastStart[p.room]||0)>3500){lastStart[p.room]=Date.now();for(const k in clients)if(players[k]&&players[k].room===p.room)clients[k].ev.push({t:'start',map:String(m.map||'').slice(0,12),mode:String(m.mode||'').slice(0,8),diff:+m.diff||0})}}
  else if(m.t==='kill'&&clients[m.to])clients[m.to].ev.push({t:'kill',head:m.head});
  else if(m.t==='f')for(const k in clients)if(+k!==m.id&&players[k]&&players[k].room===p.room)clients[k].ev.push({t:'f',from:m.id,a:m.a,b:m.b});
  else if(m.t==='chat'){const msg=String(m.m||'').slice(0,120);for(const k in clients)if(+k!==m.id&&players[k]&&players[k].room===p.room)clients[k].ev.push({t:'chat',nm:p.nm,m:msg})}
  else if(m.t==='freq'||m.t==='facc'||m.t==='inv'){const ev={t:m.t,to:String(m.to||'').slice(0,16),from:p.nm};if(m.t==='inv')ev.room=String(m.room||'').toUpperCase().slice(0,8);
   for(const k in clients)if(+k!==m.id&&players[k]&&players[k].nm===ev.to)clients[k].ev.push(ev)}
  return}
 res.writeHead(404);res.end();
}).listen(PORT,'0.0.0.0',()=>{
 console.log('\nVoxel Fury server chal raha hai.\n  Is laptop par:   http://localhost:'+PORT);
 for(const l of Object.values(os.networkInterfaces()))for(const a of l)if(a.family==='IPv4'&&!a.internal)console.log('  Doosre computer: http://'+a.address+':'+PORT);
});
setInterval(()=>{const now=Date.now();for(const id in players)if(now-players[id].seen>10000)drop(id);
 for(const id in clients){const c=clients[id];if(!c.res)continue;
  const me=players[id];if(!me)continue;const p=Object.values(players).filter(o=>o.id!==+id&&o.room===me.room).map(o=>Object.assign({},o,{ac:now-(o.s||0)<5000?1:0}));c.res.write('data: '+JSON.stringify({p,ev:c.ev})+'\n\n');c.ev=[]}},50);
