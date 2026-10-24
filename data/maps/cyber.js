/* MAP: cyber - info + generator (voxel build code) */
MAPS.cyber={n:'Neon Metropolis',seed:51,sky:['#07061a','#2a0f55'],fog:'#150a33',fd:[40,150],trees:0,cl:0,c:'#a040ff',pal:[0,[18,18,18],[9,9,9],[19,19,19],[13,13,13],[6,6,6],[14,14,14],[18,18,18],[9,9,9],[13,13,13]]};
MAPGEN.cyber=function(Hh){const {T,K,G,rr,ir,box,occ,hit,res,hh,sm,vn,fb,H,gh,col,terrain,pil,lvl,pit,road,stairs,spot,house,tower,tree,pine,palm,mound,cover}=Hh;
{
  terrain(()=>2,G);for(const q of[22,44,66,88]){road(1,q,110,q,6,3);road(q,1,q,110,6,3)}
  const tw=[];
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const bx=6+22*i,bz=6+22*j,g=2,t=((i+j)&1)?4:6;
   if(i==2&&j==2){for(const[a,b]of[[0,0],[14,0],[0,14],[14,14]])box(bx+a,g,bz+b,2,10,2,a?4:6);for(let k=0;k<5;k++)box(bx+3+k,g+k,bz+3+k,10-2*k,1,10-2*k,k%2?4:6);box(bx+7,7,bz+7,2,6,2,6)}
   else if(i%4==0&&j%4==0){for(let a=0;a<2;a++)for(let b=0;b<2;b++){const x=bx+a*8,z=bz+b*8;box(x,g,z,5,3,4,2);box(x,g+1,z,5,1,4,t);stairs(x+5,z,g,0,3,2,5)}}
   else{const uh=ir(7,10);for(let l=0;l<9;l++)box(bx,g+l,bz,16,1,16,l%4==3?t:2);box(bx,g,bz+6,16,4,4,0);for(let l=0;l<uh;l++)box(bx+3,g+9+l,bz+3,10,1,10,l%4==3?t:2);
    stairs(bx,bz+16,g,0,9,2,6);stairs(bx+3,bz+1,g+9,0,uh,2,t);box(bx+7,g+9+uh,bz+7,2,5,2,t);tw[i*5+j]=[bx,bz]}}
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const q=tw[i*5+j];if(!q)continue;
   if(i<4&&tw[(i+1)*5+j]&&(i+j)%2==0){box(q[0]+16,10,q[1]+6,6,1,4,2);box(q[0]+16,11,q[1]+6,6,1,1,4);box(q[0]+16,11,q[1]+9,6,1,1,4)}
   if(j<4&&tw[i*5+j+1]&&(i*2+j)%3==0){box(q[0]+6,10,q[1]+16,4,1,6,2);box(q[0]+6,11,q[1]+16,1,6-5,6,4);box(q[0]+9,11,q[1]+16,1,1,6,4)}}
  for(let n=0;n<44;n++){const ho=rr()<.5,q=22+22*ir(0,3)+ir(0,3),p=ir(4,104),x=ho?p:q,z=ho?q:p,w=ho?3:2,d=ho?2:3;if(vox(x,2,z)||vox(x+w-1,2,z+d-1))continue;box(x,2,z,w,1,d,n&1?4:6)}
}
};
