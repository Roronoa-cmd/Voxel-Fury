/* VOXEL FURY 3D - core engine. Data (maps/guns/skins) lives in ../data/ */
const $=i=>document.getElementById(i);
window.addEventListener('error',e=>{const b=$('err');b.style.display='block';b.textContent='Error: '+e.message+' (line '+e.lineno+')'});
if(typeof THREE==='undefined'){$('lobby').innerHTML='<h2 style="margin:auto;text-align:center">three.js load nahi hua.<br>Internet check karo aur page reload karo.</h2>';throw new Error('three.js missing')}
const R=Math.random,PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ================= settings ================= */
/* levels 0-100: total xp needed for level l */
const LV_MAX=100,xpAt=l=>Math.round(30*l+4.5*l*l);
function lvOf(xp){let l=0;while(l<LV_MAX&&xp>=xpAt(l+1))l++;return l}
const DIFF=[{spread:1.8,dmg:4,react:.7,turn:1.8},{spread:1.1,dmg:8,react:.4,turn:3.4},{spread:.65,dmg:11,react:.22,turn:5},{spread:.35,dmg:15,react:.1,turn:8}];
/* game modes */
const MODES={
 ffa:{id:'ffa',n:'Free For All',icon:'⚔️',desc:'25 kills ya 5 min – sab ek doosre ke khilaf',limit:25,time:300,team:0,knifeOnly:0,gunOnly:0},
 tdm:{id:'tdm',n:'Team Deathmatch',icon:'🛡️',desc:'Red vs Blue – pehli team 20 kills',limit:20,time:300,team:1,knifeOnly:0,gunOnly:0},
 pc: {id:'pc', n:'Point Capture',icon:'🏴',desc:'Center flag pakdo aur 120 sec rok lo',limit:999,time:300,team:1,knifeOnly:0,gunOnly:0,point:1},
 ko: {id:'ko', n:'Knife Only',icon:'🗡️',desc:'Sirf knife – 15 kills',limit:15,time:240,team:0,knifeOnly:1,gunOnly:0},
 ar: {id:'ar', n:'AR Only',icon:'🔫',desc:'Sirf Assault Rifle – 20 kills',limit:20,time:300,team:0,knifeOnly:0,gunOnly:'ar'},
 sg: {id:'sg', n:'Shotgun Only',icon:'💥',desc:'Sirf Shotgun – 15 kills · close range chaos',limit:15,time:240,team:0,knifeOnly:0,gunOnly:'sg'},
 sn: {id:'sn', n:'Sniper Only',icon:'🎯',desc:'Sirf Sniper – 15 kills · long range duel',limit:15,time:300,team:0,knifeOnly:0,gunOnly:'sn'}
};
let LIMIT=25,MATCH_TIME=300;
let S={map:'meadow',skin:'samurai',gskin:'default',prim:'ar',sec:'rv',mel:'kn',bots:12,diff:1,nick:'Player',fov:90,sens:100,vol:80,gs:100,gv:100,gc:1,gp:1,fps:0,xcol:0,inv:0,created:0,av:'#ff8a1e',xp:0,kills:0,deaths:0,wins:0,matches:0,mode:'ffa'};
let curMode=MODES.ffa,teamScore=[0,0],pointTimer=0,pointHolder=-1;
try{Object.assign(S,JSON.parse(localStorage.getItem('voxelFury3d')||'{}'))}catch(e){}
const LV=()=>lvOf(S.xp);
function sanitize(){S.xp=Math.max(0,+S.xp||0);const lv=LV(),ok=(k,t)=>WP[S[k]]&&WP[S[k]].slot===t&&WP[S[k]].lv<=lv;
 if(!MAPS[S.map])S.map='meadow';if(!ok('prim',1))S.prim='ar';if(!ok('sec',2))S.sec='rv';if(!ok('mel',3))S.mel='kn';if(!SK[S.skin]||SK[S.skin].lv>lv)S.skin='samurai';if(!GUNSKINS[S.gskin]||GUNSKINS[S.gskin].lv>lv)S.gskin='default'}
sanitize();
const save=()=>{try{localStorage.setItem('voxelFury3d',JSON.stringify(S))}catch(e){}};

/* ================= texture pack (procedural 16x16 pixel tiles) ================= */
const hs=(x,y,s)=>{const t=Math.sin(x*12.9898+y*78.233+(s||0)*37.719)*43758.5453;return t-Math.floor(t)};
const nz=(x,y,s,a)=>(hs(x,y,s)-.5)*a;
const TF=[
/*0 grass top*/(x,y)=>{const k=nz(x,y,1,46);return[78+k,150+k,52+k*.5]},
/*1 grass side*/(x,y)=>y<3+(hs(x,0,9)>.55?1:0)?TF[0](x,y):TF[2](x,y),
/*2 dirt*/(x,y)=>{const k=nz(x,y,2,34),sp=hs(x,y,3)>.9?-26:0;return[130+k+sp,94+k+sp,64+k+sp]},
/*3 stone*/(x,y)=>{const k=nz(x,y,4,30),c=hs(x>>2,y>>2,5)>.78?-24:0;return[124+k+c,124+k+c,130+k+c]},
/*4 brick*/(x,y)=>{const r=y>>2,off=(r&1)*4,m=(y&3)===0||((x+off)&7)===0,k=nz(x,y,6,26);return m?[176+k*.4,170+k*.4,158+k*.4]:[168+k,72+k*.6,56+k*.6]},
/*5 planks*/(x,y)=>{const l=(y&3)===0,k=nz(x>>1,y,7,24);return l?[96,64,32]:[184+k,142+k,84+k*.7]},
/*6 crate*/(x,y)=>{const e=x<2||x>13||y<2||y>13,d=Math.abs(x-y)<2||Math.abs(x+y-15)<2,k=nz(x,y,8,18);return e?[112+k,72+k,30]:d?[150+k,100+k,46]:[196+k,146+k,74+k*.7]},
/*7 sand*/(x,y)=>{const k=nz(x,y,9,24);return[226+k,204+k,142+k]},
/*8 sandstone*/(x,y)=>{const k=nz(x,y,10,18),l=(y%5)===0?-24:0;return[212+k+l,182+k+l,122+k+l]},
/*9 metal*/(x,y)=>{const e=x%8===0||y%8===0,rv=(x%8)===2&&(y%8)===2,k=nz(x,y,11,12);return e?[48,54,66]:rv?[160,170,185]:[92+k,102+k,118+k]},
/*10 snow top*/(x,y)=>{const k=nz(x,y,12,12);return[240+k,244+k,252]},
/*11 snow side*/(x,y)=>y<4?TF[10](x,y):TF[2](x,y),
/*12 ice*/(x,y)=>{const k=nz(x,y,13,22),l=((x+y)%9)===0?18:0;return[150+k+l,200+k+l,238+l]},
/*13 neon cyan*/(x,y)=>{const e=x%8===0||y%8===0;return e?[40,230,255]:[16+nz(x,y,14,10),30,42]},
/*14 neon pink*/(x,y)=>{const e=x%8===0||y%8===0;return e?[255,60,200]:[36,16+nz(x,y,15,10),40]},
/*15 log side*/(x,y)=>{const k=nz(x,0,16,30)+nz(x,y,17,8);return[104+k,74+k,42+k*.6]},
/*16 log top*/(x,y)=>{const r=Math.hypot(x-7.5,y-7.5),k=((r|0)%2)*22;return[170-k,128-k,76-k]},
/*17 leaves*/(x,y)=>{const k=nz(x,y,18,80),h=hs(x,y,19)>.82?-40:0;return[46+k*.4+h,118+k+h,40+k*.4+h]},
/*18 dark tile*/(x,y)=>{const e=x%8===0||y%8===0,k=nz(x,y,20,10);return e?[22,24,34]:[50+k,54+k,70+k]},
/*19 concrete*/(x,y)=>{const k=nz(x,y,21,24);return[150+k,150+k,146+k]}];
const atlasCv=document.createElement('canvas');atlasCv.width=128;atlasCv.height=48;
(function(){const g=atlasCv.getContext('2d'),im=g.createImageData(128,48);
 TF.forEach((f,i)=>{const ox=(i&7)*16,oy=(i>>3)*16;for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=f(x,y),p=((oy+y)*128+ox+x)*4;im.data[p]=cl(c[0],0,255);im.data[p+1]=cl(c[1],0,255);im.data[p+2]=cl(c[2],0,255);im.data[p+3]=255}});
 g.putImageData(im,0,0)})();
const atlas=new THREE.CanvasTexture(atlasCv);atlas.magFilter=THREE.NearestFilter;atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;

/* ================= renderer / scenes ================= */
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'})}catch(e){$('lobby').innerHTML='<h2 style="margin:auto;text-align:center">WebGL support nahi mila. Chrome/Edge update karo.</h2>';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.autoClear=false;
$('game').appendChild(renderer.domElement);const cv=renderer.domElement;
const scene=new THREE.Scene(),vmScene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,340);cam.rotation.order='YXZ';scene.add(cam);
const vmCam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.01,10);
scene.add(new THREE.AmbientLight(0xffffff,.85));const sun=new THREE.DirectionalLight(0xffffff,.55);sun.position.set(.4,1,.3);scene.add(sun);
vmScene.add(new THREE.AmbientLight(0xffffff,.95));const vsun=new THREE.DirectionalLight(0xffffff,.7);vsun.position.set(.5,1,.8);vmScene.add(vsun);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);cam.aspect=vmCam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();vmCam.updateProjectionMatrix()});

/* ================= voxel world ================= */
const NX=112,NZ=112,NY=48;const V=new Uint8Array(NX*NY*NZ);
const vox=(x,y,z)=>{if(y<0||x<0||z<0||x>=NX||z>=NZ)return 1;if(y>=NY)return 0;return V[(y*NZ+z)*NX+x]};
const setV=(x,y,z,t)=>{if(x>=0&&z>=0&&x<NX&&z<NZ&&y>=0&&y<NY)V[(y*NZ+z)*NX+x]=t};
let HM=null;
function genMap(T){
 V.fill(0);let s=T.seed;const K=T.key,G=1,rr=()=>(s=(s*16807)%2147483647)/2147483647,ir=(a,b)=>a+Math.floor(rr()*(b-a+1));
 const box=(x,y,z,w,h,d,t)=>{for(let j=y;j<y+h;j++)for(let k=z;k<z+d;k++)for(let i=x;i<x+w;i++)setV(i,j,k,t)};
 const occ=[],hit=(x,z,w,d,p)=>occ.some(o=>x<o[0]+o[2]+p&&x+w+p>o[0]&&z<o[1]+o[3]+p&&z+d+p>o[1]),res=(x,z,w,d)=>occ.push([x,z,w,d]);
 const hh=(i,j,q)=>{const t=Math.sin(i*127.1+j*311.7+q*74.7)*43758.5453;return t-Math.floor(t)},sm=t=>t*t*(3-2*t);
 const vn=(x,z,c,q)=>{x/=c;z/=c;const i=Math.floor(x),j=Math.floor(z),fx=sm(x-i),fz=sm(z-j),a=hh(i,j,q),b=hh(i+1,j,q),e=hh(i,j+1,q),d=hh(i+1,j+1,q);return a+(b-a)*fx+(e-a)*fz+(a-b-e+d)*fx*fz};
 const fb=(x,z,q)=>vn(x,z,30,q+T.seed)*.6+vn(x,z,14,q+5)*.3+vn(x,z,6,q+9)*.1;
 const H=new Int16Array(NX*NZ);HM=H;const gh=(x,z)=>H[z*NX+x];
 const col=(x,z,h,t)=>{for(let y=0;y<NY;y++)setV(x,y,z,y<h?t:0);H[z*NX+x]=h};
 const terrain=(fn,t)=>{for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++)H[z*NX+x]=cl(Math.round(fn(x,z)),1,NY-14);
  for(let p=0,ch=1;p<60&&ch;p++){ch=0;for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){let m=H[z*NX+x];if(x>0)m=Math.min(m,H[z*NX+x-1]+1);if(x<NX-1)m=Math.min(m,H[z*NX+x+1]+1);if(z>0)m=Math.min(m,H[(z-1)*NX+x]+1);if(z<NZ-1)m=Math.min(m,H[(z+1)*NX+x]+1);if(m<H[z*NX+x]){H[z*NX+x]=m;ch=1}}}
  for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++)col(x,z,gh(x,z),t)};
 const pil=(x,z,y,t)=>{for(let j=gh(x,z);j<y;j++)setV(x,j,z,t)};
 const lvl=(x,z,w,d,p,h0,t)=>{if(h0==null){let a=0;for(let k=z;k<z+d;k++)for(let i=x;i<x+w;i++)a+=gh(i,k);h0=Math.round(a/(w*d))}
  for(let k=z-p;k<z+d+p;k++)for(let i=x-p;i<x+w+p;i++){if(i<1||k<1||i>=NX-1||k>=NZ-1)continue;const r=Math.max(x-i,i-x-w+1,z-k,k-z-d+1,0),o=gh(i,k),n=r?Math.max(h0-r,Math.min(h0+r,o)):h0;if(n!==o)col(i,k,n,t||G)}return h0};
 const pit=(cx,cz,r,y,wt)=>{for(let z=cz-r-9;z<=cz+r+9;z++)for(let x=cx-r-9;x<=cx+r+9;x++){if(x<2||z<2||x>=NX-2||z>=NZ-2)continue;const d=Math.hypot(x-cx,z-cz);if(d>=r+9)continue;const o=gh(x,z),n=d<r?y:Math.max(y,Math.min(o,y+Math.ceil(d-r)));col(x,z,n,G);if(d<r)setV(x,y-1,z,wt)}res(cx-r-3,cz-r-3,2*r+7,2*r+7)};
 const road=(x0,z0,x1,z1,w,t)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(z1-z0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),z=Math.round(z0+(z1-z0)*i/n);for(let a=0;a<w;a++)for(let b=0;b<w;b++){const X=x+a,Z=z+b;if(X>0&&Z>0&&X<NX-1&&Z<NZ-1&&!vox(X,gh(X,Z),Z))setV(X,gh(X,Z)-1,Z,t)}}};
 const stairs=(x,z,g,dir,n,wd,t)=>{const dx=[1,-1,0,0][dir],dz=[0,0,1,-1][dir];for(let i=0;i<n;i++)for(let k=0;k<wd;k++)pil(x+dx*i+(dz?k:0),z+dz*i+(dx?k:0),g+n-i,t)};
 const spot=(w,d,p,fl)=>{for(let n=0;n<80;n++){const x=ir(5,NX-w-6),z=ir(5,NZ-d-6);if(hit(x,z,w,d,p))continue;let lo=99,hi=0;for(let k=z;k<z+d;k+=2)for(let i=x;i<x+w;i+=2){const v=gh(i,k);lo=Math.min(lo,v);hi=Math.max(hi,v)}if(hi-lo>(fl||3))continue;res(x-p,z-p,w+2*p,d+2*p);return[x,z]}return null};
 const house=(x,z,w,d,h,wl,rf)=>{const g=lvl(x,z,w,d,3),mx=x+(w>>1)-1;box(x,g,z,w,h,d,wl);box(x+1,g,z+1,w-2,h-1,d-2,0);box(mx,g,z,2,3,1,0);box(mx,g,z+d-1,2,3,1,0);
  for(let i=2;i<w-2;i+=3){box(x+i,g+1,z,1,1,1,0);box(x+i,g+1,z+d-1,1,1,1,0)}for(let i=2;i<d-2;i+=3){box(x,g+1,z+i,1,1,1,0);box(x+w-1,g+1,z+i,1,1,1,0)}
  box(x-1,g+h,z-1,w+2,1,d+2,rf);box(x,g+h+1,z,w,1,d,rf);if(w>4&&d>4)box(x+1,g+h+2,z+1,w-2,1,d-2,rf);stairs(x-2,z+(d>>1)-1,g,1,h+1,2,wl);return g};
 const tower=(x,z,w,h,wl,tp,dir)=>{const g=lvl(x,z,w,w,3);box(x,g,z,w,h,w,wl);for(let i=0;i<w;i+=2){box(x+i,g+h,z,1,1,1,tp);box(x+i,g+h,z+w-1,1,1,1,tp);box(x,g+h,z+i,1,1,1,tp);box(x+w-1,g+h,z+i,1,1,1,tp)}
  const o=[[x+w,z+(w>>1)-1],[x-1,z+(w>>1)-1],[x+(w>>1)-1,z+w],[x+(w>>1)-1,z-1]][dir];stairs(o[0],o[1],g,dir,h,2,wl);return g};
 const tree=(x,z)=>{const g=gh(x,z),t=ir(3,5);box(x,g,z,1,t,1,7);box(x-2,g+t-1,z-2,5,2,5,8);box(x-1,g+t+1,z-1,3,1,3,8);setV(x,g+t+2,z,8)};
 const pine=(x,z)=>{const g=gh(x,z),t=ir(5,8);box(x,g,z,1,t,1,7);for(let l=0;l<t-1;l+=2){const r=Math.max(0,(t-2-l)>>1);box(x-r,g+2+l,z-r,2*r+1,2,2*r+1,8)}setV(x,g+t,z,8)};
 const palm=(x,z)=>{const g=gh(x,z),h=ir(5,7);box(x,g,z,1,h,1,7);box(x-2,g+h,z,5,1,1,8);box(x,g+h,z-2,1,1,5,8);box(x-1,g+h+1,z-1,3,1,3,8)};
 const mound=(x,z,r,t)=>{const g=gh(x,z);for(let k=0;k<r;k++)for(let j=-(r-k);j<=r-k;j++)for(let i=-(r-k);i<=r-k;i++)pil(x+i,z+j,g+k+1,t)};
 const cover=n=>{for(let i=0;i<n;i++){const p=spot(3,3,1,1);if(p){const g=lvl(p[0],p[1],2,2,1);box(p[0],g,p[1],2,ir(1,2),2,5)}}};
 (MAPGEN[K]||MAPGEN.cyber)({T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover});
 for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++)if(x<1||z<1||x>=NX-1||z>=NZ-1)for(let y=gh(x,z);y<gh(x,z)+10;y++)setV(x,y,z,3);
}
const FACES=[
 {n:[1,0,0],c:[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],sh:.8,t:1},
 {n:[-1,0,0],c:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],sh:.8,t:1},
 {n:[0,1,0],c:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],sh:1,t:0},
 {n:[0,-1,0],c:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],sh:.55,t:2},
 {n:[0,0,1],c:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],sh:.9,t:1},
 {n:[0,0,-1],c:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]],sh:.9,t:1}];
