/* GUN: dg - stats + 3D model */
WP.dg={n:'Desert Eagle',snd:'dg',dmg:64,head:2,rate:520,mag:7,rel:2.3,sh:.018,sa:.004,rec:.08,zoom:1.3,pel:1,range:115,slot:2,lv:25,d:'7 rounds · very strong',ej:1,fs:.3};
GUNMODEL.dg=function(g,sk,ac){
  const SV=0x8f949d,DK=0x2a2d33,B=0x121317;
  part(g,.058,.07,.3,DK,0,.012,-.08);part(g,.054,.052,.28,SV,0,-.04,-.07);part(g,.05,.01,.26,B,0,.052,-.08);
  for(let i=0;i<6;i++)part(g,.06,.05,.006,B,0,.012,.05-i*.014);
  cyl(g,.017,.12,DK,0,.012,-.29);part(g,.03,.012,.14,B,0,-.07,-.2);
  part(g,.01,.024,.012,B,0,.056,-.2);part(g,.01,.02,.012,B,.012,.058,.05);part(g,.01,.02,.012,B,-.012,.058,.05);
  part(g,.05,.13,.07,0x1d1f24,0,-.115,.06,-.16,RUBT);glow(g,.054,.01,.072,ac,0,-.06,.04);glow(g,.004,.016,.18,ac,.03,.012,-.08);glow(g,.004,.016,.18,ac,-.03,.012,-.08);
  part(g,.012,.012,.06,B,0,-.075,0);
  arms(g,sk,[0,-.12,.06],null)};
MUZ.dg=[0,.012,-.36];
HIP.dg=[.17,-.18,-.4];
ADSP.dg=[0,-.068,-.38];
