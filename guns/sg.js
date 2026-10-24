/* GUN: sg - stats + 3D model */
WP.sg={n:'Shotgun',snd:'sg',skin:'M1014',skinCls:'m1014',dmg:14,head:1.5,rate:850,mag:8,rel:2.0,sh:.065,sa:.05,rec:.065,zoom:1.2,pel:9,range:44,fall:1,slot:1,lv:3,d:'Pump · 8 shells · close range',fs:.42};
GUNMODEL.sg=function(g,sk,ac){
  const wd=0x8a5a30,S1=0x30343b,S2=0x20232a;
  part(g,.076,.1,.28,S1,0,0,0);part(g,.02,.04,.1,0xc9a24a,.039,.01,-.02);glow(g,.004,.025,.22,ac,-.039,.01,0);
  cyl(g,.02,.62,S2,0,.03,-.45);cyl(g,.018,.5,S1,0,-.025,-.4);part(g,.03,.012,.44,0x16181c,0,.058,-.4);
  for(let i=0;i<6;i++)part(g,.016,.004,.02,0x08090b,0,.0645,-.22-i*.045);
  cyl(g,.024,.02,0x15161a,0,.03,-.72);cyl(g,.021,.02,0x15161a,0,-.025,-.62);
  for(let i=0;i<4;i++)cyl(g,.01,.05,0xc23030,.046,-.01,-.06+i*.04);
  part(g,.012,.02,.012,0xffd24a,0,.06,-.74);
  const pg=new THREE.Group();g.add(pg);g.userData.pump=pg;
  part(pg,.07,.065,.2,wd,0,-.045,-.38,0,WOODT);for(let i=0;i<4;i++)part(pg,.074,.012,.012,0x2a1a0c,0,-.045,-.46+i*.045,0,WOODT);
  part(g,.06,.11,.3,wd,0,-.02,.3,.1,WOODT);part(g,.062,.12,.03,0x15161a,0,-.025,.46,.1,RUBT);part(g,.05,.11,.06,wd,0,-.09,.1,-.3,WOODT);
  arms(g,sk,[0,-.1,.14],null);arm1(pg,sk,[0,-.075,-.38],-1)};
MUZ.sg=[0,.03,-.78];
HIP.sg=[.19,-.2,-.48];
ADSP.sg=[0,-.085,-.4];