const AOB=[.45,.62,.8,1];
function aoF(x,y,z,f,c){const na=f.n[0]?0:f.n[1]?1:2,a1=(na+1)%3,a2=(na+2)%3,b=[x+f.n[0],y+f.n[1],z+f.n[2]],p1=b.slice(),p2=b.slice(),p3=b.slice(),d1=c[a1]*2-1,d2=c[a2]*2-1;
 p1[a1]+=d1;p2[a2]+=d2;p3[a1]+=d1;p3[a2]+=d2;
 const s1=vox(p1[0],p1[1],p1[2])?1:0,s2=vox(p2[0],p2[1],p2[2])?1:0,s3=vox(p3[0],p3[1],p3[2])?1:0;
 return AOB[(s1&&s2)?0:3-(s1+s2+s3)]}
function buildMesh(T){
 const pos=[],uv=[],col=[],idx=[];let n=0;
 for(let y=0;y<NY;y++)for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){
  const t=V[(y*NZ+z)*NX+x];if(!t)continue;
  for(let fi=0;fi<6;fi++){const f=FACES[fi];if(vox(x+f.n[0],y+f.n[1],z+f.n[2]))continue;
   const ti=T.pal[t][f.t],c0=ti&7,r0=ti>>3,u0=(c0*16+.15)/128,u1=((c0+1)*16-.15)/128,v1=1-(r0*16+.15)/48,v0=1-((r0+1)*16-.15)/48;
   const UV=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
   for(let k=0;k<4;k++){const c=f.c[k];pos.push(x+c[0],y+c[1],z+c[2]);uv.push(UV[k][0],UV[k][1]);const a=aoF(x,y,z,f,c)*f.sh;col.push(a,a,a)}
   idx.push(n,n+1,n+2,n,n+2,n+3);n+=4}}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);
 return new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:atlas,vertexColors:true}))}
let TH=null,world=null,skyTex=null,CLOUDS=[];
function loadMap(key){
 TH=MAPS[key];TH.key=key;genMap(TH);
 if(world){scene.remove(world);world.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 world=new THREE.Group();CLOUDS=[];world.add(buildMesh(TH));
 if(TH.cl){const cm=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.88,fog:false});
  for(let i=0;i<26;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(8+R()*14,1.8,6+R()*8),cm);m.position.set((R()-.5)*320+NX/2,64+R()*12,(R()-.5)*320+NX/2);world.add(m);CLOUDS.push(m)}}
 else{const p=[];for(let i=0;i<500;i++){const a=R()*PI*2,b=R()*1.2+.1,r=240;p.push(NX/2+Math.cos(a)*Math.cos(b)*r,Math.sin(b)*r,NZ/2+Math.sin(a)*Math.cos(b)*r)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));world.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,fog:false})))}
 scene.add(world);scene.fog=new THREE.Fog(new THREE.Color(TH.fog),TH.fd[0],TH.fd[1]);
 const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,TH.sky[0]);gr.addColorStop(1,TH.sky[1]);g.fillStyle=gr;g.fillRect(0,0,2,256);
 if(skyTex)skyTex.dispose();skyTex=new THREE.CanvasTexture(c);scene.background=skyTex;applyGfx()}

/* ================= graphics & options ================= */
const BASEPR=Math.min(devicePixelRatio||1,1.5),XC=['#ffffff','#40ff70','#ff4040','#40e0ff','#ffe14d'];
const PRESETS={low:{gs:60,gv:60,gc:0,gp:0},med:{gs:80,gv:80,gc:1,gp:1},high:{gs:100,gv:100,gc:1,gp:1},ultra:{gs:130,gv:130,gc:1,gp:1}};
function applyGfx(){renderer.setPixelRatio(cl(BASEPR*S.gs/100,.4,2.5));renderer.setSize(innerWidth,innerHeight);
 if(scene.fog&&TH){scene.fog.near=TH.fd[0]*S.gv/100;scene.fog.far=TH.fd[1]*S.gv/100}
 for(const c of CLOUDS)c.visible=!!S.gc}
function syncPre(){let v='';for(const k in PRESETS){const p=PRESETS[k];if(['gs','gv','gc','gp'].every(o=>S[o]===p[o]))v=k}$('pre').value=v}
function optHook(k){if(k==='vol'&&OUT)OUT.gain.value=S.vol/100;if(k==='gs'||k==='gv'||k==='gc')applyGfx();
 if(k==='xcol')document.documentElement.style.setProperty('--xc',XC[S.xcol]||XC[0]);if(k==='fps')$('fps').style.display=S.fps?'block':'none';
 if(['gs','gv','gc','gp'].includes(k))syncPre()}
function setOpt(k,v){S[k]=v;save();document.querySelectorAll('[data-opt="'+k+'"]').forEach(i=>{if(i.type==='checkbox')i.checked=!!v;else i.value=v});
 document.querySelectorAll('[data-val="'+k+'"]').forEach(s=>s.textContent=v);optHook(k)}

/* ================= physics / raycast ================= */
function boxHit(x,y,z,r,h){const x0=Math.floor(x-r),x1=Math.floor(x+r),z0=Math.floor(z-r),z1=Math.floor(z+r),y0=Math.floor(y),y1=Math.floor(y+h);
 for(let j=y0;j<=y1;j++)for(let k=z0;k<=z1;k++)for(let i=x0;i<=x1;i++)if(vox(i,j,k))return true;return false}
function moveEnt(e,dt){const r=e.r,h=e.h;e.hitX=e.hitZ=false;
 let n=e.x+e.vx*dt;if(boxHit(n,e.y,e.z,r,h)){e.hitX=true;e.vx=0}else e.x=n;
 n=e.z+e.vz*dt;if(boxHit(e.x,e.y,n,r,h)){e.hitZ=true;e.vz=0}else e.z=n;
 e.vy-=25*dt;if(e.vy<-40)e.vy=-40;n=e.y+e.vy*dt;e.ground=false;
 if(boxHit(e.x,n,e.z,r,h)){if(e.vy<0){e.y=Math.floor(n)+1;e.ground=true}else e.y=Math.ceil(n+h)-h-.001;e.vy=0}else e.y=n}
function castVox(ox,oy,oz,dx,dy,dz,max){
 let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);
 const sx=dx>0?1:-1,sy=dy>0?1:-1,sz=dz>0?1:-1,tdx=dx?Math.abs(1/dx):1e30,tdy=dy?Math.abs(1/dy):1e30,tdz=dz?Math.abs(1/dz):1e30;
 let tmx=dx?(dx>0?(x+1-ox):(ox-x))*tdx:1e30,tmy=dy?(dy>0?(y+1-oy):(oy-y))*tdy:1e30,tmz=dz?(dz>0?(z+1-oz):(oz-z))*tdz:1e30,t=0;
 while(t<max){if(vox(x,y,z))return t;
  if(tmx<tmy&&tmx<tmz){t=tmx;tmx+=tdx;x+=sx}else if(tmy<tmz){t=tmy;tmy+=tdy;y+=sy}else{t=tmz;tmz+=tdz;z+=sz}}
 return max}
function rayBox(ox,oy,oz,dx,dy,dz,e){const mn=[e.x-e.r,e.y,e.z-e.r],mx=[e.x+e.r,e.y+e.h,e.z+e.r],o=[ox,oy,oz],d=[dx,dy,dz];let t0=0,t1=1e9;
 for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-8){if(o[i]<mn[i]||o[i]>mx[i])return -1}else{let a=(mn[i]-o[i])/d[i],b=(mx[i]-o[i])/d[i];if(a>b){const t=a;a=b;b=t}if(a>t0)t0=a;if(b<t1)t1=b;if(t0>t1)return -1}}
 return t0}
function hitscan(src,ox,oy,oz,dx,dy,dz,range){let bt=castVox(ox,oy,oz,dx,dy,dz,range),be=null,head=false;
 for(const e of ents){if(e===src||e.dead||(curMode.team&&src&&e.team===src.team))continue;const t=rayBox(ox,oy,oz,dx,dy,dz,e);if(t>=0&&t<bt){bt=t;be=e;head=(oy+dy*t)>e.y+1.35}}
 return{t:bt,e:be,head}}
const los=(ax,ay,az,bx,by,bz)=>{const dx=bx-ax,dy=by-ay,dz=bz-az,d=Math.hypot(dx,dy,dz);if(d<.01)return true;return castVox(ax,ay,az,dx/d,dy/d,dz/d,d)>=d-.05};
const validCell=(x,z)=>{const i=Math.floor(x),k=Math.floor(z);if(i<2||k<2||i>=NX-2||k>=NZ-2)return false;const g=HM[k*NX+i];return g>0&&vox(i,g-1,k)&&!vox(i,g,k)&&!vox(i,g+1,k)&&!vox(i,g+2,k)&&!vox(i,g+3,k)&&!(TH&&TH.wt&&V[((g-1)*NZ+k)*NX+i]===TH.wt)};
function pickSpawn(avoid,minD){let best=null,bs=-1;
 for(let i=0;i<90;i++){const x=ri(2,NX-3)+.5,z=ri(2,NZ-3)+.5;if(!validCell(x,z))continue;
  let m=99,vis=false;for(const a of avoid){if(a.dead)continue;const d=Math.hypot(a.x-x,a.z-z);m=Math.min(m,d);if(d<30&&los(a.x,a.y+1.5,a.z,x,HM[Math.floor(z)*NX+Math.floor(x)]+1.5,z))vis=true}
  if(m<minD||vis)continue;if(m>bs){bs=m;best={x,z,y:HM[Math.floor(z)*NX+Math.floor(x)]}}}
 if(!best)for(let i=0;i<600;i++){const x=ri(2,NX-3)+.5,z=ri(2,NZ-3)+.5;if(validCell(x,z)){best={x,z,y:HM[Math.floor(z)*NX+Math.floor(x)]};break}}
 return best||{x:NX/2+.5,z:NZ/2+8.5,y:HM[(NZ/2+8)*NX+NX/2]}}

