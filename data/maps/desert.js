/* MAP: desert - info + generator (voxel build code) */
MAPS.desert={n:'Sun Temple Dunes',seed:23,sky:['#f2a85a','#ffe4b0'],fog:'#f5d8a8',fd:[70,190],trees:0,cl:1,c:'#e2cc8c',pal:[0,[7,7,7],[8,8,8],[19,19,19],[5,5,5],[6,6,6],[12,12,12],[15,16,15],[17,17,17],[4,4,4]]};
MAPGEN.desert=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain((x,z)=>5+Math.abs(Math.sin(x*.08+fb(x,z,2)*6))*5+fb(x,z,3)*5,G);
  pit(24,84,9,2,6);for(let a=0;a<10;a++){const an=a*.628;palm(Math.round(24+Math.cos(an)*13),Math.round(84+Math.sin(an)*13))}
  {const x=41,z=41,g=lvl(x,z,31,31,8),cx=56,cz=56;for(let l=0;l<15;l++)box(x+l,g+l,z+l,31-2*l,1,31-2*l,l%5==4?3:2);
   box(cx-5,g,cz-5,11,5,11,0);box(cx-1,g,cz+5,3,3,11,0);for(const[a,b]of[[-4,-4],[3,-4],[-4,3],[3,3]])box(cx+a,g,cz+b,2,5,2,3);box(cx-1,g,cz-1,2,2,2,5);box(cx,g+15,cz,1,3,1,3);res(x-10,z-10,51,51)}
  const stall=(x,z)=>{const g=lvl(x,z,5,3,2);for(const[a,b]of[[0,0],[4,0],[0,2],[4,2]])box(x+a,g,z+b,1,3,1,7);box(x,g+3,z,5,1,3,4);box(x+1,g,z,3,1,1,5)};
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)stall(76+a*9,74+b*9);res(72,70,32,30);
  res(28,12,50,10);for(let i=0;i<10;i++){const x=30+i*5,h=ir(3,9),g=Math.max(gh(x,16),gh(x+1,16),gh(x,17),gh(x+1,17));for(let a=0;a<2;a++)for(let b=0;b<2;b++)pil(x+a,16+b,g,3);box(x,g,16,2,h,2,3);if(h>6)box(x-1,g+h,15,4,1,4,2)}
  for(let i=0;i<4;i++){const p=spot(14,14,4,6);if(p){const g=lvl(p[0],p[1],14,14,3),h=ir(7,10);for(let k=0;k<h;k++)box(p[0],g+k,p[1],14,1,14,k%4==3?3:2);stairs(p[0]+14,p[1]+6,g,0,h,2,2)}}
  for(let i=0;i<6;i++){const p=spot(3,3,3,2);if(p){const g=lvl(p[0],p[1],3,3,2);box(p[0],g,p[1],3,7,3,2);box(p[0]+1,g+7,p[1]+1,1,4,1,3)}}cover(14);
}
};
