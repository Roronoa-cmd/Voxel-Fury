/* REAL SOUND FILES (optional) - loads sounds/<code>.mp3|ogg|wav and overrides the built-in sound. Loaded AFTER game.js */
(function(){
/* --- real weapon sounds: put files in sounds/<code>.mp3 (ak, sc, sn, sm, sg, lm, dm, dg, pi, ar, kn, kt) --- */
const SMP={};
['ak','sc','sn','sm','sg','lm','dm','dg','pi','ar','kn','kt','rl','flyby'].forEach(k=>{['mp3','ogg','wav'].forEach(x=>{fetch('sounds/'+k+'.'+x).then(r=>r.ok?r.arrayBuffer():0).then(b=>{if(!b)return;const go=()=>AC.decodeAudioData(b,buf=>{if(!SMP[k])SMP[k]=buf}).catch(()=>{});AC?go():addEventListener('pointerdown',()=>setTimeout(go,300),{once:true})}).catch(()=>{})})});
const _snd=snd;snd=function(k,v,far){v=v==null?1:v;if(AC&&SMP[k]&&v>.02){if(AC.state==='suspended')AC.resume();const s=AC.createBufferSource(),g=AC.createGain();s.buffer=SMP[k];s.playbackRate.value=.97+Math.random()*.06;g.gain.value=v*(far?.7:1);s.connect(g);g.connect(OUT);s.start();return}_snd(k,v,far)};
})();