/* ================= entities ================= */
let state='menu',paused=false,locked=false,noLock=false,everLocked=false,gt=0,matchT=MATCH_TIME,ents=[],P=null,VM={},FX=[],FEED=[],kbT=0;
const keys={};let mouseL=false,adsOn=false,ads=0,vmKick=0,flashT=0,bt=0,orbit=0,last=0,fc=0,ft=0,lastFlyby=-99;
const BOTN=['BlockHead','Pixelator','xXSniperXx','CubeKing','NoobSlayer','Creeper99','Stevey','Zombified','MineRush','LagLord','Vortex','TNTime'];
const BOTC=[0x3a7bd5,0xd53a3a,0x3ad56b,0xd5a63a,0x8f3ad5,0x3ad5d0,0xd5603a,0x6b6b6b];
function mkEnt(name,bot){return{name,bot,x:0,y:1,z:0,vx:0,vy:0,vz:0,yaw:0,pit:0,hp:100,dead:false,deadT:0,ground:false,r:.3,h:1.7,kills:0,deaths:0,inv:0,hitX:false,hitZ:false,lastHit:-99}}
const mat=c=>new THREE.MeshLambertMaterial({color:c});
function mkNoiseTex(fn){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d'),im=g.createImageData(16,16);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=cl(fn(x,y),0,255),p=(y*16+x)*4;im.data[p]=im.data[p+1]=im.data[p+2]=v;im.data[p+3]=255}g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t}
const METALT=mkNoiseTex((x,y)=>205+nz(x,y,31,46)-((y&3)===0?22:0));
const WOODT=mkNoiseTex((x,y)=>205+Math.sin(x*1.4+nz(x,y,32,3))*26+nz(x,y,33,18));
const FABT=mkNoiseTex((x,y)=>228+nz(x,y,34,26)-(((x+y)&1)?10:0));
const RUBT=mkNoiseTex((x,y)=>200+nz(x,y,35,50));
function mkFace(th){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d'),hx=n=>'#'+n.toString(16).padStart(6,'0');
 if(th.robot){g.fillStyle='#161a20';g.fillRect(0,0,16,16);g.fillStyle='#2b323d';g.fillRect(1,1,14,14);g.fillStyle=hx(th.vis);g.fillRect(2,5,12,3);g.fillStyle='#fff';g.fillRect(3,6,2,1);g.fillRect(11,6,2,1);g.fillStyle='#0d1015';for(let i=0;i<5;i++)g.fillRect(4+i*2,11,1,3)}
 else if(th.mask){g.fillStyle='#141824';g.fillRect(0,0,16,16);g.fillStyle=hx(th.skin);g.fillRect(1,5,14,4);g.fillStyle='#fff';g.fillRect(3,6,3,2);g.fillRect(10,6,3,2);g.fillStyle=hx(th.vis);g.fillRect(4,6,1,2);g.fillRect(11,6,1,2);g.fillStyle='#000';g.fillRect(4,7,1,1);g.fillRect(11,7,1,1)}
 else{g.fillStyle=hx(th.skin);g.fillRect(0,0,16,16);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,12,16,4);g.fillStyle='#2a1e16';g.fillRect(0,0,16,3);g.fillStyle='#fff';g.fillRect(3,6,3,2);g.fillRect(10,6,3,2);g.fillStyle=hx(th.vis);g.fillRect(4,6,2,2);g.fillRect(10,6,2,2);g.fillStyle='#111';g.fillRect(4,7,1,1);g.fillRect(11,7,1,1);g.fillStyle='#2a1e16';g.fillRect(3,5,3,1);g.fillRect(10,5,3,1);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(7,8,2,2);g.fillStyle='#7a2f26';g.fillRect(6,11,4,1)}
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t}
function mkTag(name,col){const c=document.createElement('canvas');c.width=192;c.height=40;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,4,192,32);x.fillStyle='#'+col.toString(16).padStart(6,'0');x.fillRect(0,4,4,32);x.fillRect(188,4,4,32);x.font='bold 22px sans-serif';x.textAlign='center';x.fillStyle='#fff';x.fillText(name,96,28);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));sp.scale.set(1.5,.31,1);return sp}
function mkBotMesh(b,th){
 b.th=th;const g=new THREE.Group();g.rotation.order='YXZ';b.mats=[];
 const M=(c,t)=>{const m=new THREE.MeshLambertMaterial({color:c,map:t||FABT});b.mats.push(m);return m};
 const GL=c=>new THREE.MeshBasicMaterial({color:c});
 const bx=(par,w,h,d,m,x,y,z,rx)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);if(rx)me.rotation.x=rx;par.add(me);return me};
 const cy=(par,r,len,m,x,y,z)=>{const geo=new THREE.CylinderGeometry(r,r,len,10);geo.rotateX(PI/2);const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);par.add(me);return me};
 const pv=(par,x,y,z)=>{const p=new THREE.Group();p.position.set(x,y,z);par.add(p);return p};
 const mP=M(th.pants),mS=M(th.shirt),mV=M(th.vest),mH=M(th.helm,METALT),mD=M(0x1a1c22,RUBT),mB=M(0x1c1814,RUBT),mSk=M(th.skin),mM=M(0x30343b,METALT),mHair=M(th.robot?0x39414d:0x2a1e16),gA=GL(th.ac),gV=GL(th.vis);
 for(const s of [-1,1]){const l=pv(g,s*.11,.64,0);bx(l,.17,.36,.18,mP,0,-.18,0);bx(l,.16,.22,.17,mP,0,-.47,0);bx(l,.15,.08,.05,mV,0,-.38,-.1);bx(l,.19,.12,.27,mB,0,-.58,-.04);bx(l,.2,.03,.28,mD,0,-.63,-.04);if(s<0)b.legL=l;else b.legR=l}
 bx(g,.48,.07,.28,mD,0,.67,0);bx(g,.08,.05,.02,gA,0,.67,-.145);
 bx(g,.46,.5,.26,mS,0,.96,0);bx(g,.49,.34,.29,mV,0,1.03,0);
 for(const s of [-1,1]){bx(g,.1,.1,.04,mD,s*.13,.93,-.16);bx(g,.1,.03,.04,gA,s*.13,.99,-.16)}
 bx(g,.17,.025,.01,gA,0,1.15,-.151);
 for(const s of [-1,1]){bx(g,.19,.1,.25,mV,s*.32,1.27,0);bx(g,.19,.02,.26,gA,s*.32,1.325,0)}
 bx(g,.13,.07,.13,mD,0,1.31,0);
 bx(g,.32,.4,.14,mD,0,1.0,.21);bx(g,.05,.3,.02,gA,.09,1.0,.285);bx(g,.05,.3,.02,gA,-.09,1.0,.285);
 const ag=pv(g,0,1.2,0);b.ag=ag;
 const mkArm=(s,len,rx)=>{const a=pv(ag,s*.3,0,0);a.rotation.set(rx,0,-s*.45);bx(a,.14,len,.14,mS,0,-len/2,0);bx(a,.155,.06,.155,gA,0,-len+.08,0);bx(a,.12,.12,.13,mD,0,-len-.03,0)};
 mkArm(1,.55,1.4);mkArm(-1,.72,1.5);
 const gg=pv(ag,0,-.08,-.58);b.gun=gg;
 bx(gg,.07,.09,.4,mM,0,0,.02);bx(gg,.056,.012,.3,mD,0,.05,0);bx(gg,.062,.07,.22,mD,0,-.005,-.2);cy(gg,.013,.18,mD,0,.012,-.42);cy(gg,.02,.05,mD,0,.012,-.52);
 bx(gg,.05,.14,.07,mD,0,-.11,-.02,.15);bx(gg,.05,.1,.06,mD,0,-.08,.12,-.25);bx(gg,.06,.09,.2,mD,0,-.01,.3);
 bx(gg,.004,.025,.18,gA,.037,0,-.2);bx(gg,.004,.025,.18,gA,-.037,0,-.2);bx(gg,.04,.04,.07,mD,0,.075,-.01);bx(gg,.03,.03,.004,GL(0xff3030),0,.08,-.05);
 const fl=new THREE.Group();fl.position.set(0,.012,-.6);
 const fm=new THREE.MeshBasicMaterial({color:0xffc15a,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(.3,.3),fm);p.rotation.set(i===2?PI/2:0,i===1?PI/2:0,0);fl.add(p)}
 fl.visible=false;gg.add(fl);b.flash=fl;
 {const wk=b.wk||'ar',sc={smg:[1,1,.75],sg:[1.25,1.2,.95],sn:[.85,.85,1.45],rv:[.8,.8,.5],lmg:[1.25,1.3,1.05]}[wk];if(sc)gg.scale.set(sc[0],sc[1],sc[2]);
 const rc=(r,l,m,x,y,z,ax)=>{const geo=new THREE.CylinderGeometry(r,r,l,14);if(ax==='x')geo.rotateZ(PI/2);else geo.rotateX(PI/2);const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);gg.add(me)};
 if(wk==='sn'){rc(.032,.26,mD,0,.1,-.02);rc(.038,.03,gA,0,.1,-.15)}
 if(wk==='sg')rc(.04,.2,mM,0,-.04,-.28);
 if(wk==='lmg')rc(.085,.08,mM,0,-.12,-.02,'x');
 if(wk==='smg')bx(gg,.04,.16,.06,mD,0,-.12,-.06);
 if(curMode.team)bx(g,.24,.07,.24,GL(b.team?0x3b82f6:0xff3b3b),0,1.9,0)}
 const kn=pv(ag,0,-.08,-.5);b.knife=kn;bx(kn,.045,.06,.16,mD,0,0,.06);bx(kn,.03,.05,.04,mM,0,0,-.03);bx(kn,.02,.045,.36,GL(0xdfe6ee),0,0,-.23);kn.visible=false;
 const hd=pv(g,0,1.3,0);b.head=hd;
 const faceM=(th.robot||th.mask)?new THREE.MeshBasicMaterial({map:mkFace(th)}):new THREE.MeshLambertMaterial({map:mkFace(th)});
 const sideM=(th.robot||th.mask)?mHair:mSk;
 const hm=new THREE.Mesh(new THREE.BoxGeometry(.33,.33,.33),[sideM,sideM,mHair,sideM,mHair,faceM]);hm.position.set(0,.17,0);hd.add(hm);
 bx(hd,.37,.1,.37,mH,0,.36,0);bx(hd,.37,.22,.07,mH,0,.2,.17);bx(hd,.04,.2,.32,mH,.175,.22,0);bx(hd,.04,.2,.32,mH,-.175,.22,0);bx(hd,.35,.04,.1,mH,0,.32,-.2);
 if(th.n==='Samurai'){bx(hd,.04,.12,.28,gA,0,.46,-.02);for(const s of [-1,1])bx(hd,.04,.16,.04,gA,s*.12,.5,-.14)}
 else if(th.n==='Robot'){bx(hd,.03,.16,.03,mH,.1,.5,.05);bx(hd,.06,.06,.06,gV,.1,.6,.05)}
 else if(th.n==='Ninja'){bx(hd,.345,.05,.345,gA,0,.29,0);bx(hd,.07,.07,.24,mH,0,.2,.26)}
 else if(th.n==='Soldier'||th.n==='Desert'){bx(hd,.3,.07,.05,gV,0,.31,-.2)}
 else if(th.n==='Cyber'){bx(hd,.04,.04,.34,gA,0,.43,0)}
 else if(th.n==='Gold'){bx(hd,.38,.03,.38,gA,0,.42,0)}
 else{bx(hd,.38,.06,.38,gA,0,.41,0)}
 const tag=mkTag(b.name,th.ac);tag.position.set(0,2.22,0);g.add(tag);b.tag=tag;
 const bgm=new THREE.Sprite(new THREE.SpriteMaterial({color:0x000000,transparent:true,opacity:.6,depthWrite:false}));bgm.scale.set(1.0,.1,1);bgm.position.set(0,2.02,0);bgm.renderOrder=1;g.add(bgm);
 const fgm=new THREE.Sprite(new THREE.SpriteMaterial({color:0x4cff6a,transparent:true,depthWrite:false}));fgm.scale.set(.96,.07,1);fgm.position.set(0,2.02,0);fgm.renderOrder=2;g.add(fgm);b.hb=[bgm,fgm];
 scene.add(g);b.mesh=g;b.ph=R()*6;b.seed=R()*6;b.pit=0;b.recoil=0;b.flashT=0;b.hitFl=0}
function animBot(b,dt){const g=b.mesh;g.position.set(b.x,b.y,b.z);g.rotation.y=b.yaw;
 if(b.dead){g.rotation.x=Math.min(1,b.deadT*3)*1.5;b.tag.visible=false;b.hb[0].visible=b.hb[1].visible=false;g.visible=b.deadT<2.6;return}
 g.visible=true;g.rotation.x=0;b.tag.visible=true;
 const sp=Math.hypot(b.vx,b.vz),mv=Math.min(1,sp/3);b.ph+=dt*sp*2.4;const sw=Math.sin(b.ph)*.75*mv;
 b.legL.rotation.x=b.ground?sw:-.5;b.legR.rotation.x=b.ground?-sw:.5;
 b.recoil=Math.max(0,b.recoil-dt*1.2);b.flashT=Math.max(0,b.flashT-dt);b.hitFl=Math.max(0,b.hitFl-dt);
 b.ag.rotation.x=b.pit+Math.abs(Math.sin(b.ph))*.03*mv+b.recoil*.3;
 b.ag.position.y=1.2+Math.sin(gt*2.2+b.seed)*.006+Math.abs(Math.sin(b.ph))*.015*mv;
 b.gun.position.z=-.58+b.recoil*.12;if(b.knife)b.knife.position.z=-.5-b.recoil*.4;b.head.rotation.x=b.pit*.6;
 b.flash.visible=b.flashT>0;if(b.flash.visible)b.flash.rotation.z=R()*3;
 const fl=b.hitFl>0?0xaa2020:0;for(const m of b.mats)m.emissive.setHex(fl);
 const hpr=cl(b.hp/100,0,1),show=hpr<1;b.hb[0].visible=b.hb[1].visible=show;
 if(show){b.hb[1].scale.x=.96*hpr;b.hb[1].position.x=-(1-hpr)*.48;b.hb[1].material.color.setHex(hpr>.5?0x4cff6a:hpr>.25?0xffc23a:0xff3a3a)}}

/* ================= fx ================= */
const TRG=new THREE.BoxGeometry(.025,.025,1),TRM1=new THREE.MeshBasicMaterial({color:0xfff1a0}),TRM2=new THREE.MeshBasicMaterial({color:0xff9a30}),PG=new THREE.BoxGeometry(.07,.07,.07);
const PM={};const pmat=c=>PM[c]||(PM[c]=new THREE.MeshBasicMaterial({color:c}));
function bulletWhizz(a,b,hitPlayer){if(!P||P.dead||hitPlayer||gt-lastFlyby<.14)return;const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],ll=dx*dx+dy*dy+dz*dz;if(ll<.01)return;const px=P.x,py=P.y+1.18,pz=P.z,t=cl(((px-a[0])*dx+(py-a[1])*dy+(pz-a[2])*dz)/ll,.04,.96),x=a[0]+dx*t,y=a[1]+dy*t,z=a[2]+dz*t,d=Math.hypot(px-x,py-y,pz-z);if(d>.55&&d<3.2){lastFlyby=gt;snd('flyby',cl(1-(d-.55)/2.65,.16,.9))}}
function tracer(a,b,k){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<.6)return;
 const m=new THREE.Mesh(TRG,k===1?TRM1:TRM2);m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.lookAt(b[0],b[1],b[2]);m.scale.z=L;scene.add(m);FX.push({m,t:.07,k:0})}
function puff(p,c){if(!S.gp)return;for(let i=0;i<4;i++){const m=new THREE.Mesh(PG,pmat(c));m.position.set(p[0],p[1],p[2]);scene.add(m);FX.push({m,t:.5,k:1,vx:(R()-.5)*3,vy:R()*3,vz:(R()-.5)*3})}}
function updFX(dt){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t-=dt;if(f.k){f.vy-=14*dt;f.m.position.x+=f.vx*dt;f.m.position.y+=f.vy*dt;f.m.position.z+=f.vz*dt}if(f.t<=0){scene.remove(f.m);FX.splice(i,1)}}}
function clearFX(){for(const f of FX)scene.remove(f.m);FX=[]}

/* ================= weapons & viewmodels ================= */
function part(g,w,h,d,c,x,y,z,rx,tex){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c,map:tex||METALT}));m.position.set(x,y,z);if(rx)m.rotation.x=rx;g.add(m);return m}
function glow(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);g.add(m);return m}
function cyl(g,r,len,c,x,y,z,tex){const geo=new THREE.CylinderGeometry(r,r,len,12);geo.rotateX(PI/2);const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c,map:tex||METALT}));m.position.set(x,y,z);g.add(m);return m}
function arm1(g,sk,h,s){const x=h[0],y=h[1],z=h[2];const n0=g.children.length;
 part(g,.085,.07,.11,sk.gl,x,y,z,0,RUBT);part(g,.09,.032,.04,sk.gl,x,y+.045,z-.035,0,RUBT);
 for(let i=0;i<3;i++)part(g,.02,.03,.03,sk.gl,x-.025+i*.025,y+.03,z-.07,0,RUBT);
 part(g,.028,.03,.075,sk.gl,x+s*.05,y+.008,z-.03,0,RUBT);
 part(g,.1,.1,.5,sk.sl,x*1.1,y-.085,z+.27,.35,FABT);part(g,.07,.015,.22,sk.gl,x*1.1,y-.03,z+.27,.35,METALT);glow(g,.108,.108,.025,sk.ac,x*1.02,y-.02,z+.04);if(sk.cuff!=null)part(g,.105,.045,.07,sk.cuff,x*1.1,y-.085,z+.47,.35,RUBT);if(sk.look==='spiky')glow(g,.035,.04,.018,sk.ac,x*1.1,y-.085,z+.24);for(let q=n0;q<g.children.length;q++)g.children[q].userData.arm=1}
function arms(g,sk,rh,lh){if(rh)arm1(g,sk,rh,1);if(lh)arm1(g,sk,lh,-1)}
function mkFlash(x,y,z,s){const f=new THREE.Group();f.position.set(x,y,z);
 const m1=new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}),m2=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
 for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(s,s),m1);p.rotation.set(i===2?PI/2:0,i===1?PI/2:0,0);f.add(p)}
 f.add(new THREE.Mesh(new THREE.PlaneGeometry(s*.45,s*.45),m2));f.visible=false;return f}
const SHL=[],shG=new THREE.BoxGeometry(.012,.012,.03),shM=new THREE.MeshBasicMaterial({color:0xe0b04a});
function ejectShell(){const g=VM[P.slot];if(!g)return;const m=new THREE.Mesh(shG,shM);m.position.set(g.position.x+.05,g.position.y+.05,g.position.z-.03);vmScene.add(m);SHL.push({m,t:.5,vx:.8+R()*.6,vy:1+R()*.6,vz:.6+R()*.5})}
/* open-window red dot / holo sight: frame only, so the target stays visible when aiming */
function dotSight(g,y,z,w){const B=0x121317,h=w*.86;
 part(g,w,.012,.07,B,0,y-h/2-.008,z);part(g,w,.008,.05,B,0,y+h/2,z);part(g,.008,h,.05,B,w/2-.004,y,z);part(g,.008,h,.05,B,-w/2+.004,y,z);
 glow(g,.006,.006,.004,0xff2a2a,0,y,z-.02)}
