/* GUN: sn - stats + 3D model */
WP.sn={n:'Sniper',snd:'sn',skin:'WM29',skinCls:'wm',dmg:110,head:2,rate:1300,mag:5,rel:2.6,sh:.1,sa:0,rec:.09,zoom:4.2,pel:1,range:210,scope:1,slot:1,lv:14,d:'Bolt-action · 4x scope · 1 shot',fs:.36,bolt:1};
GUNMODEL.sn=function(g,sk,ac){
  const O=0x4a5642,D=0x22281f,B=0x121417;
  part(g,.065,.1,.46,O,0,0,0);part(g,.06,.05,.4,D,0,-.06,.02);glow(g,.004,.03,.3,ac,.034,0,0);
  cyl(g,.016,.55,B,0,.02,-.55);for(let i=0;i<6;i++)cyl(g,.019,.012,D,0,.02,-.35-i*.07);cyl(g,.026,.08,D,0,.02,-.86);for(let i=0;i<3;i++)part(g,.056,.01,.012,B,0,.02,-.84-i*.02);
  part(g,.05,.008,.02,B,0,.02,-.9);part(g,.008,.05,.02,B,0,.02,-.9);
  cyl(g,.03,.34,0x15181b,0,.105,-.04);cyl(g,.042,.07,0x0f1113,0,.105,-.23);cyl(g,.036,.06,0x0f1113,0,.105,.15);
  part(g,.014,.02,.014,B,.036,.105,-.04);part(g,.014,.014,.02,B,0,.142,-.04);part(g,.04,.012,.26,B,0,.062,-.04);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.036,16),new THREE.MeshBasicMaterial({color:0x3aaaff}));lens.position.set(0,.105,.182);g.add(lens);
  part(g,.014,.036,.012,B,0,.14,-.04);part(g,.036,.012,.012,B,.032,.105,-.04);
  part(g,.02,.045,.04,B,0,.065,-.12);part(g,.02,.045,.04,B,0,.065,.06);
  part(g,.058,.12,.3,D,0,-.03,.36);part(g,.05,.04,.18,O,0,.05,.34);part(g,.06,.13,.03,B,0,-.03,.52,0,RUBT);
  part(g,.04,.1,.06,B,0,-.09,.02);
  part(g,.012,.012,.2,B,.03,-.05,-.5);part(g,.012,.012,.2,B,-.03,-.05,-.5);
  const bg=new THREE.Group();bg.position.set(.05,.03,.08);g.add(bg);part(bg,.012,.012,.07,0xc0c4cc,0,0,0);part(bg,.028,.028,.028,0xc0c4cc,.025,0,.03);g.userData.bolt=bg;g.userData.boltZ=.08;
  part(g,.062,.012,.32,ac,0,.052,0);
  arms(g,sk,[0,-.12,.2],[0,-.065,-.36])};
MUZ.sn=[0,.02,-.99];
HIP.sn=[.19,-.2,-.5];
ADSP.sn=[0,-.1,-.4];
