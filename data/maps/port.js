/* MAP: port - info + generator (voxel build code) */
MAPS.port={n:'Cargo Port',seed:73,sky:['#6aa0cf','#dbe9f5'],fog:'#c4d6e6',fd:[70,190],trees:0,cl:1,c:'#8d8d88',pal:[0,[19,19,19],[9,9,9],[4,4,4],[5,5,5],[6,6,6],[3,3,3],[15,16,15],[17,17,17],[18,18,18]]};
MAPGEN.port=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain(()=>3,G);
  {const x=46,z=46,g=3;for(let l=0;l<8;l++)box(x+l,g+l,z+l,20-2*l,1,20-2*l,l%2?3:2);box(54,g+8,54,2,1,2,5);res(34,34,44,44)}
  for(const q of[[6,6,0],[100,6,1],[6,100,0],[100,100,1]]){tower(q[0],q[1],6,15,2,3,q[2]);res(q[2]?q[0]-20:q[0]-4,q[1]-4,28,14)}
  for(let i=0;i<3;i++){const p=spot(26,12,3,2);if(p)house(p[0]+9,p[1],16,12,6,2,3)}
  for(let n=0;n<70;n++){const o=rr()<.5,p=spot(o?4:12,o?12:4,4,1);if(!p)continue;const lx=o?4:12,lz=o?12:4,t=[2,3,5][ir(0,2)];box(p[0],3,p[1],lx,3,lz,t);
   const dr=o?(rr()<.5?2:3):(rr()<.5?0:1),sx=[p[0]+lx,p[0]-1,p[0]+(lx>>1)-1,p[0]+(lx>>1)-1][dr],sz=[p[1]+(lz>>1)-1,p[1]+(lz>>1)-1,p[1]+lz,p[1]-1][dr];stairs(sx,sz,3,dr,3,2,4)}
  road(1,30,110,30,3,9);road(1,90,110,90,3,9);road(30,1,30,110,3,9);road(90,1,90,110,3,9);
  cover(16);
}
};
