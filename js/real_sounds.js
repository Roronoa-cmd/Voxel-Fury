(function(){
const SMP=Object.create(null),PENDING=Object.create(null),WAITING=Object.create(null),DECODING=new Set(),FETCHING=new Set();
const KEYS=['ak','sc','sn','sm','sg','lm','dm','dg','pi','ar','kn','kt','rl','flyby'];
const EXT={kn:'ogg',kt:'ogg'};const now=()=>performance.now();
function playReal(k,v,far){const buf=SMP[k];if(!AC||!buf||v<=.02)return false;if(AC.state==='suspended')AC.resume().catch(()=>{});const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.playbackRate.value=.97+Math.random()*.06;g.gain.value=v*(far?.7:1);s.connect(g);g.connect(OUT);s.start();return true}
function flush(k,useFallback){const q=WAITING[k];if(!q)return;delete WAITING[k];for(const ev of q){if(now()-ev.at>450)continue;if(!playReal(k,ev.v,ev.far)&&useFallback)_snd(k,ev.v,ev.far)}}
function decode(k){if(!AC||typeof AC.decodeAudioData!=='function'||!PENDING[k]||DECODING.has(k))return;DECODING.add(k);const raw=PENDING[k];try{AC.decodeAudioData(raw.slice(0),buf=>{SMP[k]=buf;delete PENDING[k];DECODING.delete(k);flush(k,false)},()=>{delete PENDING[k];DECODING.delete(k);flush(k,true)})}catch(e){delete PENDING[k];DECODING.delete(k);flush(k,true)}}
function decodePending(){for(const k of KEYS)decode(k)}
window.addEventListener('voxel-audio-ready',decodePending);
window.addEventListener('pointerdown',()=>setTimeout(decodePending,0),{passive:true});
for(const k of KEYS){FETCHING.add(k);const ext=EXT[k]||'wav';fetch('sounds/'+k+'.'+ext).then(r=>{if(!r.ok)throw Error('missing sound');return r.arrayBuffer()}).then(b=>{FETCHING.delete(k);PENDING[k]=b;decode(k)}).catch(()=>{FETCHING.delete(k);flush(k,true)})}
const _snd=snd;snd=function(k,v,far){v=v==null?1:v;if(AC&&SMP[k]&&playReal(k,v,far))return;if(AC&&(FETCHING.has(k)||PENDING[k]||DECODING.has(k))){const q=WAITING[k]||(WAITING[k]=[]);q.push({v,far,at:now()});if(q.length>8)q.shift();return}_snd(k,v,far)};
})();
