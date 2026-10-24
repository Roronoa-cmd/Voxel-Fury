/* GUN: kn - stats + 3D model */
WP.kn={n:'Knife',snd:'kn',dmg:70,head:1.5,rate:280,mag:0,rel:0,melee:1,range:3.2,zoom:1,sh:0,sa:0,rec:0,pel:1,lunge:.8,slot:3,lv:0,d:'Fast · 50 dmg'};
GUNMODEL.kn=function(g,sk,ac){
  const ST=0xe3e8f0,DK=0x1b1d22;
  part(g,.014,.052,.24,ST,0,.005,-.2);part(g,.012,.04,.09,ST,0,-.002,-.35,.12);part(g,.016,.01,.2,0x9aa3ad,0,.034,-.18);part(g,.006,.012,.22,0xffffff,0,-.026,-.2);
  part(g,.018,.01,.16,0x9aa3ad,0,.002,-.2);
  part(g,.064,.044,.016,0x30343b,0,0,-.075);glow(g,.066,.008,.018,ac,0,.024,-.075);
  part(g,.034,.046,.14,DK,0,0,.0,0,RUBT);for(let i=0;i<5;i++)part(g,.038,.012,.012,0x08090b,0,0,-.05+i*.025,0,RUBT);
  part(g,.042,.05,.02,0x555a63,0,0,.085);glow(g,.01,.01,.03,ac,0,0,.105);
  arms(g,sk,[0,-.03,.04],null)};
HIP.kn=[.2,-.22,-.45];
ADSP.kn=[.2,-.22,-.45];
