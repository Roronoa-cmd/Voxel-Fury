/* MAP: meadow - info + generator (voxel build code) */
MAPS.meadow={n:'Green Valley',seed:11,sky:['#5fb4ff','#d6f0ff'],fog:'#cbe9ff',fd:[70,190],trees:1,cl:1,c:'#58b84c',pal:[0,[0,1,2],[4,4,4],[3,3,3],[5,5,5],[6,6,6],[12,12,12],[15,16,15],[17,17,17],[2,2,2]]};
MAPGEN.meadow=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain((x,z)=>4+fb(x,z,1)*8+Math.max(0,9-Math.hypot(x-84,z-28)/2.3)-Math.max(0,8-Math.hypot(x-26,z-84)/2.6),G);
  pit(26,84,11,2,6);
  {const x=80,z=24,g=lvl(x,z,9,9,5),cx=x+4;for(let l=0;l<12;l++){const i=l>>2;box(x+i,g+l,z+i,9-2*i,1,9-2*i,l%4==3?3:4)}
   box(x-1,g+4,z-1,11,1,11,4);box(x+2,g+12,z+2,5,1,5,3);box(x+3,g+13,z+3,3,1,3,3);setV(cx,g+14,z+4,3);
   box(cx,g+5,z-1,1,10,1,4);box(cx-5,g+9,z-1,11,1,1,4);for(let i=1;i<4;i++){box(cx-i-1,g+9+i,z-1,1,1,1,4);box(cx+i+1,g+9-i,z-1,1,1,1,4)}
   stairs(x-2,z+3,g,1,5,2,4);res(x-6,z-6,21,21)}
  {const g=lvl(46,46,22,22,6);res(40,40,34,34);
   for(const q of[[38,40,9,8,5],[54,36,10,9,6],[36,58,8,9,5],[60,58,10,9,6],[48,76,9,8,5],[74,52,8,8,5]]){house(q[0],q[1],q[2],q[3],q[4],q[4]>5?2:4,q[4]>5?4:2);res(q[0]-4,q[1]-4,q[2]+8,q[3]+8)}
   road(30,52,100,52,3,9);road(56,30,56,100,3,9);const w=gh(55,55);box(54,w,54,4,1,4,3);box(55,w,55,2,1,2,6);for(const[a,b]of[[54,54],[57,54],[54,57],[57,57]])box(a,w+1,b,1,3,1,7);box(54,w+4,54,4,1,4,4)}
  const farm=(x,z)=>{const g=lvl(x,z,16,12,4);for(let k=0;k<12;k++)for(let i=0;i<16;i++){const a=x+i,b=z+k;if(i==0||i==15||k==0||k==11){if(!(k==0&&i>6&&i<9))setV(a,g,b,4)}else{setV(a,g-1,b,9);if(k%2==0)setV(a,g,b,8)}}box(x+12,g,z+8,2,2,2,5);res(x-3,z-3,22,18)};
  for(const q of[[70,76],[88,72],[86,92]])farm(q[0],q[1]);
  for(let n=0;n<1500;n++){const x=ir(4,NX-5),z=ir(4,NZ-5);if(hit(x-1,z-1,3,3,1)||(fb(x,z,77)<.56&&rr()>.04))continue;res(x-1,z-1,3,3);tree(x,z)}
  for(let i=0;i<10;i++){const p=spot(5,5,1,2);if(p)mound(p[0]+2,p[1]+2,ir(2,3),3)}cover(12);
}
};