/* rifle family: parameters per gun */
function mkRifle(g,o,ac,sk){
 const M=o.m,D=o.d,B=0x121317,L=o.L,z0=-L/2,hg=o.hg,bl=o.bl,ze=z0-hg-bl,gz=L/2-.07,mz=gz-.1,sz=L/2;
 /* receiver */
 part(g,.074,.07,L,M,0,-.02,0);part(g,.07,.045,L-.02,D,0,.04,-.01);part(g,.01,.025,.06,0x9aa0a8,.037,.035,z0+L*.35);
 glow(g,.004,.018,L*.55,ac,.038,.012,0);glow(g,.004,.018,L*.55,ac,-.038,.012,0);
 part(g,.054,.008,L*.8,B,0,.0675,0);for(let i=0;i<6;i++)part(g,.056,.007,.01,B,0,.074,z0+.04+i*(L*.8-.06)/5);
 part(g,.012,.03,.04,M,.04,.03,z0+L*.55);
 /* handguard */
 if(o.wd){part(g,.066,.07,hg,o.wd,0,-.012,z0-hg/2+.01,0,WOODT);part(g,.07,.02,hg*.9,o.wd,0,.034,z0-hg/2,0,WOODT);cyl(g,.01,hg*.95,D,0,.047,z0-hg/2)}
 else{part(g,.07,.075,hg,o.hc||D,0,-.012,z0-hg/2+.01);for(let i=0;i<Math.round(hg/.05);i++)part(g,.072,.01,.02,B,0,.03,z0-.03-i*.05);
  glow(g,.004,.025,hg*.7,ac,.037,-.01,z0-hg/2);glow(g,.004,.025,hg*.7,ac,-.037,-.01,z0-hg/2);part(g,.05,.008,hg,B,0,.032,z0-hg/2+.01)}
 /* barrel + muzzle device */
 cyl(g,.0125,bl+.03,B,0,.012,z0-hg-bl/2+.015);let mzz=ze;
 if(o.mz==='sup'){cyl(g,.03,.2,D,0,.012,ze-.06);for(let i=0;i<4;i++)cyl(g,.0315,.008,B,0,.012,ze+.02-i*.045);mzz=ze-.17}
 else if(o.mz==='brake'){cyl(g,.02,.07,M,0,.012,ze-.02);part(g,.044,.006,.02,B,0,.012,ze-.02);part(g,.006,.044,.02,B,0,.012,ze-.02);mzz=ze-.06}
 else if(o.mz==='comp'){cyl(g,.019,.06,D,0,.012,ze-.015);for(let i=0;i<3;i++)part(g,.042,.005,.008,B,0,.012,ze-.005-i*.018);mzz=ze-.05}
 else{cyl(g,.017,.05,B,0,.012,ze-.01);cyl(g,.022,.012,D,0,.012,ze-.04);mzz=ze-.05}
 /* sights */
 if(o.sight==='iron'){part(g,.008,.075,.01,B,0,.065,ze+.04);part(g,.05,.012,.02,B,0,.07,L/2-.03);part(g,.01,.03,.012,B,.013,.0875,L/2-.03);part(g,.01,.03,.012,B,-.013,.0875,L/2-.03)}
 else dotSight(g,.108,z0+L*.3,o.sight==='holo'?.058:.05);
 /* magazine */
 const magStart=g.children.length;
 if(o.mag==='straight'){part(g,.048,.17,.06,B,0,-.15,mz,.1,RUBT);glow(g,.05,.012,.062,ac,0,-.236,mz+.017)}
 else if(o.mag==='smg'){part(g,.044,.22,.05,B,0,-.17,mz+.02,.04,RUBT);glow(g,.046,.012,.052,ac,0,-.282,mz+.028)}
 else if(o.mag==='curved'){for(let i=0;i<4;i++)part(g,.046,.07,.066,B,0,-.1-i*.062,mz-i*.022,i*.14,RUBT);glow(g,.048,.012,.07,ac,0,-.35,mz-.088)}
 else{part(g,.09,.11,.15,D,0,-.12,mz-.03);glow(g,.092,.012,.152,ac,0,-.18,mz-.03);for(let i=0;i<4;i++)part(g,.014,.016,.016,0xe0b04a,.048,-.06+i*.012,mz-.01-i*.02)}
 g.userData.reloadParts=g.children.slice(magStart).map(o=>({o,y:o.position.y}));
 /* grip + trigger guard */
 part(g,.05,.11,.06,B,0,-.1,gz,-.28,RUBT);part(g,.012,.012,.06,D,0,-.062,gz-.055);
 /* stock */
 if(o.stock==='wood'){part(g,.052,.12,.24,o.wd,0,-.03,sz+.12,.12,WOODT);part(g,.058,.13,.03,B,0,-.045,sz+.245,.12,RUBT)}
 else if(o.stock==='fixed'){part(g,.058,.1,.2,D,0,-.012,sz+.1);part(g,.052,.03,.14,M,0,.056,sz+.1);part(g,.06,.11,.03,B,0,-.015,sz+.205,0,RUBT);glow(g,.054,.012,.1,ac,0,-.066,sz+.1)}
 else if(o.stock==='tele'){part(g,.03,.03,.17,D,0,.0,sz+.08);part(g,.05,.1,.04,D,0,-.012,sz+.15);part(g,.06,.11,.026,B,0,-.015,sz+.185,0,RUBT)}
 else{part(g,.05,.06,.04,D,0,-.01,sz+.02)}
 if(o.bipod)for(const s of[-1,1])part(g,.01,.01,.14,B,s*.032,-.05,z0-hg+.06,.5);
 g.userData.sy=o.sight==='iron'?.1:.108;g.userData.muz=[0,.012,mzz];
 arms(g,sk,[0,-.14,gz],[0,-.065,z0-hg*.55])}
/* GUN SKIN: recolors the gun (not the arms) using data/gunskins/*.js */
function applyGunSkin(g){const gs=GUNSKINS[S.gskin];if(!gs||gs.col==null)return;
 const base=new THREE.Color(gs.col),gl=gs.gl!=null?new THREE.Color(gs.gl):null;
 g.traverse(o=>{if(!o.isMesh||o.userData.arm||o.userData.nosk)return;const m=o.material;
  if(m.isMeshLambertMaterial){const c=m.color,L=c.r*.3+c.g*.59+c.b*.11;m.color.copy(base).multiplyScalar(Math.min(1.35,.28+L*1.5))}
  else if(gl&&m.isMeshBasicMaterial&&o.geometry.type==='BoxGeometry')m.color.copy(gl)})}

function mkVM(key){const g=new THREE.Group(),sk=SK[S.skin],ac=sk.ac;
 if(RF[key])mkRifle(g,RF[key],ac,sk);
 else (GUNMODEL[key]||GUNMODEL.kn)(g,sk,ac);
 const mz=g.userData.muz||MUZ[key];if(mz){const f=mkFlash(mz[0],mz[1],mz[2],WP[key].fs||.26);f.traverse(o=>o.userData.nosk=1);g.add(f);g.userData.flash=f}
 g.userData.hip=HIP[key]||[.19,-.2,-.46];g.userData.adsp=ADSP[key]||[0,-(g.userData.sy||.1),-.4];
 applyGunSkin(g);
 g.visible=false;vmScene.add(g);return g}
/* put the loadout from S onto the player (used at match start and live from the pause menu) */
function equip(){const ko=!!curMode.knifeOnly,go=curMode.gunOnly,want=ko?{1:'kn'}:go?{1:go,2:'kn',3:'kn'}:{1:S.prim,2:S.sec,3:S.mel};let ch=false;
 if(ko){for(const s of[2,3]){delete P.W[s];if(VM[s]){vmScene.remove(VM[s]);delete VM[s]}}P.slot=1;P.prev=1}
 for(const s of Object.keys(want).map(Number)){const k=want[s];
  if(!P.W[s]||P.W[s].key!==k){P.W[s]=mkW(k);if(VM[s])vmScene.remove(VM[s]);VM[s]=mkVM(k);if(s===P.slot)ch=true}
  else if(P.skinKey!==S.skin+'|'+S.gskin){if(VM[s])vmScene.remove(VM[s]);VM[s]=mkVM(k)}}
 P.skinKey=S.skin+'|'+S.gskin;if(ch){P.sw=.3;P.rl=0;P.bolt=0;P.cb=0}}
const mkW=k=>Object.assign({key:k,am:WP[k].mag,next:0,pump:0},WP[k]);
const cw=()=>P.W[P.slot];
function setSlot(s){if(!P||P.dead||s===P.slot||!P.W[s])return;P.prev=P.slot;P.slot=s;P.sw=.3;P.rl=0;P.bolt=0}
function startReload(){const w=cw();if(w.melee||P.rl>0||w.am>=w.mag||P.sw>0)return;P.rl=w.rel;snd('rl')}

/* ================= combat ================= */
const feedTxt=(a,w,h,v)=>`<div><b style="color:${a===P?'#ffd24a':'#fff'}">${esc(a.name)}</b> <span class="w">[${esc(w)}]</span> ${h?'💀 ':''}<b style="color:${v===P?'#ffd24a':'#fff'}">${esc(v.name)}</b></div>`;
function damage(v,amt,att,head,wn){if(v.dead||v.inv>0||state!=='play')return;
 if(v.net){if(att===P){const h=$('hm');h.className=head?'h':'';h.style.opacity=1;P.hmT=.15;snd(head?'head':'hit');netSend({t:'hit',to:v.nid,amt,head,wn})}return}
 v.hp-=amt;v.lastHit=gt;if(v.bot)v.hitFl=.12;
 if(v===P){P.att=att;P.attT=gt;snd('hurt');P.dmgT=.9}
 if(att===P){const h=$('hm');h.className=head?'h':'';h.style.opacity=1;P.hmT=.15;snd(head?'head':'hit')}
 if(v.hp<=0)die(v,att,head,wn)}
function die(v,att,head,wn){v.dead=true;v.deadT=0;v.hp=0;v.deaths++;v.vx=v.vz=0;
 if(att&&att!==v){att.kills++;if(curMode.team&&att.team!==undefined)teamScore[att.team]=(teamScore[att.team]||0)+1}
 if(att===P&&v!==P){S.kills++;addXP(head?75:50)}if(v===P)S.deaths++;
 if(v.bot&&v.th){const c=[v.th.shirt,v.th.vest,v.th.ac,v.th.pants];for(let i=0;i<4;i++)puff([v.x,v.y+.9,v.z],c[i])}
 FEED.push({h:att?feedTxt(att,wn,head,v):'',t:gt+5});
 if(v===P){P.killer=att;snd('die');if(att&&att.net)netSend({t:'kill',to:att.nid,head,wn})}
 if(att===P){kbT=1.8;$('kb').textContent=(head?'HEADSHOT! ':'')+'ELIMINATED '+v.name.toUpperCase()+'  +'+(head?75:50)+' XP';snd('die',.5)}
 if(curMode.team){if(teamScore[0]>=LIMIT||teamScore[1]>=LIMIT)endMatch()}
 else if(ents.some(e=>e.kills>=LIMIT))endMatch()}
function respawn(e){const s=pickSpawn(ents.filter(o=>o!==e),12);e.x=s.x;e.z=s.z;e.y=s.y;e.dcd=0;e.dash=0;e.vx=e.vy=e.vz=0;e.hp=100;e.dead=false;e.inv=2;e.deadT=0;e.yaw=R()*PI*2;
 if(e.bot){e.tgt=null;e.vis=false;newWP(e)}else{P.pit=0;P.rl=0;P.sw=0;P.bolt=0;P.slot=1;for(const k in P.W){P.W[k].am=P.W[k].mag;P.W[k].next=0}}}
function fireP(){const w=cw();if(P.dead||P.rl>0||P.sw>0||P.bolt>0||gt<w.next)return;
 if(!w.melee&&w.am<=0){startReload();return}
 w.next=gt+w.rate/1000;P.cb=0;
 const eye=[P.x,P.y+1.55,P.z],cp=Math.cos(P.pit),dir=[-Math.sin(P.yaw)*cp,Math.sin(P.pit),-Math.cos(P.yaw)*cp];
 if(w.melee){P.swing=.28;snd('kn');
  /* lunge — knife lelo to thoda aage bhago */
  if(w.lunge){const sy2=Math.sin(P.yaw),cy2=Math.cos(P.yaw);P.vx-=sy2*w.lunge*18;P.vz-=cy2*w.lunge*18;P.vy=Math.max(P.vy,2.5)}
  const h=hitscan(P,eye[0],eye[1],eye[2],dir[0],dir[1],dir[2],w.range);
  if(h.e){const hd=h.e.hp<40;damage(h.e,w.dmg*(hd?1.5:1),P,hd&&h.head,w.n);puff([eye[0]+dir[0]*h.t,eye[1]+dir[1]*h.t,eye[2]+dir[2]*h.t],0xcc2222);snd('hit',.8)}
  return}
 w.am--;snd(w.snd);
 cam.updateMatrixWorld(true);const mzv=cam.localToWorld(new THREE.Vector3(.2,-.17,-.7)),mz=[mzv.x,mzv.y,mzv.z];
 const moving=Math.hypot(P.vx,P.vz)>1||!P.ground;let spread=(w.sh+(w.sa-w.sh)*ads)*(moving?1.7:1);
 for(let i=0;i<w.pel;i++){const yy=P.yaw+(R()-.5)*2*spread,pp=P.pit+(R()-.5)*2*spread,c=Math.cos(pp),d=[-Math.sin(yy)*c,Math.sin(pp),-Math.cos(yy)*c];
  const h=hitscan(P,eye[0],eye[1],eye[2],d[0],d[1],d[2],w.range),end=[eye[0]+d[0]*h.t,eye[1]+d[1]*h.t,eye[2]+d[2]*h.t];
  if(i<3){tracer(mz,end,1);if(i===0)netSend({t:'f',a:mz,b:end})}
  if(h.e){let dm=w.dmg*(h.head?w.head:1);if(w.fall)dm*=cl(1.25-h.t/28,.25,1);damage(h.e,dm,P,h.head,w.n);puff(end,0xcc2222)}else if(h.t<w.range)puff(end,0xcfcfc0)}
 P.pit=cl(P.pit+w.rec*(1-ads*.4),-1.5,1.5);P.yaw+=(R()-.5)*w.rec*.8;vmKick=1;flashT=.05;w.pump=.5;if(w.ej){ejectShell();snd('shell',.5)}if(w.key==='sg')snd('pump');
 if(w.bolt){P.bolt=w.rate/1000;setTimeout(()=>snd('bolt'),420)}}

