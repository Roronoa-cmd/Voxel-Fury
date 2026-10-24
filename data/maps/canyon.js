/* MAP: canyon - info + generator (voxel build code) */
MAPS.canyon={n:'Red Canyon',seed:61,sky:['#e8905a','#ffd9a0'],fog:'#f0c08a',fd:[80,200],trees:0,cl:1,c:'#d08a4a',pal:[0,[7,7,2],[8,8,8],[4,4,4],[5,5,5],[6,6,6],[12,12,12],[15,16,15],[17,17,17],[2,2,2]]};
MAPGEN.canyon=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain((x,z)=>3+fb(x,z,5)*3,G);
  const T=13;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
   if(i==1&&j==1){const x=46,z=46,g=lvl(x,z,20,20,4);box(x,g,z,20,8,20,3);
    for(let k=0;k<20;k+=2){box(x+k,g+8,z,1,1,1,3);box(x+k,g+8,z+19,1,1,1,3);box(x,g+8,z+k,1,1,1,3);box(x+19,g+8,z+k,1,1,1,3)}
    stairs(66,62,g,0,8,2,3);stairs(45,62,g,1,8,2,3);stairs(62,66,g,2,8,2,3);stairs(62,45,g,3,8,2,3);box(53,g+8,53,2,1,2,5);box(57,g+8,57,2,2,2,5);res(32,32,48,48);continue}
   const w=ir(14,18),d=ir(14,18),x=10+i*34+ir(0,4),z=10+j*34+ir(0,4),g=lvl(x,z,w,d,4),h=Math.max(4,T-g);
   for(let l=0;l<h;l++)box(x,g+l,z,w,1,d,l%4==3?3:2);
   const dr=i==0?0:i==2?1:j==0?2:3,sx=[x+w,x-1,x+(w>>1)-1,x+(w>>1)-1][dr],sz=[z+(d>>1)-1,z+(d>>1)-1,z+d,z-1][dr];
   stairs(sx,sz,g,dr,h,2,2);
   box(x+3,g+h,z+3,2,1,2,5);box(x+w-5,g+h,z+d-5,2,2,2,5);box(x+(w>>1),g+h,z+(d>>1)-1,1,1,3,3);
   res(x-8,z-8,w+16,d+16)}
  const cac=(x,z)=>{const g=gh(x,z),h=ir(2,4);box(x,g,z,1,h,1,8);box(x-1,g+1,z,1,1,1,8);box(x-1,g+2,z,1,1,1,8);box(x+1,g+h-1,z,1,1,1,8);box(x+1,g+h,z,1,1,1,8)};
  for(let n=0;n<500;n++){const x=ir(4,NX-5),z=ir(4,NZ-5);if(hit(x-1,z-1,3,3,1)||rr()>.12)continue;res(x-1,z-1,3,3);cac(x,z)}
  for(let i=0;i<8;i++){const p=spot(3,3,3,2);if(p){const g=lvl(p[0],p[1],3,3,2),h=ir(5,9);box(p[0],g,p[1],3,h,3,2);box(p[0]+1,g+h,p[1]+1,1,2,1,3)}}
  cover(14);
}
};
