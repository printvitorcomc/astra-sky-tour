const stars=[
  {letter:'A',name:'Antares',type:'Red supergiant · Scorpius',ra:247.3520833333,dec:-26.4319444444,coords:'16:29:24.5  −26:25:55',fact1:['DISTANCE','~550 light-years'],fact2:['SCALE','Enormous'],audio:'/audio/01-antares.mp3',duration:18816},
  {letter:'S',name:'Sirius',type:'Blue-white star system · Canis Major',ra:101.2870833333,dec:-16.7161111111,coords:'06:45:08.9  −16:42:58',fact1:['DISTANCE','8.6 light-years'],fact2:['KNOWN FOR','Brightest night star'],audio:'/audio/02-sirius.mp3',duration:18048},
  {letter:'T',name:'Tarazed',type:'Orange bright giant · Aquila',ra:296.565,dec:10.6133333333,coords:'19:46:15.6  +10:36:48',fact1:['DISTANCE','~395 light-years'],fact2:['LIGHT LEFT','Around the 1600s'],audio:'/audio/03-tarazed.mp3',duration:16368},
  {letter:'R',name:'Rigel',type:'Blue supergiant · Orion',ra:78.6345833333,dec:-8.2016666667,coords:'05:14:32.3  −08:12:06',fact1:['DISTANCE','~860 light-years'],fact2:['COLOR','Blue-white'],audio:'/audio/04-rigel.mp3',duration:16704},
  {letter:'A',name:'Aldebaran',type:'Orange giant · Taurus',ra:68.98,dec:16.5091666667,coords:'04:35:55.2  +16:30:33',fact1:['DISTANCE','~65 light-years'],fact2:['KNOWN AS',"The Bull's eye"],audio:'/audio/05-aldebaran.mp3',duration:15936}
];

let aladin=null,tourToken=0,currentIndex=-1,skyReady=false;
let musicTrack=null,narrationTrack=null,musicFadeFrame=null,narrationResolve=null;
const narrationCache=new Map();
const $=id=>document.getElementById(id);
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const wrap360=x=>((x%360)+360)%360;
const shortestDelta=(a,b)=>{let d=b-a;while(d>180)d-=360;while(d<-180)d+=360;return d};

function setProgress(i){document.querySelectorAll('.letter').forEach((el,j)=>{el.classList.toggle('active',j===i);el.classList.toggle('done',j<i)})}
function clearProgress(){document.querySelectorAll('.letter').forEach(el=>el.classList.remove('active','done'))}
function hideCard(){$('card').classList.add('hidden');$('nextBtn').classList.remove('on');$('fallbackTranscript').classList.remove('on')}
function setTravel(on,text='Travelling'){$('travel').classList.toggle('on',on);$('warp').classList.toggle('on',on);$('travelText').textContent=text}
function renderStar(i){const s=stars[i];$('stopLabel').textContent=`STOP ${i+1} · ${s.letter}`;$('starName').textContent=s.name;$('starType').textContent=s.type;$('fact1Label').textContent=s.fact1[0];$('fact1').textContent=s.fact1[1];$('fact2Label').textContent=s.fact2[0];$('fact2').textContent=s.fact2[1];$('card').classList.remove('hidden')}
function showNext(){const next=$('nextBtn');if(currentIndex<stars.length-1)next.textContent=`Continue to ${stars[currentIndex+1].name}`;else next.textContent='Finish the journey';next.classList.add('on')}

function preloadNarrations(){
  stars.forEach((s,i)=>{const a=new Audio(s.audio);a.preload='auto';a.load();narrationCache.set(i,a)})
}
function stopNarration(){
  if(narrationTrack){try{narrationTrack.pause();narrationTrack.currentTime=0}catch(_){}}
  narrationTrack=null;
  if(narrationResolve){const r=narrationResolve;narrationResolve=null;r()}
}
function fadeMusicTo(target,duration=900){
  if(!musicTrack)musicTrack=$('musicTrack');
  if(!musicTrack||!musicTrack.getAttribute('src'))return;
  if(musicFadeFrame)cancelAnimationFrame(musicFadeFrame);
  const start=musicTrack.volume,started=performance.now(),safe=Math.max(0,Math.min(1,target));
  function step(now){const p=Math.min(1,(now-started)/duration),e=1-Math.pow(1-p,3);musicTrack.volume=start+(safe-start)*e;if(p<1)musicFadeFrame=requestAnimationFrame(step)}
  musicFadeFrame=requestAnimationFrame(step);
}
function playNarration(i){
  return new Promise(resolve=>{
    stopNarration();
    let audio=narrationCache.get(i);
    if(!audio){audio=new Audio(stars[i].audio);audio.preload='auto';narrationCache.set(i,audio)}
    narrationTrack=audio;
    narrationResolve=resolve;
    try{audio.currentTime=0}catch(_){}
    audio.volume=1;
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;fadeMusicTo(.17,1100);if(narrationTrack===audio)narrationTrack=null;if(narrationResolve===resolve)narrationResolve=null;resolve()};
    audio.onplay=()=>fadeMusicTo(.035,850);
    audio.onended=finish;
    audio.onerror=finish;
    audio.play().catch(finish);
  });
}
function setMusicLevel(v){fadeMusicTo(v,900)}
function startMusic(){if(!musicTrack)musicTrack=$('musicTrack');if(!musicTrack||!musicTrack.getAttribute('src'))return;musicTrack.volume=.17;musicTrack.play().catch(()=>{})}

