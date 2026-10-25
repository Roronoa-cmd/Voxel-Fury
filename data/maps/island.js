/* MAP: island - info + generator (voxel build code) */
MAPS.island={n:'Palm Island',seed:89,sky:['#4fc3ff','#e8fbff'],fog:'#bfeaff',fd:[80,200],trees:1,cl:1,c:'#e8d9a0',wt:6,pal:[0,[7,7,7],[8,8,8],[3,3,3],[5,5,5],[6,6,6],[12,12,12],[15,16,15],[17,17,17],[2,2,2]]};
MAPGEN.island=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  const cx=56,cz=56;
  terrain((x,z)=>{const d=Math.hypot(x-cx,z-cz)/44;return 1+Math.max(0,1-d*d)*8+fb(x,z,6)*2.5-Math.max(0,d-.8)*5},G);
  for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++)if(gh(x,z)<=2)col(x,z,gh(x,z),6);
  const land=(w,d,p,fl)=>{for(let n=0;n<30;n++){const q=spot(w,d,p,fl);if(!q)return null;if(gh(q[0]+(w>>1),q[1]+(d>>1))>=4)return q}return null};
  tower(cx-4,cz-4,8,16,2,3,0);res(cx-10,cz-10,40,20);box(cx-1,gh(cx,cz)+16,cz-1,2,2,2,5);
  for(let i=0;i<6;i++){const p=land(9,8,3,3);if(p)house(p[0],p[1],9,8,4,4,8)}
  for(let n=0;n<600;n++){const x=ir(4,NX-5),z=ir(4,NZ-5),g=gh(x,z);if(g<3||g>6||hit(x-1,z-1,3,3,1))continue;res(x-1,z-1,3,3);palm(x,z)}
  for(let i=0;i<8;i++){const p=land(5,5,1,2);if(p)mound(p[0]+2,p[1]+2,ir(2,3),3)}
  for(let i=0;i<12;i++){const p=land(3,3,1,1);if(p){const g=lvl(p[0],p[1],2,2,1);box(p[0],g,p[1],2,ir(1,2),2,5)}}
}
};