/* ================= bots ================= */
function angDiff(a,b){let d=(b-a)%(2*PI);if(d>PI)d-=2*PI;if(d<-PI)d+=2*PI;return d}
function turnTo(e,w,r){const d=angDiff(e.yaw,w);e.yaw+=cl(d,-r,r)}
function newWP(b){if(curMode.point&&R()<.65){b.wx=PT.x+(R()-.5)*9;b.wz=PT.z+(R()-.5)*9;b.stuck=0;return}if(R()<.5&&P&&!P.dead){b.wx=P.x+(R()-.5)*26;b.wz=P.z+(R()-.5)*26}else{for(let i=0;i<12;i++){b.wx=ri(3,NX-4)+.5;b.wz=ri(3,NZ-4)+.5;if(validCell(b.wx,b.wz))break}}b.stuck=0}
const BWK=['ar','smg','sg','sn','rv','lmg'];
const BWC={ar:{g:.11,b:3,r:.5},smg:{g:.07,b:4,r:.45},sg:{g:.9,b:1,r:.5},sn:{g:1.4,b:1,r:.9},rv:{g:.35,b:2,r:.6},lmg:{g:.09,b:6,r:.9}};
const BW=b=>BWC[b.wk]||BWC.ar;
function botFire(b,t,d){const DF=DIFF[S.diff],ex=b.x,ey=b.y+1.4,ez=b.z;
 /* knife / melee mode */
 if(curMode.knifeOnly||(curMode.gunOnly&&curMode.gunOnly==='kn')){
  if(d>3.4)return; // sirf range ke andar attack
  b.recoil=.9;snd('kn',.4);
  const h=hitscan(b,ex,ey,ez,-Math.sin(b.yaw),0,-Math.cos(b.yaw),3.4);
  if(h.e)damage(h.e,WP.kn.dmg*DF.dmg/8,b,false,'Knife');
  return}
 /* gun mode — har bot ki apni weapon */
 const wk=b.wk||'ar',W=WP[wk]||WP.ar;if(wk==='sg'&&d>28)return;
 b.recoil=1;b.flashT=.06;
 const sm={ar:1,smg:1.25,sg:4,sn:.25,rv:.8,lmg:1.5}[wk]||1,dm={ar:1,smg:.75,sg:.4,sn:3.2,rv:1.7,lmg:.95}[wk]||1,pl=wk==='sg'?7:1;
 for(let q=0;q<pl;q++){
  let dx=t.x-ex,dy=t.y+1.1+(R()-.5)*.3-ey,dz=t.z-ez;const L=Math.hypot(dx,dy,dz);dx/=L;dy/=L;dz/=L;
  const sp=(.012+d*.0011)*DF.spread*sm;dx+=(R()-.5)*sp*2;dy+=(R()-.5)*sp*2;dz+=(R()-.5)*sp*2;const L2=Math.hypot(dx,dy,dz);dx/=L2;dy/=L2;dz/=L2;
  const h=hitscan(b,ex,ey,ez,dx,dy,dz,wk==='sg'?44:wk==='sn'?200:90),from=[b.x-Math.sin(b.yaw)*1.15,b.y+1.12,b.z-Math.cos(b.yaw)*1.15],to=[ex+dx*h.t,ey+dy*h.t,ez+dz*h.t];bulletWhizz(from,to,h.e===P);if(q===0||wk!=='sg')tracer(from,to,2);
  if(h.e)damage(h.e,DF.dmg*dm*(h.head?1.6:1),b,h.head,W.n)}
 snd(W.snd||'ar',cl(1-Math.hypot(b.x-P.x,b.z-P.z)/(wk==='sn'?120:60),0,.95),1)}
function botAI(b,dt){
 if(b.dead){b.deadT+=dt;if(b.deadT>3.2)respawn(b);animBot(b,dt);return}
 if(b.inv>0)b.inv-=dt;const DF=DIFF[S.diff];b.think-=dt;const ex=b.x,ey=b.y+1.5,ez=b.z;
 const knifeMode=curMode.knifeOnly;
 if(b.think<=0){b.think=.25+R()*.15;let best=null,bd=knifeMode?18:curMode.gunOnly==='sn'?80:45;
  for(const o of ents){if(o===b||o.dead||o.net||(curMode.team&&o.team===b.team))continue;const d=Math.hypot(o.x-b.x,o.z-b.z);if(d<bd&&(knifeMode||los(ex,ey,ez,o.x,o.y+1.1,o.z))){bd=d;best=o}}
  if(best){if(b.tgt!==best)b.react=DF.react*(.8+R()*.4);b.tgt=best;b.mem=3;b.lx=best.x;b.lz=best.z}else if(b.tgt){b.mem-=.3;if(b.mem<=0)b.tgt=null}
  b.vis=!!best}
 let mx=0,mz=0,sp=knifeMode?6.2:4.6;const t=b.tgt;
 if(t&&b.vis&&!t.dead){
  const dx=t.x-b.x,dz=t.z-b.z,d=Math.hypot(dx,dz)||1,want=Math.atan2(-dx,-dz);turnTo(b,want,dt*DF.turn);b.pit+=(Math.atan2((t.y+1.1)-(b.y+1.2),d)-b.pit)*Math.min(1,dt*8);
  b.st-=dt;if(b.st<=0){b.sd=-b.sd;b.st=.6+R()*1.4}
  /* knife: hamesha paas jao; gun: 5-16 mein sidestep */
  const stopDist=knifeMode?2.2:curMode.gunOnly==='sn'?22:5,fw=d>stopDist?1:knifeMode?0:-1,nx=dx/d,nz2=dz/d;
  mx=nx*fw+(-nz2)*b.sd*(knifeMode?.5:.9);mz=nz2*fw+nx*b.sd*(knifeMode?.5:.9);
  if(b.ground&&(R()<dt*.45||(b.hitX||b.hitZ)))b.vy=8.4;
  b.react-=dt;b.cd-=dt;
  const fireRange=knifeMode?3.4:999;
  if(b.react<=0&&b.cd<=0&&(knifeMode?d<=fireRange:Math.abs(angDiff(b.yaw,want))<.15)){botFire(b,t,d);b.burst--;if(b.burst<=0){b.burst=knifeMode?1+(R()*2|0):BW(b).b+(R()*3|0);b.cd=knifeMode?.35+R()*.3:BW(b).r+R()*.7}else b.cd=knifeMode?.28:BW(b).g}
 }else{
  b.pit*=.92;let tx=b.wx,tz=b.wz;if(b.tgt&&b.mem>0){tx=b.lx;tz=b.lz}
  const dx=tx-b.x,dz=tz-b.z,d=Math.hypot(dx,dz);
  if(d<1.5||b.stuck>1.4)newWP(b);
  else{mx=dx/d;mz=dz/d;turnTo(b,Math.atan2(-dx,-dz),dt*5);
   if(b.hitX||b.hitZ){b.stuck+=dt;if(b.ground)b.vy=8.4}else b.stuck=Math.max(0,b.stuck-dt)}
 }
 const l=Math.hypot(mx,mz),ac=b.ground?Math.min(1,dt*10):Math.min(1,dt*2.5);
 b.vx+=((l>.01?mx/l*sp:0)-b.vx)*ac;b.vz+=((l>.01?mz/l*sp:0)-b.vz)*ac;
 moveEnt(b,dt);animBot(b,dt)}

/* ================= player ================= */
function updPlayer(dt){
 if(P.dead){P.deadT+=dt;if(P.deadT>3)respawn(P);return}
 P.inv-=dt;P.dcd=Math.max(0,(P.dcd||0)-dt);P.dash=Math.max(0,(P.dash||0)-dt);
 if(keys.ArrowLeft)P.yaw+=dt*2.2;if(keys.ArrowRight)P.yaw-=dt*2.2;if(keys.ArrowUp)P.pit=cl(P.pit+dt*1.6,-1.5,1.5);if(keys.ArrowDown)P.pit=cl(P.pit-dt*1.6,-1.5,1.5);
 const w=cw();
 let fx=(keys.KeyD?1:0)-(keys.KeyA?1:0),fy=(keys.KeyW?1:0)-(keys.KeyS?1:0);
 const sprint=!!keys.ShiftLeft&&fy>0&&!adsOn&&P.rl<=0;P.spr=sprint;
 const sp=(sprint?8.4:6.3)*(w.melee?1.12:1)*(1-ads*.4),l=Math.hypot(fx,fy)||1;fx/=l;fy/=l;
 const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),wx=-sy*fy+cy*fx,wz=-cy*fy-sy*fx,ac=P.ground?Math.min(1,dt*12):Math.min(1,dt*3);
 if(P.dash>0){P.vx=P.dvx;P.vz=P.dvz;if(P.vy<0)P.vy*=.3}else{P.vx+=(wx*sp-P.vx)*ac;P.vz+=(wz*sp-P.vz)*ac}
 if(keys.Space&&P.ground){P.vy=8.6;P.ground=false}
 moveEnt(P,dt);
 if(P.y<-10){respawn(P)}
 const spd=Math.hypot(P.vx,P.vz);if(P.ground&&spd>1)bt+=dt*spd*1.5;
 P.sw=Math.max(0,P.sw-dt);P.bolt=Math.max(0,P.bolt-dt);P.cb=Math.max(0,P.cb-dt);P.swing=Math.max(0,P.swing-dt);
 if(P.rl>0){P.rl-=dt;if(P.rl<=0){P.rl=0;w.am=w.mag}}
 w.pump=Math.max(0,w.pump-dt);
 const want=(adsOn&&P.rl<=0&&!w.melee&&P.sw<=0&&P.bolt<=0)?1:0;ads+=(want-ads)*Math.min(1,dt*12);
 if(w.auto?mouseL:P.cb>0)fireP();
 if(!w.melee&&w.am<=0&&P.rl<=0&&gt>=w.next&&P.sw<=0)startReload();
 if(gt-P.lastHit>6&&P.hp<100)P.hp=Math.min(100,P.hp+10*dt)}

function placeCam(dt){
 const w=cw(),asp=innerWidth/innerHeight,zoom=1+(w.zoom-1)*ads,hf=S.fov+(P.spr?5:0)+((P.dash||0)>0?14:0);
 cam.fov=2*Math.atan(Math.tan(hf*PI/360)/asp/zoom)*180/PI;cam.updateProjectionMatrix();
 let ey=P.y+1.55+Math.abs(Math.sin(bt))*.04*(1-ads),roll=0;
 if(P.dead){ey=P.y+1.55-Math.min(1.2,P.deadT*3);roll=Math.min(.8,P.deadT*2)}
 cam.position.set(P.x,ey,P.z);cam.rotation.set(P.pit,P.yaw,roll);
 vmKick=Math.max(0,vmKick-dt*8);flashT=Math.max(0,flashT-dt);for(let i=SHL.length-1;i>=0;i--){const q=SHL[i];q.t-=dt;q.vy-=4*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*12;if(q.t<=0){vmScene.remove(q.m);SHL.splice(i,1)}}
 for(const s in VM)VM[s].visible=false;
 const g=VM[P.slot],scoped=w.scope&&ads>.9;
 if(!g||P.dead||scoped)return;
 const h=g.userData.hip,a=g.userData.adsp;let x=h[0]+(a[0]-h[0])*ads,y=h[1]+(a[1]-h[1])*ads,z=h[2]+(a[2]-h[2])*ads;
 x+=Math.sin(bt*.5)*.008*(1-ads);y+=Math.abs(Math.cos(bt*.5))*.008*(1-ads);z+=vmKick*.05;
 let rx=vmKick*.1,rz=0,ry=0;
 if(P.rl>0){const p=1-P.rl/w.rel;y-=Math.sin(p*PI)*.2;rx-=Math.sin(p*PI)*.6;rz=-Math.sin(p*PI)*.4}
 if(P.sw>0){y-=P.sw/.3*.35}
 if(w.melee){const p=P.swing>0?1-P.swing/.28:1;if(P.swing>0){x-=Math.sin(p*PI)*.25;rz=Math.sin(p*PI)*1.2;rx=-Math.sin(p*PI)*.5;ry=Math.sin(p*PI)*.5}else{rx=-.4;rz=.2}}
 if(P.spr&&!w.melee){rx+=.25;ry=-.35;y-=.03}
 if(g.userData.pump)g.userData.pump.position.z=Math.sin(Math.min(1,w.pump/.5)*PI)*.12*(w.pump>0?1:0);
 if(g.userData.bolt){g.userData.bolt.position.z=g.userData.boltZ+(P.bolt>0?Math.sin(Math.min(1,P.bolt/(w.rate/1000))*PI)*.08:0)}
 if(g.userData.reloadParts){const p=P.rl>0?1-P.rl/(w.rel||1):0,drop=Math.sin(cl((p-.12)/.56,0,1)*PI)*.15;for(const m of g.userData.reloadParts)m.o.position.y=m.y-drop}
 g.position.set(x,y,z);g.rotation.set(rx,ry,rz);g.visible=true;
 if(g.userData.flash){g.userData.flash.visible=flashT>0;g.userData.flash.rotation.z=R()*3}}

/* ================= HUD ================= */
const el={hpf:$('hpf'),hpn:$('hpn'),wn:$('wn'),am:$('am'),sc:$('sc'),feed:$('feed'),msg:$('msg'),slots:$('slots'),kb:$('kb'),dmg:$('dmg'),dir:$('dirind'),xh:$('xh'),scope:$('scope'),death:$('death'),deathS:$('deaths'),hm:$('hm'),sb:$('sb'),sbb:$('sbb'),note:$('note'),toast:$('toast')};
const setT=(e,t)=>{if(e._t!==t){e._t=t;e.textContent=t}};const setH=(e,h)=>{if(e._h!==h){e._h=h;e.innerHTML=h}};
function board(){return ents.slice().sort((a,b)=>b.kills-a.kills||a.deaths-b.deaths)}
const kdOf=e=>(e.deaths?e.kills/e.deaths:e.kills).toFixed(2);
function rowHTML(e,i){const medal=['🥇','🥈','🥉'][i]||(i+1),tag=e===P?'<span class="tg y">YOU</span>':e.net?'<span class="tg n">PLAYER</span>':e.bot?'<span class="tg b">BOT</span>':'';
 const dot=curMode.team?`<i class="td" style="background:${e.team?'#3b82f6':'#ff3b3b'}"></i>`:'';
 return `<tr class="${e===P?'me':''}${e.dead?' dd':''}"><td>${medal}</td><td>${dot}${esc(e.name)}${tag}</td><td>${e.kills}</td><td>${e.deaths}</td><td>${kdOf(e)}</td></tr>`}
function boardHTML(){const b=board();if(!curMode.team)return b.map(rowHTML).join('');
 let h='';const order=(teamScore[1]||0)>(teamScore[0]||0)?[1,0]:[0,1];
 for(const t of order){const L=b.filter(e=>(e.team?1:0)===t);h+=`<tr class="sec t${t}"><td colspan="2">${t?'🔵 BLUE TEAM':'🔴 RED TEAM'}</td><td colspan="3">${teamScore[t]||0} kills</td></tr>`+L.map(rowHTML).join('')}
 return h}
function sbHead(){const m=Math.max(0,Math.ceil(matchT));let h=`<span>${curMode.icon} ${curMode.n}</span><span>⏱ ${Math.floor(m/60)}:${('0'+m%60).slice(-2)}</span>`;
 h+=curMode.team?`<span class="r">🔴 ${teamScore[0]||0}</span><span class="b">🔵 ${teamScore[1]||0}</span>`:`<span>🎯 First to ${LIMIT}</span>`;return h}
