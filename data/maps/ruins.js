/* MAP: ruins - info + generator (voxel build code) */
MAPS.ruins={n:'Jungle Ruins',seed:97,sky:['#3b6a63','#cfe8d0'],fog:'#a8c9b0',fd:[55,150],trees:1,cl:1,c:'#3f7f3a',pal:[0,[0,1,2],[19,19,19],[3,3,3],[5,5,5],[6,6,6],[12,12,12],[15,16,15],[17,17,17],[2,2,2]]};
MAPGEN.ruins=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain((x,z)=>5+fb(x,z,7)*6,G);
  {const x=41,z=41,w=30,g=lvl(x,z,w,w,6);for(let l=0;l<12;l++){const i=Math.floor(l*1.25);box(x+i,g+l,z+i,w-2*i,1,w-2*i,l%3==2?3:2)}
   box(x+14,g+12,z+14,2,2,2,3);res(x-10,z-10,w+20,w+20)}
  for(let n=0;n<24;n++){const o=rr()<.5,p=spot(o?2:8,o?8:2,2,2);if(!p)continue;const g=lvl(p[0],p[1],o?2:8,o?8:2,1);for(let i=0;i<8;i++){const h=ir(0,3);if(h)box(o?p[0]:p[0]+i,g,o?p[1]+i:p[1],o?2:1,h,o?1:2,3)}}
  for(let i=0;i<16;i++){const p=spot(2,2,2,2);if(p){const g=lvl(p[0],p[1],2,2,1);box(p[0],g,p[1],2,ir(3,7),2,2)}}
  for(let n=0;n<1600;n++){const x=ir(4,NX-5),z=ir(4,NZ-5);if(hit(x-1,z-1,3,3,1)||(fb(x,z,88)<.5&&rr()>.05))continue;res(x-1,z-1,3,3);tree(x,z)}
  for(let i=0;i<8;i++){const p=spot(5,5,1,2);if(p)mound(p[0]+2,p[1]+2,ir(2,3),3)}cover(10);
}
};
