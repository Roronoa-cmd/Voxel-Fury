/* MAP: frost - info + generator (voxel build code) */
MAPS.frost={n:'Frostpeak Keep',seed:37,sky:['#9fb8d6','#eef5ff'],fog:'#dbe8f6',fd:[60,180],trees:1,cl:1,c:'#dfeaf7',pal:[0,[10,11,2],[12,12,12],[3,3,3],[5,5,5],[6,6,6],[9,9,9],[15,16,15],[17,17,17],[19,19,19]]};
MAPGEN.frost=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain((x,z)=>4+fb(x,z,4)*7+Math.max(0,Math.hypot(x-56,z-56)-36)*.6,G);
  pit(26,76,10,3,2);
  {const x=38,z=28,w=36,d=34,g=lvl(x-3,z-3,w+6,d+6,6);box(x,g,z,w,7,d,3);box(x+2,g,z+2,w-4,7,d-4,0);box(x+(w>>1)-2,g,z+d-2,4,5,2,0);
   for(let i=0;i<w;i+=2){box(x+i,g+7,z,1,1,1,3);box(x+i,g+7,z+d-1,1,1,1,3)}for(let i=0;i<d;i+=2){box(x,g+7,z+i,1,1,1,3);box(x+w-1,g+7,z+i,1,1,1,3)}
   for(const q of[[x-2,z-2,3],[x+w-4,z-2,3],[x-2,z+d-4,2],[x+w-4,z+d-4,2]])tower(q[0],q[1],6,12,3,2,q[2]);
   tower(x+(w>>1)-6,z+(d>>1)-6,12,10,2,3,0);stairs(x+8,z+2,g,2,7,2,3);stairs(x+w-10,z+d-3,g,3,7,2,3);res(x-8,z-8,w+16,d+16)}
  for(let i=0;i<6;i++){const p=spot(3,3,3,2);if(p){const g=lvl(p[0],p[1],3,3,2);for(let l=0;l<9;l++){const w=l<3?3:l<6?2:1;box(p[0],g+l,p[1],w,1,w,2)}}}
  for(let i=0;i<4;i++){const p=spot(7,6,3,2);if(p)house(p[0],p[1],7,6,5,4,1)}
  for(let n=0;n<900;n++){const x=ir(4,NX-5),z=ir(4,NZ-5);if(gh(x,z)>18||fb(x,z,66)<.45||hit(x-1,z-1,3,3,1))continue;res(x-1,z-1,3,3);pine(x,z)}
  for(let i=0;i<10;i++){const p=spot(5,5,1,2);if(p)mound(p[0]+2,p[1]+2,ir(2,3),3)}cover(10);
}
};