const DASHF=$('dashf'),DFX=$('dfx');
function doDash(){if(!P||P.dead||paused||P.dcd>0)return;const fx=(keys.KeyD?1:0)-(keys.KeyA?1:0),fy=(keys.KeyW?1:0)-(keys.KeyS?1:0),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);let wx=-sy*fy+cy*fx,wz=-cy*fy-sy*fx;if(!fx&&!fy){wx=-sy;wz=-cy}const l=Math.hypot(wx,wz)||1;P.dvx=wx/l*30;P.dvz=wz/l*30;P.dash=.22;P.dcd=2.5;snd('dash')}
function hudSync(dt){const w=cw();DASHF.style.width=(100-Math.min(100,(P.dcd||0)/2.5*100))+'%';DFX.style.opacity=(P.dash||0)>0?.9:0;
 el.hpf.style.width=P.hp+'%';setT(el.hpn,Math.ceil(P.hp));setT(el.wn,w.n.toUpperCase());setT(el.am,w.melee?'—':w.am+' / ∞');
 setH(el.slots,[1,2,3].filter(s=>P.W[s]).map(s=>`<div class="sl${s===P.slot?' on':''}"><b>${s}</b>${P.W[s].n}</div>`).join(''));
 const lead=board()[0],m=Math.max(0,Math.ceil(matchT)),ss=m%60;
 let scTxt=`LVL ${LV()}  ·  YOU ${P.kills}  ·  `;
 if(curMode.team)scTxt+=`🔴${teamScore[0]}  🔵${teamScore[1]}  ·  `;
 else scTxt+=`TOP ${lead.kills}  ·  `;
 if(curMode.point){const ph=pointHolder;scTxt+=(ph>=0?`🏴 Team ${ph===0?'🔴':'🔵'} holding ${Math.ceil(pointTimer)}s  ·  `:'🏴 Uncaptured  ·  ')}
 scTxt+=`⏱ ${Math.floor(m/60)}:${ss<10?'0':''}${ss}  ·  ${curMode.n}`;
 setT(el.sc,scTxt);
 setH(el.feed,FEED.filter(f=>f.t>gt).map(f=>f.h).join(''));
 setT(el.msg,P.rl>0?'RELOADING…':(!w.melee&&w.am<=0?'EMPTY':''));
 setT(el.note,noLock?'Mouse lock blocked — arrow keys se aim karo (Esc = pause). Better: file ko seedha browser me kholo.':(!locked&&!paused?'Mouse lock ke liye screen par click karo':''));
 kbT=Math.max(0,kbT-dt);el.kb.style.opacity=Math.min(1,kbT*2);toastT=Math.max(0,toastT-dt);el.toast.style.opacity=Math.min(1,toastT*1.5);
 P.dmgT=Math.max(0,(P.dmgT||0)-dt);el.dmg.style.opacity=Math.min(.85,P.dmgT)+(P.hp<30&&!P.dead?.25:0);
 if(P.hmT>0){P.hmT-=dt;if(P.hmT<=0)el.hm.style.opacity=0}
 const age=gt-(P.attT||-99);
 if(P.att&&age<1.3&&!P.dead){const dx=P.att.x-P.x,dz=P.att.z-P.z,fxv=-Math.sin(P.yaw),fzv=-Math.cos(P.yaw),rxv=Math.cos(P.yaw),rzv=-Math.sin(P.yaw);
  el.dir.style.transform='rotate('+Math.atan2(dx*rxv+dz*rzv,dx*fxv+dz*fzv)+'rad)';el.dir.style.opacity=1-age/1.3}else el.dir.style.opacity=0;
 const scoped=w.scope&&ads>.9;el.scope.style.display=scoped?'block':'none';el.xh.style.display=(ads>.3&&!w.melee)||scoped||P.dead?'none':'block';
 if(P.dead){el.death.style.display='flex';setT(el.deathS,(P.killer&&P.killer!==P?'Killed by '+P.killer.name+' · ':'')+'Respawn in '+Math.max(0,Math.ceil(3-P.deadT)))}else el.death.style.display='none';
 if(keys.Tab){el.sb.style.display='flex';setH($('sbh'),sbHead());setH(el.sbb,boardHTML())}else el.sb.style.display='none'}

/* ================= xp / level ================= */
let toastT=0;
function toast(t,s){$('toast').textContent=t;toastT=s||3}
function addXP(n){const o=LV();S.xp+=n;if(P)P.gain=(P.gain||0)+n;const l=LV();
 if(l>o){const un=[];for(const k in WP)if(WP[k].lv>o&&WP[k].lv<=l)un.push(WP[k].n);for(const k in SK)if(SK[k].lv>o&&SK[k].lv<=l)un.push(SK[k].n+' skin');for(const k in GUNSKINS)if(GUNSKINS[k].lv>o&&GUNSKINS[k].lv<=l)un.push(GUNSKINS[k].n+' gun skin');
  if(P)P.unl=(P.unl||[]).concat(un);toast('⭐ LEVEL UP! '+l+(un.length?' · UNLOCKED: '+un.join(', '):''),4.5);snd('lvup');renderLists()}
 save()}

/* ================= match flow ================= */
function mkKnifeW(){return{key:'kn',...WP.kn,n:WP.kn.n,am:0,mag:0,next:0}}
function applyModeToLoadout(e){
 if(!e.W)e.W={};
 const m=curMode;
 if(m.knifeOnly){e.W={1:mkKnifeW()};e.slot=1;e.prev=1}
 else if(m.gunOnly){const gk=m.gunOnly,gw=Object.assign({},WP[gk]);gw.am=gw.mag||30;gw.next=0;e.W[1]=gw;e.W[2]=mkKnifeW();e.W[3]=mkKnifeW();e.slot=1}}
function startMatch(){
 initAudio();S.nick=($('nick').value||'Player').trim().slice(0,14)||'Player';save();
 curMode=MODES[S.mode]||MODES.ffa;LIMIT=curMode.limit;MATCH_TIME=curMode.time;
 teamScore=[0,0];pointTimer=0;pointHolder=-1;
 if(!TH||TH.key!==S.map)loadMap(S.map);
 cleanup();
 P=mkEnt(S.nick,false);Object.assign(P,{slot:1,prev:2,sw:0,rl:0,bolt:0,cb:0,swing:0,spr:false,dmgT:0,hmT:0,att:null,attT:-99,killer:null});
 P.team=(NET.on&&curMode.team)?NET.team:0;P.W={};P.skinKey=null;P.gain=0;P.lvFrom=LV();P.unl=[];equip();
 P.slot=1;
 P.sw=0;
 ents=[P];const names=BOTN.slice().sort(()=>R()-.5),ths=BOTTH.slice().sort(()=>R()-.5);
 for(let i=0;i<(NET.room||S.priv?0:S.bots);i++){const b=mkEnt(names[i%names.length],true);
  Object.assign(b,{think:R()*.3,react:.4,cd:1,burst:3,st:1,sd:R()<.5?1:-1,tgt:null,mem:0,vis:false,stuck:0});
  b.team=curMode.team?(i<Math.floor(S.bots/2)?0:1):0;b.wk=(curMode.gunOnly&&curMode.gunOnly!=='kn')?curMode.gunOnly:BWK[i%BWK.length];
  mkBotMesh(b,ths[i%ths.length]);b.gun.visible=!curMode.knifeOnly;b.knife.visible=!!curMode.knifeOnly;ents.push(b);
  if(curMode.knifeOnly||curMode.gunOnly){if(!b.W)b.W={};applyModeToLoadout(b)}}
 for(const e of ents){const s=pickSpawn(ents.filter(o=>o!==e&&o.placed),14);e.x=s.x;e.z=s.z;e.y=s.y;e.dcd=0;e.dash=0;e.yaw=R()*PI*2;e.placed=true;if(e.bot)newWP(e)}
 FEED=[];kbT=0;gt=0;matchT=MATCH_TIME;ads=0;mouseL=false;adsOn=false;vmKick=0;
 spawnFlag();
 state='play';paused=false;$('lobby').style.display='none';$('hud').style.display='block';$('pause').style.display='none';$('over').style.display='none';
 for(const k in keys)keys[k]=0;lock()}
/* ── Point Capture flag object ── */
let flagMesh=null,PT={x:0,z:0,y:4};
function findPT(){const c0=NX/2,c1=NZ/2;let best=null,bs=-1;for(let r=0;r<=22;r+=2)for(let a=0;a<12;a++){const x=Math.floor(c0+Math.cos(a*.5236)*r),z=Math.floor(c1+Math.sin(a*.5236)*r);if(!validCell(x+.5,z+.5))continue;const h=HM[z*NX+x];let ok=0;for(let dx=-4;dx<=4;dx+=4)for(let dz=-4;dz<=4;dz+=4){const xx=x+dx,zz=z+dz;if(validCell(xx+.5,zz+.5)&&Math.abs(HM[zz*NX+xx]-h)<=1)ok++}if(ok>bs){bs=ok;best={x:x+.5,z:z+.5,y:h};if(ok===9)return best}}return best||{x:c0,z:c1,y:HM[Math.round(c1)*NX+Math.round(c0)]}}
function spawnFlag(){
 if(flagMesh){scene.remove(flagMesh);flagMesh=null}
 if(!curMode.point)return;
 const g=new THREE.Group();
 /* pole */
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,3,8),new THREE.MeshLambertMaterial({color:0xaaaaaa}));
 pole.position.set(0,1.5,0);g.add(pole);
 /* flag cloth */
 const flag=new THREE.Mesh(new THREE.BoxGeometry(1.2,.7,.05),new THREE.MeshBasicMaterial({color:0xffdd00}));
 flag.position.set(.65,2.9,0);g.add(flag);
 /* capture radius ring (flat) */
 const ringG=new THREE.RingGeometry(5.8,6.2,32);
 const ringM=new THREE.MeshBasicMaterial({color:0xffdd00,transparent:true,opacity:.5,side:THREE.DoubleSide});
 const ring=new THREE.Mesh(ringG,ringM);ring.rotation.x=-Math.PI/2;ring.position.y=.05;g.add(ring);
 /* inner fill */
 const fill=new THREE.Mesh(new THREE.CircleGeometry(5.8,32),new THREE.MeshBasicMaterial({color:0xffdd00,transparent:true,opacity:.08,side:THREE.DoubleSide}));
 fill.rotation.x=-Math.PI/2;fill.position.y=.04;g.add(fill);
 ring.material.depthTest=false;ring.renderOrder=5;fill.material.opacity=.18;
 const cyl=new THREE.Mesh(new THREE.CylinderGeometry(6,6,14,40,1,true),new THREE.MeshBasicMaterial({color:0xffdd00,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));cyl.position.y=7;g.add(cyl);
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,40,12,1,true),new THREE.MeshBasicMaterial({color:0xffee88,transparent:true,opacity:.35,depthWrite:false}));beam.position.y=20;g.add(beam);
 g.userData.cyl=cyl;g.userData.beam=beam;g.userData.flag=flag;g.userData.ring=ring;g.userData.fill=fill;
 PT=findPT();g.position.set(PT.x,PT.y+.1,PT.z);
 scene.add(g);flagMesh=g;for(const e of ents)if(e.bot)newWP(e)}
function updateFlag(dt){
 if(!flagMesh||!curMode.point)return;
 const t2=Date.now()*.001;
 flagMesh.userData.flag.material.color.setHex(pointHolder===0?0xff4444:pointHolder===1?0x4488ff:0xffdd00);
 flagMesh.userData.ring.material.color.setHex(pointHolder===0?0xff4444:pointHolder===1?0x4488ff:0xffdd00);
 {const hc=pointHolder===0?0xff4444:pointHolder===1?0x4488ff:0xffdd00;flagMesh.userData.cyl.material.color.setHex(hc);flagMesh.userData.beam.material.color.setHex(hc);flagMesh.userData.fill.material.color.setHex(hc)}flagMesh.userData.flag.position.y=2.9+Math.sin(t2*2)*.08;
 flagMesh.userData.ring.material.opacity=.3+Math.abs(Math.sin(t2*1.5))*.3}
function cleanup(){for(const e of ents)if(e.mesh){scene.remove(e.mesh)}if(flagMesh){scene.remove(flagMesh);flagMesh=null}for(const s in VM)vmScene.remove(VM[s]);VM={};for(const s of SHL)vmScene.remove(s.m);SHL.length=0;clearFX();ents=[]}
function endMatch(){if(state!=='play')return;state='over';mouseL=false;adsOn=false;
 if(document.pointerLockElement)document.exitPointerLock();
 const b=board();S.matches++;let won=b[0]===P,ttl;
 if(curMode.team){let w=teamScore[0]===teamScore[1]?-1:teamScore[0]>teamScore[1]?0:1;if(curMode.point&&pointHolder>=0&&pointTimer>=120)w=pointHolder;won=w>=0&&w===(P.team?1:0);ttl=w<0?'🤝 DRAW':won?'🏆 VICTORY!':'DEFEAT — '+(w?'🔵 BLUE':'🔴 RED')+' TEAM WINS'}
 else ttl=won?'🏆 VICTORY!':'MATCH OVER — '+b[0].name+' wins';
 if(won)S.wins++;addXP(100+(won?300:0));$('overt').textContent=ttl;$('overb').innerHTML=boardHTML();
 {const l=LV();$('overx').innerHTML=`+${P.gain} XP · LEVEL ${P.lvFrom}${l>P.lvFrom?' → <b>'+l+'</b> 🎉':''} (${l>=LV_MAX?'MAX':(S.xp-xpAt(l))+' / '+(xpAt(l+1)-xpAt(l))+' XP'})`+(P.unl.length?`<br>🔓 Unlocked: ${esc(P.unl.join(', '))}`:'')}
 renderProfile();
 $('hud').style.display='none';$('sb').style.display='none';$('pause').style.display='none';$('over').style.display='flex'}
function toLobby(){cleanup();renderProfile();renderLists();state='menu';paused=false;if(document.pointerLockElement)document.exitPointerLock();
 $('hud').style.display='none';$('pause').style.display='none';$('over').style.display='none';$('sb').style.display='none';$('lobby').style.display='flex'}
function update(dt){gt+=dt;matchT-=dt;if(matchT<=0){endMatch();return}
 updPlayer(dt);for(const e of ents){if(e.net)netUpdate(e,dt);else if(e.bot)botAI(e,dt)}
 if(NET.id&&P&&(NET.q+=dt)>=.05){NET.q=0;netSend({t:'s',x:P.x,y:P.y,z:P.z,yaw:P.yaw,pit:P.pit,dead:P.dead?1:0,k:P.kills,d:P.deaths,nm:S.nick,tm:P.team})}
 updFX(dt);updateFlag(dt);
 /* point capture mode */
 if(curMode.point){
  const rad=6;let c0=0,c1=0;
  for(const e of ents){if(e.dead)continue;if(Math.hypot(e.x-PT.x,e.z-PT.z)<rad){if(e.team===0)c0++;else c1++}}
  const capTeam=c0&&!c1?0:c1&&!c0?1:-1;
  if(capTeam>=0){
   if(pointHolder===capTeam){pointTimer+=dt;if(pointTimer>=120){endMatch()}}
   else{pointHolder=capTeam;pointTimer=0}
  }
 }
}

/* ================= input ================= */
function lock(){try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;if(locked)everLocked=true;
 if(state==='play'){paused=!locked&&!noLock;$('pause').style.display=paused?'flex':'none';if(paused){mouseL=false;adsOn=false}}});
document.addEventListener('pointerlockerror',()=>{if(!everLocked&&state==='play'){noLock=true;paused=false;$('pause').style.display='none'}});
addEventListener('mousemove',e=>{if(state!=='play'||paused||!P||P.dead||!(locked||noLock&&false))return;
 const w=cw(),k=.0022*(S.sens/100)/(1+(w.zoom-1)*ads*.9);P.yaw-=e.movementX*k;P.pit=cl(P.pit-e.movementY*k*(S.inv?-1:1),-1.5,1.5)});
addEventListener('mousedown',e=>{if(state!=='play'||paused||!P)return;
 if(!locked&&!noLock){lock();return}
 if(e.button===0){mouseL=true;P.cb=.18}if(e.button===2)adsOn=true});
