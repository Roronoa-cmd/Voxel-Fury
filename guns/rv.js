/* GUN: rv - stats + 3D model */
WP.rv={n:'Revolver',snd:'pi',dmg:45,head:2,rate:430,mag:6,rel:2.1,sh:.02,sa:.006,rec:.05,zoom:1.3,pel:1,range:100,slot:2,lv:0,d:'6 rounds · heavy hitter',ej:1};
GUNMODEL.rv=function(g,sk,ac){
  const SV=0xc3c8d0,SD=0x8f949d,wd=0x7a4a28;
  part(g,.052,.085,.16,SV,0,0,0);part(g,.056,.012,.1,SD,0,.048,.04);
  cyl(g,.016,.26,SD,0,.02,-.2);part(g,.012,.01,.26,SV,0,.04,-.2);part(g,.03,.03,.2,SD,0,-.012,-.2);cyl(g,.008,.14,SD,.022,-.012,-.16);
  cyl(g,.036,.075,SV,0,.005,-.025);for(let i=0;i<6;i++){const a=i/6*PI*2;cyl(g,.009,.08,0x16171a,Math.cos(a)*.022,.005+Math.sin(a)*.022,-.025)}
  part(g,.014,.04,.02,0x1a1a1e,0,.058,.09,.3);part(g,.01,.012,.024,0x1a1a1e,0,.056,-.32);part(g,.02,.014,.014,0x1a1a1e,0,.055,.0);glow(g,.004,.01,.012,0xff4a3a,0,.063,-.32);
  part(g,.05,.125,.068,wd,0,-.095,.1,-.3,WOODT);glow(g,.054,.01,.07,ac,0,-.035,.075);part(g,.012,.04,.06,0x15161a,0,-.04,.02);
  glow(g,.004,.03,.12,ac,.028,.0,.02);glow(g,.004,.012,.16,ac,.0,.043,-.2);
  arms(g,sk,[0,-.115,.1],null)};
MUZ.rv=[0,.02,-.36];
HIP.rv=[.17,-.18,-.4];
ADSP.rv=[0,-.078,-.36];
