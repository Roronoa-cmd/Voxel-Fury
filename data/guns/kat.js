/* GUN: kat - stats + 3D model */
WP.kat={n:'Katana',snd:'kt',dmg:75,head:1,rate:640,mag:0,rel:0,melee:1,range:3.1,zoom:1,sh:0,sa:0,rec:0,pel:1,slot:3,lv:49,d:'Long reach · 75 dmg'};
GUNMODEL.kat=function(g,sk,ac){
  const SB=0xdde4ee,DK=0x15161a,GD=0xc9a24a;
  part(g,.012,.05,.5,SB,0,0,-.38);part(g,.014,.01,.5,0x9aa3ad,0,.028,-.38);part(g,.004,.012,.5,0xffffff,0,-.026,-.38);part(g,.012,.034,.06,SB,0,.008,-.66,.2);
  cyl(g,.04,.012,GD,0,0,-.125);glow(g,.012,.012,.012,ac,0,.045,-.125);
  part(g,.03,.036,.2,DK,0,0,-.01,0,FABT);for(let i=0;i<6;i++)part(g,.034,.04,.008,0x6a1218,0,0,-.08+i*.035,0,FABT);
  part(g,.04,.04,.02,GD,0,0,.1);glow(g,.034,.006,.2,ac,0,-.022,-.01);
  arms(g,sk,[0,-.03,.0],null)};
HIP.kat=[.2,-.2,-.5];
ADSP.kat=[.2,-.2,-.5];