addEventListener('mouseup',e=>{if(e.button===0)mouseL=false;if(e.button===2)adsOn=false});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{if(state!=='play'||paused||!P)return;const d=e.deltaY>0?1:-1;setSlot(((P.slot-1+d+3)%3)+1)},{passive:true});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;mouseL=false;adsOn=false});
addEventListener('keydown',e=>{
 if(state==='play'&&['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 keys[e.code]=1;if(state!=='play'||!P)return;
 if(e.code==='Escape'&&noLock){paused=!paused;$('pause').style.display=paused?'flex':'none';return}
 if(paused)return;
 if(e.code==='Digit1')setSlot(1);if(e.code==='Digit2')setSlot(2);if(e.code==='Digit3')setSlot(3);if(e.code==='KeyQ')setSlot(P.prev);if(e.code==='KeyR')startReload();if(e.code==='KeyE')doDash()});
addEventListener('keyup',e=>{keys[e.code]=0});
$('play').onclick=pressPlay;$('resume').onclick=()=>{if(noLock){paused=false;$('pause').style.display='none'}else lock()};
$('leave').onclick=toLobby;$('again').onclick=pressPlay;$('tolobby').onclick=toLobby;

/* ================= lobby UI ================= */
function mkList(id,items,cur,fn){const box=$(id);box.innerHTML='';
 for(const it of items){const d=document.createElement('div');d.className='card'+(it.id===cur?' on':'');d.innerHTML=(it.col?`<span class="sw" style="background:${it.col}"></span>`:'')+`<div>${esc(it.n)}${it.sub?`<small>${esc(it.sub)}</small>`:''}</div>`;
  d.onclick=()=>{fn(it.id);[...box.children].forEach(c=>c.classList.remove('on'));d.classList.add('on')};box.appendChild(d)}}
function renderMaps(){mkList('maps',Object.keys(MAPS).map(k=>({id:k,n:MAPS[k].n,col:MAPS[k].c})),S.map,k=>{S.map=k;save();loadMap(k)})}renderMaps();
function fillList(id,items,key){const box=$(id);if(!box)return;box.innerHTML='';const lv=LV();
 for(const it of items.sort((a,b)=>a.lv-b.lv)){const lk=lv<it.lv,d=document.createElement('div');d.className='card'+(S[key]===it.id?' on':'')+(lk?' lock':'');
  const skinBadge=it.skinCls?`<span class="gskin ${it.skinCls}">${esc(it.skin)}</span>`:'';
  d.innerHTML=(it.col?`<span class="sw" style="background:${it.col}"></span>`:'')+`<div>${esc(it.n)}${skinBadge}<small>${lk?'🔒 Unlocks at LVL '+it.lv:esc(it.sub||('LVL '+it.lv))}</small></div>`;
  d.onclick=()=>{if(LV()<it.lv)return;S[key]=it.id;save();renderLists();if(state==='play'&&P)equip();if(key==='skin')drawCharPreview()};box.appendChild(d)}}
function renderLists(){const wl=t=>Object.keys(WP).filter(k=>WP[k].slot===t).map(k=>({id:k,n:WP[k].n,sub:WP[k].d,lv:WP[k].lv,skin:WP[k].skin,skinCls:WP[k].skinCls})),
 gs=()=>Object.keys(GUNSKINS).map(k=>({id:k,n:GUNSKINS[k].n,col:GUNSKINS[k].col==null?'#8a8f99':'#'+GUNSKINS[k].col.toString(16).padStart(6,'0'),lv:GUNSKINS[k].lv})),
 sl=()=>Object.keys(SK).map(k=>({id:k,n:SK[k].n,col:'#'+SK[k].sl.toString(16).padStart(6,'0'),lv:SK[k].lv}));
 for(const p of['L_','P_']){fillList(p+'prim',wl(1),'prim');fillList(p+'sec',wl(2),'sec');fillList(p+'mel',wl(3),'mel');fillList(p+'skin',sl(),'skin');fillList(p+'gskin',gs(),'gskin')}}
function renderProfile(){const l=LV(),a=xpAt(l),b=l>=LV_MAX?a:xpAt(l+1),pc=l>=LV_MAX?100:(S.xp-a)/(b-a)*100,av=$('pav');
 av.style.background=S.av;av.textContent=(S.nick||'P')[0].toUpperCase();$('pnm').textContent=S.nick;$('plv').textContent='⭐ LVL '+l;$('pxf').style.width=pc+'%';
 $('pxt').textContent=l>=LV_MAX?'MAX LEVEL':(S.xp-a)+' / '+(b-a)+' XP to next level';$('pst').textContent=S.kills+' kills · '+S.wins+' wins'}
/* render mode list */
function renderModes(){const box=$('modeList');box.innerHTML='';
 for(const k in MODES){const m=MODES[k];const d=document.createElement('div');
  d.className='mcard'+(S.mode===k?' on':'');
  d.innerHTML=`<div class="micon">${m.icon}</div><div><div style="font-size:13px">${m.n}</div><small style="font-weight:500;color:#8f8bd0;font-size:11px">${m.desc}</small></div>`;
  d.onclick=()=>{S.mode=k;save();[...box.children].forEach(c=>c.classList.remove('on'));d.classList.add('on')};box.appendChild(d)}}
renderModes();

/* 2D character preview on lobby */
function drawCharPreview(){const cv=$('charCv');if(!cv)return;const g=cv.getContext('2d');g.clearRect(0,0,120,180);const sk=SK[S.skin];const sl='#'+sk.sl.toString(16).padStart(6,'0'),gl='#'+sk.gl.toString(16).padStart(6,'0'),ac='#'+sk.ac.toString(16).padStart(6,'0');
 /* body */g.fillStyle=sl;g.fillRect(38,70,44,54);
 /* vest */g.fillStyle=gl;g.fillRect(42,74,36,46);
 /* accent stripe */g.fillStyle=ac;g.fillRect(42,74,36,5);
 /* head and face */g.fillStyle=sk.face?'#'+sk.face.toString(16).padStart(6,'0'):'#e2ac7e';g.fillRect(40,36,40,38);g.fillStyle=sk.look==='masked'?gl:'#e2ac7e';g.fillRect(44,42,32,25);
 /* transformation hair and face details */if(sk.look==='spiky'){g.fillStyle=sk.hair?'#'+sk.hair.toString(16).padStart(6,'0'):'#17120d';g.beginPath();g.moveTo(39,43);g.lineTo(43,26);g.lineTo(49,37);g.lineTo(54,18);g.lineTo(59,36);g.lineTo(66,22);g.lineTo(68,38);g.lineTo(79,29);g.lineTo(76,45);g.closePath();g.fill()}else{g.fillStyle='#11131b';g.fillRect(40,35,40,9);g.fillStyle=ac;g.fillRect(40,46,40,4)}
 /* eyes */g.fillStyle=sk.look==='spiky'?ac:'#fff';g.fillRect(49,51,8,5);g.fillRect(63,51,8,5);g.fillStyle='#171717';g.fillRect(53,52,2,4);g.fillRect(66,52,2,4);if(sk.look==='masked'){g.fillStyle=gl;g.fillRect(44,58,32,10);g.fillStyle=ac;g.fillRect(47,60,26,2)}
 /* arms */g.fillStyle=sl;g.fillRect(20,70,18,42);g.fillRect(82,70,18,42);
 /* legs */g.fillStyle=gl;g.fillRect(40,124,18,44);g.fillRect(62,124,18,44);
 /* feet */g.fillStyle='#333';g.fillRect(38,164,22,8);g.fillRect(60,164,22,8);
 /* gun */const gsk=GUNSKINS[S.gskin];g.fillStyle=gsk&&gsk.col!=null?'#'+gsk.col.toString(16).padStart(6,'0'):'#555';g.fillRect(82,84,16,8);g.fillRect(93,82,5,12);
 /* name */g.fillStyle='#fff';g.font='bold 11px Segoe UI';g.textAlign='center';g.fillText(S.nick.slice(0,10)||'Player',60,175);
 g.strokeStyle=ac;g.lineWidth=2;g.strokeRect(1,1,118,178)}
drawCharPreview();
$('nick').oninput=e=>{S.nick=e.target.value.trim().slice(0,14)||'Player';save();renderProfile();drawCharPreview()};

renderLists();
$('nick').value=S.nick;$('bots').value=S.bots;$('diff').value=S.diff;
document.querySelectorAll('[data-opt]').forEach(i=>{const k=i.dataset.opt;if(i.type==='checkbox'){i.checked=!!S[k];i.onchange=()=>setOpt(k,i.checked?1:0)}else{i.value=S[k];i.oninput=i.onchange=()=>setOpt(k,+i.value)}});
document.querySelectorAll('[data-val]').forEach(s=>s.textContent=S[s.dataset.val]);
['xcol','fps','gs'].forEach(optHook);
$('pre').onchange=e=>{const p=PRESETS[e.target.value];if(p)for(const k in p)setOpt(k,p[k])};
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));document.querySelectorAll('.tp').forEach(p=>p.classList.toggle('on',p.id===t.dataset.tab))});
/* profile creation */
const AVC=['#ff8a1e','#3ad56b','#3a7bd5','#d53a3a','#8f3ad5','#3ad5d0','#ffd24a','#ff5ac8'];
function showProfile(){$('profile').style.display='flex';const b=$('avs');b.innerHTML='';
 AVC.forEach(c=>{const i=document.createElement('i');i.style.background=c;if(c===S.av)i.className='on';i.onclick=()=>{S.av=c;[...b.children].forEach(x=>x.classList.remove('on'));i.classList.add('on')};b.appendChild(i)});
 $('pnick').value=S.nick==='Player'?'':S.nick;setTimeout(()=>$('pnick').focus(),50)}
function createProfile(){const n=($('pnick').value||'').trim().slice(0,14);if(!n){$('pnick').style.borderColor='#f33';return}
 S.nick=n;S.created=1;save();$('nick').value=n;$('profile').style.display='none';renderLists();renderProfile()}
$('pcreate').onclick=createProfile;$('pnick').onkeydown=e=>{if(e.key==='Enter')createProfile()};
$('reset').onclick=()=>{if(!confirm('Profile aur saari progress delete karni hai?'))return;
 Object.assign(S,{created:0,xp:0,kills:0,deaths:0,wins:0,matches:0,nick:'Player',prim:'ar',sec:'rv',mel:'kn',skin:'samurai',gskin:'default'});save();$('nick').value='Player';renderLists();renderProfile();showProfile()};
renderProfile();if(!S.created)showProfile();
$('bots').onchange=e=>{S.bots=+e.target.value;save()};$('diff').onchange=e=>{S.diff=+e.target.value;save()};


/* ================= main loop ================= */
function render(){renderer.clear();renderer.render(scene,cam);
 if(state==='play'&&P&&!P.dead){const sc=cw().scope&&ads>.9;if(!sc){renderer.clearDepth();renderer.render(vmScene,vmCam)}}}
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-last)/1000||0);last=t;fc++;if(t-ft>500){if(S.fps)$('fps').textContent=Math.round(fc*1000/(t-ft))+' FPS';fc=0;ft=t}
 if(state==='play'&&P){if(!paused)update(dt);placeCam(dt);hudSync(dt)}
 else{orbit+=dt*.12;if(state==='over')for(const e of ents)if(e.bot)animBot(e,dt);
  cam.fov=70;cam.updateProjectionMatrix();cam.position.set(NX/2+Math.cos(orbit)*88,48,NZ/2+Math.sin(orbit)*88);cam.rotation.set(0,0,0);cam.lookAt(NX/2,6,NZ/2)}
 render()}
/* ───── LAN multiplayer (server.js ke sath) ───── */
const SERVER_URL=''; /* online ke liye: 'https://tumhara-app.onrender.com' (aakhir me / nahi) */
const NET={room:'',es:null,on:SERVER_URL!==''||(location.protocol.indexOf('http')===0&&!!location.host),id:null,team:0,q:0};
function netSend(o){if(!NET.id)return;o.id=NET.id;fetch(SERVER_URL+'/m',{method:'POST',body:JSON.stringify(o)}).catch(()=>{})}
const nb=document.createElement('div');nb.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;font:12px sans-serif;color:#fff;background:rgba(0,0,0,.6);padding:3px 8px;border-radius:6px;pointer-events:none';document.body.appendChild(nb);
const netStat=t=>{nb.textContent=t};
function netInit(){if(!NET.on){netStat('🔴 OFFLINE — game ko server ke address (http://...) se kholo, file double-click se nahi');return}
 netStat('… server se connect ho raha hai');
 fetch(SERVER_URL+'/join',{method:'POST',body:JSON.stringify({nm:S.nick,room:NET.room})}).then(r=>r.json()).then(j=>{NET.id=j.id;NET.team=j.team;netStat('🟢 Server connected (id '+j.id+')');
  if(NET.es)NET.es.close();const es=NET.es=new EventSource(SERVER_URL+'/ev?id='+j.id);const myid=j.id;NET.got=0;es.onmessage=m=>{NET.got=1;netRecv(JSON.parse(m.data))};es.onerror=()=>{if(!NET.got)netPoll(myid);else netStat('🔴 Server se connection toot gaya')};setTimeout(()=>{if(!NET.got&&NET.id===myid)netPoll(myid)},3000)}).catch(()=>{NET.on=false;netStat('🔴 Server nahi mila — SERVER_URL / address check karo')})}
function netUpdate(e,dt){const k=Math.min(1,dt*14);e.vx=(e.tx-e.x)*4;e.vz=(e.tz-e.z)*4;e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;e.z+=(e.tz-e.z)*k;
 const dy=((e.tyaw-e.yaw+PI)%(2*PI)+2*PI)%(2*PI)-PI;e.yaw+=dy*k;e.ground=true;if(e.dead)e.deadT+=dt;else e.deadT=0;animBot(e,dt)}
function netRecv(d){netStat((NET.room?'🔒 Room '+NET.room+' · bina bots · ':'🟢 Online · ')+'dusre khilari: '+d.p.length);
 if(state!=='play')$('play').textContent=NET.room?'▶ START PARTY ('+(d.p.length+1)+')':'▶ PLAY';
 for(const v of d.ev)if(v.t==='start')onPartyStart(v);
 if(state!=='play'||!P)return;const seen={};
 for(const q of d.p){if(!q.ac)continue;seen[q.id]=1;let e=ents.find(o=>o.nid===q.id);
  if(!e){e=mkEnt(q.nm,true);e.net=1;e.nid=q.id;e.team=q.tm;e.wk='ar';e.x=e.tx=q.x;e.y=e.ty=q.y;e.z=e.tz=q.z;e.yaw=e.tyaw=q.yaw;
   mkBotMesh(e,BOTTH[q.id%BOTTH.length]);e.gun.visible=!curMode.knifeOnly;e.knife.visible=!!curMode.knifeOnly;ents.push(e)}
  e.tx=q.x;e.ty=q.y;e.tz=q.z;e.tyaw=q.yaw;e.pit=q.pit;e.name=q.nm;e.team=q.tm;e.kills=q.k;e.deaths=q.d;e.dead=!!q.dead;e.hp=q.dead?0:100}
 for(let i=ents.length-1;i>=0;i--){const e=ents[i];if(e.net&&!seen[e.nid]){if(e.mesh)scene.remove(e.mesh);ents.splice(i,1)}}
 if(curMode.team){teamScore=[0,0];for(const e of ents)teamScore[e.team?1:0]+=e.kills||0;if(teamScore[0]>=LIMIT||teamScore[1]>=LIMIT)endMatch()}
 for(const v of d.ev){
  if(v.t==='hit')damage(P,v.amt,ents.find(o=>o.nid===v.from),v.head,v.wn);
  else if(v.t==='kill'){P.kills++;S.kills++;addXP(v.head?75:50);kbT=1.8;$('kb').textContent=(v.head?'HEADSHOT! ':'')+'ELIMINATED  +'+(v.head?75:50)+' XP';snd('die',.5);if(!curMode.team&&ents.some(o=>o.kills>=LIMIT))endMatch()}
  else if(v.t==='f'){if(v.from!==NET.id)bulletWhizz(v.a,v.b,false);tracer(v.a,v.b,2);const e=ents.find(o=>o.nid===v.from);if(e){e.recoil=1;e.flashT=.06}snd('ar',cl(1-Math.hypot(v.a[0]-P.x,v.a[2]-P.z)/60,0,.95),1)}}}
function netPoll(id){if(NET.id!==id||NET.pt)return;if(NET.es)NET.es.close();netStat('🟡 Polling mode (tunnel SSE support nahi karta)');
 NET.pt=setInterval(()=>{if(NET.id!==id){clearInterval(NET.pt);NET.pt=0;return}if(NET.pb)return;NET.pb=1;fetch(SERVER_URL+'/poll?id='+id).then(r=>r.json()).then(netRecv).catch(()=>{}).finally(()=>{NET.pb=0})},100)}
