/* SOUND ENGINE - built-in synthesized gun/hit/reload sounds. Loaded BEFORE game.js */
/* ================= audio ================= */
let AC,NB,OUT,REV;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();
 OUT=AC.createGain();OUT.gain.value=S.vol/100;
 const cp=AC.createDynamicsCompressor();cp.threshold.value=-14;cp.knee.value=10;cp.ratio.value=6;cp.attack.value=.002;cp.release.value=.18;
 OUT.connect(cp);cp.connect(AC.destination);
 NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
 /* outdoor reverb / echo tail: decaying stereo noise impulse response */
 const n=Math.floor(AC.sampleRate*1.8),ir=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){const ch=ir.getChannelData(c);for(let i=0;i<n;i++){const t=i/n;ch[i]=(R()*2-1)*Math.pow(1-t,2.6)*(t<.01?t*100:1)}}
 REV=AC.createConvolver();REV.buffer=ir;const rg=AC.createGain();rg.gain.value=.5;REV.connect(rg);rg.connect(OUT);window.dispatchEvent(new Event('voxel-audio-ready'))
}catch(e){AC=null}}
function tone(f0,f1,d,ty,g){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),a=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+d);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(OUT);o.start(t);o.stop(t+d)}
function noise(d,g,hp){if(!AC)return;const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),a=AC.createGain();s.buffer=NB;f.type='highpass';f.frequency.value=hp;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(a);a.connect(OUT);s.start(t,R()*.4);s.stop(t+d)}
/* filtered noise burst at absolute time t */
function nbz(t,d,g,type,f,dst,q){const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),a=AC.createGain();s.buffer=NB;fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(a);a.connect(dst||OUT);s.start(t,R()*.4);s.stop(t+d+.02)}
/* mechanical click (magazine, bolt, pump) */
function clk(off,f,d,g){if(!AC)return;const t=AC.currentTime+off;nbz(t,d,g,'bandpass',f,OUT,4);const o=AC.createOscillator(),a=AC.createGain();o.type='square';o.frequency.setValueAtTime(f/3,t);o.frequency.exponentialRampToValueAtTime(f/6,t+d);a.gain.setValueAtTime(g*.15,t);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(OUT);o.start(t);o.stop(t+d+.01)}
/* per-gun sound profile: crack (hi-pass snap) + body (band noise) + thump (sine drop) + reverb tail */
const SP={
 ar:{cf:3200,cd:.035,cg:.5,bf:1100,bd:.13,bg:.5,f0:170,f1:42,md:.16,mg:.5,rv:.22},
 sm:{cf:4200,cd:.025,cg:.4,bf:1700,bd:.09,bg:.35,f0:220,f1:60,md:.1,mg:.32,rv:.15},
 sc:{cf:2800,cd:.045,cg:.55,bf:850,bd:.17,bg:.55,f0:130,f1:34,md:.2,mg:.6,rv:.3},
 ak:{cf:2500,cd:.04,cg:.55,bf:900,bd:.16,bg:.55,f0:140,f1:38,md:.18,mg:.6,rv:.28},
 lm:{cf:2300,cd:.045,cg:.5,bf:800,bd:.18,bg:.6,f0:120,f1:34,md:.2,mg:.7,rv:.3},
 dm:{cf:2800,cd:.05,cg:.6,bf:700,bd:.22,bg:.6,f0:110,f1:30,md:.26,mg:.7,rv:.4},
 sg:{cf:1800,cd:.06,cg:.7,bf:500,bd:.3,bg:.8,f0:85,f1:24,md:.36,mg:.9,rv:.45},
 sn:{cf:2000,cd:.08,cg:.8,bf:450,bd:.45,bg:.8,f0:75,f1:20,md:.55,mg:1,rv:.8},
 pi:{cf:2900,cd:.04,cg:.55,bf:900,bd:.18,bg:.5,f0:170,f1:40,md:.2,mg:.5,rv:.3},
 dg:{cf:2300,cd:.05,cg:.7,bf:650,bd:.28,bg:.7,f0:120,f1:28,md:.3,mg:.8,rv:.4}};
function shot(k,v,far){const p=SP[k],t=AC.currentTime,bus=AC.createGain();bus.gain.value=v;let out=bus;
 if(far){const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=cl(500+v*6000,500,6000);bus.connect(lp);out=lp}
 out.connect(OUT);const rs=AC.createGain();rs.gain.value=p.rv*(far?1.5:1);out.connect(rs);rs.connect(REV);
 const j=1+(R()-.5)*.08;
 nbz(t,p.cd,p.cg,'highpass',p.cf*j,bus);
 nbz(t,p.bd,p.bg,'bandpass',p.bf*j,bus,.9);
 nbz(t+.003,p.md*1.8,p.bg*.5,'lowpass',420,bus);
 const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(p.f0*j,t);o.frequency.exponentialRampToValueAtTime(p.f1,t+p.md);g.gain.setValueAtTime(p.mg,t);g.gain.exponentialRampToValueAtTime(.001,t+p.md);o.connect(g);g.connect(bus);o.start(t);o.stop(t+p.md+.03);
 if(!far)nbz(t+.03,.03,.12*v,'bandpass',3500,bus,3)}
function snd(k,v,far){v=v==null?1:v;if(!AC||v<=.02)return;if(AC.state==='suspended')AC.resume();
 if(SP[k]){shot(k,v,far);return}
 if(k==='kn'){noise(.12,.25*v,2500)}
 else if(k==='kt'){noise(.18,.28*v,3000);tone(900,300,.12,'sine',.06*v)}
 else if(k==='lvup'){tone(500,900,.12,'square',.12);setTimeout(()=>tone(700,1200,.18,'square',.12),120)}
 else if(k==='en'){noise(.08,.16*v,1200);tone(300,70,.08,'square',.08*v)}
 else if(k==='rl'){clk(0,1900,.05,.45);clk(.12,800,.04,.3);clk(.55,700,.08,.55);clk(.62,2200,.05,.4);clk(.95,1500,.06,.4)}
 else if(k==='bolt'){clk(0,1300,.05,.45);clk(.14,2000,.04,.4)}
 else if(k==='pump'){clk(.36,1100,.07,.5);clk(.5,1700,.05,.45)}
 else if(k==='shell'){tone(3600+R()*900,2400,.05,'triangle',.05*v)}
 else if(k==='dash'){noise(.22,.35*v,500);tone(260,700,.18,'sine',.15)}
 else if(k==='hit'){tone(1300,700,.06,'sine',.2)}
 else if(k==='head'){tone(1800,900,.09,'sine',.25)}
 else if(k==='hurt'){tone(160,60,.2,'sawtooth',.3)}
 else if(k==='die'){tone(400,40,.5,'sawtooth',.3);noise(.4,.25,150)}}