function flyTo(target,token,duration){
  return new Promise(resolve=>{
    if(!aladin||token!==tourToken){resolve();return}
    const center=aladin.getRaDec();
    const startRa=center[0],startDec=center[1],dRa=shortestDelta(startRa,target.ra),dDec=target.dec-startDec;
    const currentFov=(aladin.getFov&&aladin.getFov()[0])||6;
    const startFov=Math.min(150,Math.max(6,currentFov)),cruise=132,endFov=4.6,start=performance.now();
    try{aladin.setProjection('TAN')}catch(_){}
    function frame(now){
      if(token!==tourToken){resolve();return}
      const raw=Math.min(1,(now-start)/duration),p=ease(raw);
      const ra=wrap360(startRa+dRa*p),dec=startDec+dDec*p;
      let fov;
      if(raw<.43){const q=ease(raw/.43);fov=startFov+(cruise-startFov)*q}
      else{const q=ease((raw-.43)/.57);fov=cruise+(endFov-cruise)*q}
      try{aladin.gotoRaDec(ra,dec);aladin.setFoV(fov)}catch(_){}
      if(raw<1)requestAnimationFrame(frame);else{try{aladin.gotoRaDec(target.ra,target.dec);aladin.setFoV(endFov)}catch(_){}resolve()}
    }
    requestAnimationFrame(frame)
  })
}

async function arriveAt(i){
  const token=tourToken;
  currentIndex=i;
  setProgress(i);
  hideCard();
  const s=stars[i];
  setTravel(true,`Travelling to ${s.name}`);
  setMusicLevel(.17);

  // The click starts both experiences together. Flight length tracks the narration,
  // with a little extra breathing room so motion feels slow and deliberate.
  const flightDuration=Math.round(s.duration*1.15);
  const narrationPromise=playNarration(i);
  const flightPromise=flyTo(s,token,flightDuration);
  await Promise.all([narrationPromise,flightPromise]);

  if(token!==tourToken)return;
  setTravel(false);
  renderStar(i);
  showNext();
}

async function finishTour(){
  const token=tourToken;
  hideCard();
  setTravel(true,'Returning to the full sky');
  setMusicLevel(.17);
  try{aladin.setProjection('AIT');aladin.gotoRaDec(0,0);aladin.setFoV(360)}catch(_){}
  await new Promise(r=>setTimeout(r,2400));
  if(token!==tourToken)return;
  setTravel(false);clearProgress();document.querySelectorAll('.letter').forEach(el=>el.classList.add('done'));$('endcard').classList.add('on')
}

function startJourney(){
  if(!skyReady)return;
  startMusic();
  $('gate').classList.add('off');
  $('endcard').classList.remove('on');
  stopNarration();
  tourToken++;
  clearProgress();
  try{aladin.setProjection('AIT');aladin.gotoRaDec(0,0);aladin.setFoV(360)}catch(_){}
  // Important for mobile autoplay: narration begins directly from the user's click.
  arriveAt(0);
}
function goNext(){if(currentIndex<stars.length-1){arriveAt(currentIndex+1)}else finishTour()}

function addMarkers(){
  const cat=A.catalog({name:'ASTRA destinations',sourceSize:16,shape:'circle',color:'#ffffff',labelColumn:'label',displayLabel:true,labelColor:'#ffffff',labelFont:'500 12px Arial, sans-serif',onClick:'showPopup'});
  aladin.addCatalog(cat);
  cat.addSources(stars.map(s=>A.source(s.ra,s.dec,{label:`${s.letter} · ${s.name}`,Name:s.name,Coordinates:s.coords})))
}
function init(){
  preloadNarrations();
  if(typeof A==='undefined'){$('loader').innerHTML='<div class="loader-inner"><h1>ASTRA</h1><p>The sky viewer could not load. Please reload.</p></div>';return}
  A.init.then(()=>{
    aladin=A.aladin('#aladin-lite-div',{survey:'P/DSS2/color',target:'00 00 00 +00 00 00',fov:360,projection:'AIT',cooFrame:'ICRS',showCooGrid:false,showReticle:false,showFrame:false,showLayersControl:false,showProjectionControl:false,showFullscreenControl:false,showZoomControl:true,showGotoControl:false,showContextMenu:false});
    addMarkers();skyReady=true;setTimeout(()=>$('loader').classList.add('off'),650)
  }).catch(()=>{$('loader').innerHTML='<div class="loader-inner"><h1>ASTRA</h1><p>The astronomical viewer hit an error. Please reload.</p></div>'})
}

$('startBtn').addEventListener('click',startJourney);
$('nextBtn').addEventListener('click',goNext);
$('replay').addEventListener('click',()=>{$('endcard').classList.remove('on');$('gate').classList.remove('off');clearProgress();currentIndex=-1;stopNarration();try{aladin.setProjection('AIT');aladin.gotoRaDec(0,0);aladin.setFoV(360)}catch(_){}});
window.addEventListener('load',init);