function netJoin(r){NET.room=r;NET.id=null;clearInterval(NET.pt);NET.pt=0;if(NET.es)NET.es.close();netInit()}
{const pn=document.createElement('div');pn.style.cssText='position:fixed;left:8px;top:8px;z-index:9999;background:rgba(0,0,0,.75);color:#fff;font:13px sans-serif;padding:8px;border-radius:8px;display:flex;gap:6px;align-items:center';
 pn.innerHTML='<b>Private match</b><input id="rc" placeholder="Room code" maxlength="8" style="width:90px;padding:4px;text-transform:uppercase"><button id="rj">Join</button><button id="rn">New room</button><button id="rp">Public</button>';
 document.body.appendChild(pn);
 const go=r=>{$('rc').value=r;netJoin(r)};
 $('rj').onclick=()=>{const r=$('rc').value.trim().toUpperCase();if(r)go(r)};
 $('rn').onclick=()=>go(Math.random().toString(36).slice(2,6).toUpperCase());
 $('rp').onclick=()=>go('');
 setInterval(()=>{pn.style.display=(state==='play'||!NET.on)?'none':'flex'},400)}
const cdBox=document.createElement('div');cdBox.style.cssText='position:fixed;inset:0;z-index:100;display:none;flex-direction:column;align-items:center;justify-content:center;font-size:150px;font-weight:900;color:#ffd24a;text-shadow:0 0 30px #000;pointer-events:none;background:rgba(5,4,20,.5)';document.body.appendChild(cdBox);
function onPartyStart(v){if(state==='play'||NET.cd)return;clearTimeout(NET.startWait);
 if(MAPS[v.map])S.map=v.map;if(MODES[v.mode])S.mode=v.mode;S.diff=cl(+v.diff||0,0,3);save();renderMaps();renderModes();$('diff').value=S.diff;
 if(!TH||TH.key!==S.map)loadMap(S.map);
 initAudio();NET.cd=1;let n=3;
 (function tick(){if(n>0){cdBox.innerHTML=n+'<small style="font-size:22px;letter-spacing:3px">'+esc(MODES[S.mode].n)+' · '+esc(MAPS[S.map].n)+'</small>';cdBox.style.display='flex';snd('hit');n--;setTimeout(tick,1000)}
  else{cdBox.style.display='none';NET.cd=0;if(state!=='play')startMatch()}})()}
function pressPlay(){initAudio();if(NET.cd)return;
 if(NET.id&&NET.room){netSend({t:'start',map:S.map,mode:S.mode,diff:S.diff});clearTimeout(NET.startWait);NET.startWait=setTimeout(()=>onPartyStart({map:S.map,mode:S.mode,diff:S.diff}),1500);return}
 startMatch()}
setInterval(()=>netSend({t:'hb'}),3000);
netInit();
loadMap(S.map);requestAnimationFrame(frame);
/* ===== v3 additions: play type, leader, friends, chat, real sounds, board css ===== */
(function(){
const css=document.createElement('style');css.textContent=`
#pt{display:flex;gap:6px;margin:6px 0}#pt button{flex:1;padding:7px 4px;border-radius:8px;border:1px solid #3a3470;background:#14123a;color:#cfd2ff;font-weight:700;font-size:12px;cursor:pointer}
#pt button.on{background:linear-gradient(180deg,#ffb02e,#ff7a1e);color:#1a1020;border-color:#ffd24a}
.lk{opacity:.45;pointer-events:none}
#sb table,#over table{border-collapse:separate;border-spacing:0 3px;width:100%}
#sb tbody tr:nth-child(odd),#overb tr:nth-child(odd){background:rgba(255,255,255,.05)}
#sb tbody tr:first-child td,#overb tr:first-child td{color:#ffd24a;font-weight:800}
#sb td,#overb td{padding:5px 10px}
#soc{position:fixed;right:10px;bottom:10px;width:290px;z-index:60;background:rgba(14,12,36,.93);border:1px solid #3a3470;border-radius:12px;font:13px 'Segoe UI',sans-serif;color:#fff;display:none;flex-direction:column;overflow:hidden}
#soc .h{display:flex}#soc .h b{flex:1;text-align:center;padding:8px;cursor:pointer;background:#1b1848}#soc .h b.on{background:#3a3470}
#soc .p{display:none;padding:8px;height:210px;overflow:auto;flex-direction:column;gap:4px}#soc .p.on{display:flex}
#soc input{background:#14123a;color:#fff;border:1px solid #3a3470;border-radius:6px;padding:5px 8px;width:100%;box-sizing:border-box}
#soc .b{padding:3px 8px;border-radius:6px;border:0;background:#3a7bd5;color:#fff;cursor:pointer;font-size:11px}
#soc .fr{display:flex;align-items:center;gap:6px;justify-content:space-between}
#cmsgs{flex:1;overflow:auto;display:flex;flex-direction:column;gap:2px}
#tst{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9999;background:#ffb02e;color:#1a1020;font:700 14px sans-serif;padding:8px 16px;border-radius:8px;display:none}`;
document.head.appendChild(css);
const toast=t=>{let d=$('tst');if(!d){d=document.createElement('div');d.id='tst';document.body.appendChild(d)}d.textContent=t;d.style.display='block';clearTimeout(d._t);d._t=setTimeout(()=>d.style.display='none',2600)};
/* --- play type: Normal (bots) / Private (no bots) --- */
const pt=document.createElement('div');pt.id='pt';pt.innerHTML='<button data-p="0">🤖 NORMAL (Bots)</button><button data-p="1">🔒 PRIVATE (No Bots)</button>';
$('play').before(pt);
const setPt=v=>{S.priv=v;save();pt.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.p===v));$('bots').closest('.opts').style.display=v?'none':''};
pt.querySelectorAll('button').forEach(b=>b.onclick=()=>setPt(+b.dataset.p));setPt(S.priv?1:0);
/* --- leader: only room creator starts & picks map/mode --- */
NET.leader=true;
const lockUI=()=>{const l=!!NET.room&&!NET.leader&&state!=='play';['maps','modeList','diff'].forEach(i=>$(i).classList.toggle('lk',l));
 if(l&&!NET.cd)$('play').textContent='⏳ LEADER START KAREGA'};
setInterval(lockUI,300);
const _pp=pressPlay;pressPlay=function(){if(NET.room&&!NET.leader){toast('Sirf party leader match start kar sakta hai');return}_pp()};
$('play').onclick=pressPlay;$('again').onclick=pressPlay;
$('rn').onclick=()=>{NET.leader=true;const r=Math.random().toString(36).slice(2,6).toUpperCase();$('rc').value=r;netJoin(r);chatSys('Room '+r+' bana — tum leader ho')};
$('rj').onclick=()=>{const r=$('rc').value.trim().toUpperCase();if(r){NET.leader=false;netJoin(r);chatSys('Room '+r+' join kiya')}};
$('rp').onclick=()=>{NET.leader=true;$('rc').value='';netJoin('')};
/* --- friends + chat panel (needs server relay of t:freq/facc/inv/chat) --- */
const soc=document.createElement('div');soc.id='soc';
document.head.insertAdjacentHTML('beforeend','<style>#rpm .b{border:0;border-radius:6px;color:#fff;cursor:pointer;font-weight:700}#soc .h b{font-size:12px;padding:8px 2px}</style>');
soc.innerHTML='<div class="h"><b data-t="f" class="on" id="tf">👥 FRIENDS</b><b data-t="p">🌐 PLAYERS</b><b data-t="c">💬 CHAT</b></div><div class="p on" id="pf"><div style="display:flex;gap:4px"><input id="fn" placeholder="Friend ka nickname" maxlength="14"><button class="b" id="fadd">ADD</button></div><div id="rq"></div><div id="fl"></div></div><div class="p" id="pp"><div id="pl"></div></div><div class="p" id="pc"><div id="cmsgs"></div><input id="ci" placeholder="Message likho, Enter dabao" maxlength="120"></div>';
document.body.appendChild(soc);
const TABS={f:'pf',p:'pp',c:'pc'};
soc.querySelectorAll('.h b').forEach(b=>b.onclick=()=>{soc.querySelectorAll('.h b').forEach(x=>x.classList.toggle('on',x===b));for(const k in TABS)$(TABS[k]).classList.toggle('on',k===b.dataset.t);if(b.dataset.t==='p')loadPL()});
let FR=[],RQ=[],PL=[];try{FR=JSON.parse(localStorage.vf_friends||'[]');RQ=JSON.parse(localStorage.vf_reqs||'[]')}catch(e){}
const saveFR=()=>{try{localStorage.vf_friends=JSON.stringify(FR);localStorage.vf_reqs=JSON.stringify(RQ)}catch(e){}};
const isOn=n=>PL.some(p=>p.nm===n);
function renderFR(){$('tf').textContent='👥 FRIENDS'+(RQ.length?' ('+RQ.length+')':'');
 $('rq').innerHTML=RQ.map((n,i)=>`<div class="fr"><span>📩 ${esc(n)}</span><span><button class="b" style="background:#2a9d4a" data-acc="${i}">ACCEPT</button> <button class="b" style="background:#a33" data-dec="${i}">✕</button></span></div>`).join('');
 $('fl').innerHTML=FR.map((f,i)=>`<div class="fr"><span>${!f.ok?'⏳':isOn(f.n)?'🟢':'⚫'} ${esc(f.n)}</span><span>${f.ok?`<button class="b" data-inv="${i}">INVITE</button> `:''}<button class="b" style="background:#a33" data-del="${i}">✕</button></span></div>`).join('')||'<small>Abhi koi friend nahi</small>';
 $('rq').querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{const n=RQ.splice(+b.dataset.acc,1)[0];const f=FR.find(x=>x.n===n);if(f)f.ok=1;else FR.push({n,ok:1});saveFR();renderFR();netSend({t:'facc',to:n,from:S.nick});toast(n+' ab tumhara friend hai')});
 $('rq').querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{RQ.splice(+b.dataset.dec,1);saveFR();renderFR()});
 $('fl').querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>{const n=FR[+b.dataset.inv].n;if(!NET.room){NET.leader=true;const r=Math.random().toString(36).slice(2,6).toUpperCase();$('rc').value=r;netJoin(r)}
  setTimeout(()=>{netSend({t:'inv',to:n,from:S.nick,room:NET.room});toast('Invite bheja: '+n)},400)});
 $('fl').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{FR.splice(+b.dataset.del,1);saveFR();renderFR()})}
function sendFreq(n){if(!n||n===S.nick)return;if(FR.some(f=>f.n===n&&f.ok)){toast(n+' pehle se friend hai');return}
 if(!FR.some(f=>f.n===n))FR.push({n,ok:0});saveFR();renderFR();
 if(!NET.id){toast('Server se connect nahi — request nahi gayi');return}
 fetch(SERVER_URL+'/m',{method:'POST',body:JSON.stringify({id:NET.id,t:'freq',to:n,from:S.nick})}).then(r=>r.json()).then(j=>toast(j.err?j.err:j.delivered?'Friend request bheji: '+n:n+' abhi offline hai — online aate hi milegi')).catch(()=>toast('Request fail hui'))}
$('fadd').onclick=()=>{sendFreq($('fn').value.trim().slice(0,14));$('fn').value=''};
function loadPL(){if(!NET.on)return;fetch(SERVER_URL+'/players').then(r=>r.json()).then(j=>{PL=j.filter(p=>p.nm!==S.nick);renderPL();renderFR()}).catch(()=>{})}
function renderPL(){$('pl').innerHTML=PL.map((p,i)=>{const fr=FR.find(f=>f.n===p.nm);return `<div class="fr"><span>${p.st==='play'?'🎮':'🟢'} ${esc(p.nm)}<small style="opacity:.6"> ${p.st==='play'?'khel raha':'lobby'}</small></span><span>${fr?(fr.ok?'✔':'⏳'):`<button class="b" data-fa="${i}">+ FRIEND</button>`} <button class="b" style="background:#a33" data-rp="${i}">🚩</button></span></div>`}).join('')||'<small>Koi aur player online nahi</small>';
 $('pl').querySelectorAll('[data-fa]').forEach(b=>b.onclick=()=>sendFreq(PL[+b.dataset.fa].nm));
 $('pl').querySelectorAll('[data-rp]').forEach(b=>b.onclick=()=>openReport(PL[+b.dataset.rp].nm))}
setInterval(()=>{if(state!=='play'&&NET.on)loadPL()},4000);
function openReport(n){let d=$('rpm');if(!d){d=document.createElement('div');d.id='rpm';d.style.cssText='position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.6);align-items:center;justify-content:center;font:14px sans-serif;color:#fff';document.body.appendChild(d)}
 const st='padding:6px;background:#1b1848;color:#fff;border:1px solid #3a3470;border-radius:6px';
 d.innerHTML=`<div style="background:#14123a;border:1px solid #3a3470;border-radius:12px;padding:16px;width:290px;display:flex;flex-direction:column;gap:8px"><b>🚩 Report: ${esc(n)}</b><select id="rpr" style="${st}"><option>Cheating / Hack</option><option>Gaali / Abusive chat</option><option>Spam</option><option>Other</option></select><input id="rpn" maxlength="100" placeholder="Note (optional)" style="${st}"><div style="display:flex;gap:6px"><button class="b" id="rps" style="flex:1;padding:8px;background:#a33">SEND REPORT</button><button class="b" id="rpx" style="flex:1;padding:8px;background:#555">CANCEL</button></div></div>`;
 d.style.display='flex';$('rpn').onkeydown=e=>e.stopPropagation();$('rpx').onclick=()=>d.style.display='none';
 $('rps').onclick=()=>{const body={id:NET.id,t:'report',target:n,reason:$('rpr').value,note:$('rpn').value.trim()};d.style.display='none';
  fetch(SERVER_URL+'/m',{method:'POST',body:JSON.stringify(body)}).then(r=>r.json()).then(j=>toast(j.ok?'Report bhej di — shukriya':(j.err||'Report fail'))).catch(()=>toast('Report fail'))}}
function chatAdd(h){const m=$('cmsgs');m.insertAdjacentHTML('beforeend','<div>'+h+'</div>');m.scrollTop=1e9}
function chatSys(t){chatAdd('<i style="color:#ffd24a">• '+esc(t)+'</i>')}
$('ci').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&$('ci').value.trim()){const m=$('ci').value.trim().slice(0,120);chatAdd('<b style="color:#3ad56b">'+esc(S.nick)+':</b> '+esc(m));netSend({t:'chat',nm:S.nick,m,room:NET.room});$('ci').value=''}};
$('fn').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')$('fadd').click()};
const _nr=netRecv;netRecv=function(d){for(const v of d.ev||[]){
 if(v.t==='chat'&&v.nm!==S.nick)chatAdd('<b style="color:#3a9bd5">'+esc(v.nm)+':</b> '+esc(v.m));
 else if(v.t==='freq'&&v.to===S.nick){const f=FR.find(x=>x.n===v.from);
  if(f&&!f.ok){f.ok=1;saveFR();renderFR();netSend({t:'facc',to:v.from,from:S.nick});toast(v.from+' ab tumhara friend hai')}
  else if(!f&&!RQ.includes(v.from)){RQ.push(v.from);saveFR();renderFR();toast('📩 '+v.from+' ne friend request bheji')}}
 else if(v.t==='facc'&&v.to===S.nick){const f=FR.find(x=>x.n===v.from);if(f){f.ok=1;saveFR();renderFR();toast(v.from+' ab tumhara friend hai')}}
 else if(v.t==='inv'&&v.to===S.nick&&FR.some(f=>f.n===v.from&&f.ok)&&confirm(v.from+' ne party me invite kiya. Join?')){NET.leader=false;$('rc').value=v.room;netJoin(v.room);chatSys(v.from+' ki party join ki')}}
 _nr(d)};
renderFR();loadPL();
setInterval(()=>{soc.style.display=(state==='play'||!NET.on)?'none':'flex'},400);
})();

