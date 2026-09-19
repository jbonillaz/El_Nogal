/* EL NOGAL · Misión Memoria ·
*/

(function(){function setVH(){document.documentElement.style.setProperty('--vh',window.innerHeight*0.01+'px')}setVH();window.addEventListener('resize',setVH,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(setVH,250),{passive:true});})();

// Cada apertura del archivo comienza una aventura nueva.
try{['nogalScore','nogalDone','nogalAvatarPos','nogalCarta','nogalSceneFound','nogalXP','nogalAchievements','nogalCluesFound','nogalAbilityUsed','nogalVerification'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();}catch(e){}
let score=0,avatar='BOY';const missionsDone=new Set();
const gameState={avatar:'BOY',currentWorld:1,completedWorlds:[],score:0,xp:0,level:1,elapsedTime:0,gameStarted:false,gameFinished:false,activeMission:null,abilityUsed:false};
const INVESTIGATOR_LEVELS=[{min:0,name:'Aprendiz de memoria',icon:'🌱'},{min:30,name:'Explorador de fuentes',icon:'🧭'},{min:70,name:'Investigador/a',icon:'🔎'},{min:120,name:'Guardián de la memoria',icon:'🛡️'},{min:180,name:'Constructor/a de paz',icon:'🕊️'}];
const ACHIEVEMENTS={first:{name:'Primera pista',icon:'🧩',desc:'Descubriste tu primera pista oculta.'},clues3:{name:'Rastreador/a',icon:'🗺️',desc:'Encontraste 3 pistas del mapa.'},clues6:{name:'Cartógrafo/a de memoria',icon:'🧭',desc:'Encontraste las 6 pistas ocultas.'},truth:{name:'Ojo crítico',icon:'🕵️',desc:'Completaste el Centro de Verificación.'},world3:{name:'Conector/a',icon:'🔗',desc:'Completaste 3 mundos.'},world7:{name:'Carta por la paz',icon:'💌',desc:'Completaste toda la aventura.'}};
function getXP(){return Number(sessionStorage.getItem('nogalXP')||'0');}
function getFoundClues(){try{return new Set(JSON.parse(sessionStorage.getItem('nogalCluesFound')||'[]'));}catch(e){return new Set();}}
function getAchievements(){try{return new Set(JSON.parse(sessionStorage.getItem('nogalAchievements')||'[]'));}catch(e){return new Set();}}
function saveSet(key,set){sessionStorage.setItem(key,JSON.stringify([...set]));}
function getLevel(xp){let out=INVESTIGATOR_LEVELS[0];for(const l of INVESTIGATOR_LEVELS){if(xp>=l.min)out=l;else break}return out;}
function addXP(n,reason=''){if(!n)return;const xp=getXP()+n;sessionStorage.setItem('nogalXP',String(xp));gameState.xp=xp;syncInvestigatorUI();if(reason)showToast('✨ +'+n+' XP · '+reason);}
function unlockAchievement(id){const set=getAchievements();if(set.has(id))return false;set.add(id);saveSet('nogalAchievements',set);const a=ACHIEVEMENTS[id];if(a)showToast(a.icon+' Logro desbloqueado: '+a.name);syncInvestigatorUI();return true;}
function syncInvestigatorUI(){const xp=getXP(),lvl=getLevel(xp),next=INVESTIGATOR_LEVELS.find(l=>l.min>xp);gameState.xp=xp;gameState.level=INVESTIGATOR_LEVELS.indexOf(lvl)+1;const level=document.getElementById('mapLevel'),xpEl=document.getElementById('mapXP'),ability=document.getElementById('profileAbility');if(level)level.textContent=lvl.icon+' Nivel '+gameState.level+' · '+lvl.name;if(xpEl)xpEl.textContent=next?(xp+' / '+next.min+' XP'):(xp+' XP · nivel máximo');if(ability){ability.textContent=gameState.abilityUsed?'✓ Habilidad usada':'⚡ Usar habilidad';ability.disabled=gameState.abilityUsed;}}
function showToast(text){const el=document.getElementById('gameToast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2400);}
function useAvatarAbility(){if(gameState.abilityUsed)return;gameState.abilityUsed=true;sessionStorage.setItem('nogalAbilityUsed','1');syncInvestigatorUI();const found=getFoundClues();if(avatar==='BOY'){const c=MAP_CLUES.find(x=>!found.has(x.id)&&x.minWorld<=missionsDone.size);if(c){showToast('🧭 Brújula: pista marcada en el mapa.');revealMapClue(c.id,true);}else showToast('🧭 Brújula: aún no hay una nueva pista disponible.');}else if(avatar==='🧑🏽‍💻'||avatar==='🕵🏽'){openVerificationCenter();}else if(avatar==='🧑🏽‍🔬'){addXP(12,'Evidencia bien observada');}else if(avatar==='🧗🏽'){addXP(10,'Impulso de explorador');}else if(avatar==='🎧'){showToast('🎧 Ritmo viajero: mantén el foco y sigue la ruta.');}else if(avatar==='🎨'){openAchievements();}else{const n=missionsDone.size+1;showToast('🦊 Guía: tu siguiente objetivo es el Mundo '+Math.min(n,7)+'.');}}
function syncGameState(){gameState.avatar=avatar;gameState.currentWorld=Math.min(7,missionsDone.size+1);gameState.completedWorlds=[...missionsDone].sort((a,b)=>a-b);gameState.score=score;gameState.gameFinished=missionsDone.size===7;gameState.xp=getXP();gameState.abilityUsed=sessionStorage.getItem('nogalAbilityUsed')==='1';syncInvestigatorUI();}

function updateMapProfile(){const holder=document.getElementById('mapProfile'),name=document.getElementById('mapProfileName'),fill=document.getElementById('mapProfileBarFill'),prog=document.getElementById('mapProfileProgress');if(!holder)return;const found=avatars.find(a=>a[0]===avatar);let face=document.getElementById('mapProfileAvatar');if(avatar==='BOY'){if(!face||face.tagName!=='IMG'){if(face)face.remove();face=document.createElement('img');face.id='mapProfileAvatar';holder.insertBefore(face,holder.querySelector('.mapProfileText'));}face.src='avatar_nino.png';face.alt='Avatar seleccionado: Niño explorador';face.className='';}else{if(!face||face.tagName!=='SPAN'){if(face)face.remove();face=document.createElement('span');face.id='mapProfileAvatar';holder.insertBefore(face,holder.querySelector('.mapProfileText'));}face.className='profileEmoji';face.textContent=avatar;}if(name)name.textContent=found?.[1]||'Niño explorador';const n=missionsDone.size;if(fill)fill.style.width=(n/7*100)+'%';if(prog)prog.textContent=n+' / 7 mundos';}function syncMap(){syncGameState();const done=[...missionsDone];const next=done.length+1;for(let n=1;n<=7;n++){const el=document.getElementById('hot'+n);if(!el)continue;const completed=missionsDone.has(n);const unlocked=n===next;el.classList.toggle('locked',!unlocked&&!completed);el.classList.toggle('completed',completed);el.classList.toggle('available',unlocked);el.setAttribute('aria-disabled',(!unlocked&&!completed)?'true':'false');const lk=el.querySelector('.dynamicLock');if(lk)lk.textContent=completed?'✓':(unlocked?'🔓':'🔒');const av=el.querySelector('.dynamicAvatar');if(av)av.textContent=avatar;el.title=completed?'Mundo completado · Puedes revisarlo':unlocked?'¡Haz clic aquí para entrar!':'🔒 Completa primero el Mundo '+(n-1);}const mp=document.getElementById('mapProgress');if(mp)mp.textContent='⭐ '+done.length+' / 7 misiones completadas';const mf=document.getElementById('mapProgressFill');if(mf)mf.style.width=(done.length/7*100)+'%';const order=document.getElementById('mapOrder');if(order)order.textContent=done.length>=7?'🏆 ¡Aventura completada!':'🔓 Mundo '+next+' disponible';const pulse=document.querySelector('.mapMissionPulse');if(pulse){pulse.style.display='none'}updateMapProfile();syncMapClues();syncInvestigatorUI();}
function mapMission(n){
  const next=missionsDone.size+1;
  if(n!==next){
    const msg=document.getElementById('mapLockMessage');
    document.getElementById('lockText').textContent=n<next?'✅ Ya completaste este mundo. Puedes continuar con el siguiente.':'🔒 Completa primero el Mundo '+(next-1)+' para desbloquear el Mundo '+n+'.';
    msg.classList.add('show');setTimeout(()=>msg.classList.remove('show'),1800);return;
  }
  travelToMission(n);
}

const MAP_CLUES=[
 {id:'c1',x:20,y:54,minWorld:0,icon:'🔎',title:'Pista de contexto',text:'Para comprender un acontecimiento, no basta con una fecha: conviene ubicarlo en su contexto histórico.'},
 {id:'c2',x:42,y:13,minWorld:1,icon:'📅',title:'Pista temporal',text:'Una fecha permite ordenar la historia y contrastar relatos sobre cuándo ocurrió un hecho.'},
 {id:'c3',x:63,y:16,minWorld:2,icon:'📚',title:'Pista de fuente',text:'Una fuente identificable permite preguntar quién informa, cuándo y con qué respaldo.'},
 {id:'c4',x:82,y:47,minWorld:3,icon:'🫶',title:'Pista de cuidado',text:'Hablar de violencia y memoria requiere respeto por las personas afectadas y evita convertir el dolor en espectáculo.'},
 {id:'c5',x:45,y:57,minWorld:4,icon:'🕵️',title:'Pista de verificación',text:'Si una publicación no tiene autor, fecha o respaldo, conviene verificar antes de compartirla.'},
 {id:'c6',x:42,y:78,minWorld:5,icon:'🕊️',title:'Pista de paz',text:'Cuidar, escuchar, verificar y argumentar con fuentes son prácticas que pueden apoyar una convivencia respetuosa.'}
];
function syncMapClues(){const found=getFoundClues(),completed=missionsDone.size;MAP_CLUES.forEach(c=>{const el=document.getElementById('clue-'+c.id);if(!el)return;const available=!found.has(c.id)&&completed>=c.minWorld;el.classList.toggle('found',found.has(c.id));el.classList.toggle('available',available);el.disabled=!available;el.setAttribute('aria-hidden',available?'false':'true');});const count=document.getElementById('clueCount');if(count)count.textContent=found.size+' / '+MAP_CLUES.length;if(found.size>=1)unlockAchievement('first');if(found.size>=3)unlockAchievement('clues3');if(found.size>=6)unlockAchievement('clues6');}
function revealMapClue(id){const c=MAP_CLUES.find(x=>x.id===id);if(!c)return;const found=getFoundClues();if(found.has(id))return;found.add(id);saveSet('nogalCluesFound',found);addXP(8,'Pista descubierta');if(found.size>=1)unlockAchievement('first');if(found.size>=3)unlockAchievement('clues3');if(found.size>=6)unlockAchievement('clues6');const m=document.getElementById('mapInfoModal'),box=document.getElementById('mapInfoContent');if(m&&box){box.innerHTML='<span class="tag">PISTA OCULTA</span><h3>'+c.icon+' '+c.title+'</h3><p class="lead">'+c.text+'</p><div class="infoRow"><span>🧠</span><div>Esta pista suma experiencia de investigador y queda registrada durante esta aventura.</div></div><div class="overlayContinue"><button class="btn primary" type="button" onclick="closeMapInfo()">🎮 Volver al mapa</button></div>';m.classList.add('open');m.setAttribute('aria-hidden','false');}syncMapClues();playUISound('success');}
function openAchievements(){const m=document.getElementById('mapInfoModal'),c=document.getElementById('mapInfoContent');if(!m||!c)return;const found=getAchievements();c.innerHTML='<span class="tag">PROGRESO</span><h3>🏅 Logros del investigador</h3><p class="lead">Los logros reconocen acciones de exploración, verificación y memoria durante esta partida.</p><div class="achievementGrid">'+Object.entries(ACHIEVEMENTS).map(([id,a])=>'<article class="achievementCard '+(found.has(id)?'earned':'locked')+'"><span>'+a.icon+'</span><div><b>'+a.name+'</b><small>'+a.desc+'</small></div><strong>'+(found.has(id)?'✓':'🔒')+'</strong></article>').join('')+'</div><div class="overlayContinue"><button class="btn secondary" type="button" onclick="closeMapInfo()">Cerrar</button></div>';m.classList.add('open');m.setAttribute('aria-hidden','false');}
const VERIFY_CASES=[
 {q:'Una publicación anónima afirma una cifra, pero no muestra autor ni fuente. ¿Qué haces?',a:['La comparto porque parece convincente.','La verifico antes de compartirla.'],correct:1},
 {q:'Una nota identifica medio, fecha y autor. ¿Qué paso sigue?',a:['Contrastar el dato con otra fuente.','Convertirla automáticamente en verdad absoluta.'],correct:0},
 {q:'Un mensaje reenviado dice “me contaron que…”. ¿Cómo lo tratas?',a:['Como información pendiente de verificar.','Como una fuente histórica suficiente.'],correct:0}
];
function openVerificationCenter(){const m=document.getElementById('mapInfoModal'),c=document.getElementById('mapInfoContent');if(!m||!c)return;let idx=0,correct=0;const render=()=>{if(idx>=VERIFY_CASES.length){unlockAchievement('truth');if(sessionStorage.getItem('nogalVerificationDone')!=='1'){sessionStorage.setItem('nogalVerificationDone','1');addXP(15,'Centro de Verificación completado');}c.innerHTML='<span class="tag">CENTRO DE VERIFICACIÓN</span><h3>🕵️ ¡Misión de verificación completada!</h3><p class="lead">Has practicado tres hábitos: identificar respaldo, contrastar y reconocer información pendiente de verificar.</p><div class="mini green"><h3>🔐 Alfabetización digital</h3><p>No necesitas creer o negar de inmediato: puedes <b>preguntar, contrastar y verificar</b>.</p></div><div class="overlayContinue"><button class="btn primary" type="button" onclick="closeMapInfo()">🎮 Volver al mapa</button></div>';return;}const q=VERIFY_CASES[idx];c.innerHTML='<span class="tag">CENTRO DE VERIFICACIÓN · '+(idx+1)+'/3</span><h3>🔐 '+q.q+'</h3><div class="verifyOptions">'+q.a.map((x,i)=>'<button class="verifyOption" type="button" onclick="answerVerification('+i+')">'+x+'</button>').join('')+'</div><div id="verifyFb" class="feedback"></div>';};window.answerVerification=function(choice){const fb=document.getElementById('verifyFb');if(choice!==VERIFY_CASES[idx].correct){fb.style.display='block';fb.textContent='💡 Pista: busca respaldo identificable y contrasta antes de compartir.';return;}correct++;fb.style.display='block';fb.textContent='✅ Criterio correcto. Continúa.';idx++;setTimeout(render,450);};render();m.classList.add('open');m.setAttribute('aria-hidden','false');playUISound('open');}
const missionTravel={
  1:{x:15,y:39,name:'Mundo 1 · Contexto',icon:'🧭',text:'Llegaste al Club El Nogal. Ahora explora el contexto antes de continuar.'},
  2:{x:31,y:21,name:'Mundo 2 · El hecho',icon:'🧩',text:'Reconstruye las pistas del acontecimiento.'},
  3:{x:56,y:24,name:'Mundo 3 · Consecuencias',icon:'👥',text:'Descubre cómo el hecho afectó a personas y comunidad.'},
  4:{x:74,y:35,name:'Mundo 4 · Memoria y cuidado',icon:'🧠',text:'Conecta memoria, escucha y cuidado.'},
  5:{x:72,y:58,name:'Mundo 5 · Detectives de la verdad',icon:'🕵️',text:'Investiga y aprende a verificar información.'},
  6:{x:58,y:68,name:'Mundo 6 · Ruta de atención',icon:'🧭',text:'Toma decisiones responsables para avanzar.'},
  7:{x:30,y:68,name:'Mundo final · Mi carta por la paz',icon:'💌',text:'Construye tu mensaje final.'}
};
let mapAvatarPos={x:9,y:48};
if(!mapAvatarPos || typeof mapAvatarPos.x!=='number' || typeof mapAvatarPos.y!=='number') mapAvatarPos={x:9,y:48};
function placeTravelAvatar(x,y){const ta=document.getElementById('travelAvatar'),sh=document.getElementById('travelShadow');if(!ta||!sh)return;ta.style.setProperty('--start-x',x+'%');ta.style.setProperty('--start-y',y+'%');sh.style.setProperty('--start-x',x+'%');sh.style.setProperty('--start-y',y+'%');ta.classList.add('show');sh.classList.add('show');}
const routeSegments={
  1:{from:{x:9,y:48},to:{x:15,y:39},c1:{x:11,y:46},c2:{x:14,y:42}},
  2:{from:{x:15,y:39},to:{x:31,y:21},c1:{x:20,y:34},c2:{x:25,y:25}},
  3:{from:{x:31,y:21},to:{x:56,y:24},c1:{x:38,y:18},c2:{x:48,y:20}},
  4:{from:{x:56,y:24},to:{x:74,y:35},c1:{x:63,y:27},c2:{x:68,y:31}},
  5:{from:{x:74,y:35},to:{x:72,y:58},c1:{x:76,y:43},c2:{x:75,y:51}},
  6:{from:{x:72,y:58},to:{x:58,y:68},c1:{x:68,y:61},c2:{x:61,y:66}},
  7:{from:{x:58,y:68},to:{x:30,y:68},c1:{x:51,y:70},c2:{x:41,y:70}}
};
function cubic(a,b,c,d,t){const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};}
function animateRouteAvatar(n,start,target,duration=1750){
  const ta=document.getElementById('travelAvatar'),sh=document.getElementById('travelShadow');
  const seg=routeSegments[n]||{from:start,to:target,c1:{x:(start.x+target.x)/2,y:start.y},c2:{x:(start.x+target.x)/2,y:target.y}};
  const a={x:start.x,y:start.y},d={x:target.x,y:target.y};
  const b=seg.c1||{x:(a.x+d.x)/2,y:a.y},c=seg.c2||{x:(a.x+d.x)/2,y:d.y};
  const t0=performance.now();
  ta.classList.add('walkingRoute','show');
  sh.classList.add('show');
  function frame(now){
    const t=Math.min(1,(now-t0)/duration),p=cubic(a,b,c,d,t);
    ta.style.left=`calc(${p.x}% - 43px)`;ta.style.top=`calc(${p.y}% - 50px)`;
    sh.style.left=`calc(${p.x}% - 20px)`;sh.style.top=`calc(${p.y}% + 30px)`;
    const p2=cubic(a,b,c,d,Math.min(1,t+.015));
    const dx=p2.x-p.x;
    ta.style.transform=`scale(${1+Math.sin(t*Math.PI)*.08}) rotate(${Math.max(-7,Math.min(7,dx*1.5))}deg)`;
    if(t<1)requestAnimationFrame(frame);else{ta.style.transform='scale(1.08)';}
  }
  requestAnimationFrame(frame);
}
function travelToMission(n){
  const target=missionTravel[n]; if(!target)return;
  const ta=document.getElementById('travelAvatar'),sh=document.getElementById('travelShadow'),status=document.getElementById('travelStatus');
  const trans=document.getElementById('mapTransition'),card=document.getElementById('enterWorldCard');
  const icon=document.getElementById('enterWorldIcon'),title=document.getElementById('enterWorldTitle'),text=document.getElementById('enterWorldText');
  if(!ta||!trans||!card)return;
  const start=mapAvatarPos||{x:15,y:39};
  const seg=routeSegments[n]||{from:start,to:target};
  const distance=Math.hypot(target.x-start.x,target.y-start.y);
  const duration=Math.max(1100,Math.min(2400,900+distance*32));
  updateTravelAvatar();
  ta.classList.remove('traveling');
  sh.classList.remove('traveling');
  ta.style.left=`calc(${start.x}% - 43px)`;ta.style.top=`calc(${start.y}% - 50px)`;
  sh.style.left=`calc(${start.x}% - 20px)`;sh.style.top=`calc(${start.y}% + 30px)`;
  status.textContent='🚶 Tu avatar sigue el camino hacia el Mundo '+n+'…';status.classList.add('show');
  document.querySelectorAll('.mapHotspot').forEach(b=>b.style.pointerEvents='none');
  document.getElementById('hot'+n)?.classList.add('routeWorldActive');
  animateRouteAvatar(n,start,target,duration);
  setTimeout(()=>{
    status.textContent='✨ ¡Llegaste al Mundo '+n+'!';
    trans.style.setProperty('--tx',target.x+'%');trans.style.setProperty('--ty',target.y+'%');trans.classList.add('active');
    icon.textContent=target.icon;title.textContent=target.name;text.textContent=target.text;card.classList.add('show');
  },duration-250);
  setTimeout(()=>{
    mapAvatarPos={x:target.x,y:target.y};localStorage.setItem('nogalAvatarPos',JSON.stringify(mapAvatarPos));
    startGame(n);
    ta.classList.remove('walkingRoute');sh.classList.remove('show');status.classList.remove('show');card.classList.remove('show');trans.classList.remove('active');
    document.getElementById('hot'+n)?.classList.remove('routeWorldActive');
    document.querySelectorAll('.mapHotspot').forEach(b=>b.style.pointerEvents='');
  },duration+650);
}

const avatars=[['BOY','Niño explorador','Aventurero'],['🧑🏽‍💻','Tecnoexplorador','Pistas digitales'],['🧗🏽','Escalador','Supera retos'],['🎧','Ritmo viajero','Explora con música'],['🧑🏽‍🔬','Científico/a','Busca evidencias'],['🕵🏽','Detective','Investiga y verifica'],['🎨','Artista','Crea y recuerda'],['🦊','Zorro guía','Compañero curioso']];
function speak(t){if(!('speechSynthesis'in window)){alert('La lectura de voz no está disponible en este navegador.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='es-CO';u.rate=.95;speechSynthesis.speak(u)}
function setScore(n){score+=n;gameState.score=score;document.getElementById('score').textContent=score;document.getElementById('finalScore').textContent=score+' puntos';document.getElementById('badge').textContent=score>=120?'Constructor de paz':score>=60?'Explorador avanzado':'Novato';addXP(Math.max(1,Math.round(n*.65)));updateMapProfile();if(missionsDone.size>=3)unlockAchievement('world3');if(missionsDone.size>=7)unlockAchievement('world7');}
function go(id){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));document.body.classList.toggle('mapMode',id==='mapa');if(id==='mapa'){startGameTimer();}window.scrollTo({top:0,behavior:'smooth'})}
function renderAvatarFace(el,value){if(!el)return;if(value==='BOY'){el.innerHTML='<img src="avatar_nino.png" alt="Niño explorador">';}else{el.textContent=value;}}
function updateTravelAvatar(){updateMapProfile();const box=document.getElementById('travelAvatar'),img=document.getElementById('travelAvatarImg');if(!box)return;if(avatar==='BOY'){if(!img){box.innerHTML='<img id="travelAvatarImg" src="avatar_nino.png" alt="Tu avatar: niño explorador">';}else img.src='avatar_nino.png';box.classList.add('boyAvatar');}else{box.innerHTML='<span class="emojiAvatar">'+avatar+'</span>';box.classList.remove('boyAvatar');}}
function avatarMarkup(a){return a[0]==='BOY'?'<img src="avatar_nino.png" alt="Niño explorador">':'<span>'+a[0]+'</span>';}
function initAvatars(){const b=document.getElementById('avatars');if(!b)return;avatars.forEach((a,i)=>{const x=document.createElement('button');x.type='button';x.className='avatarChoice'+(i===0?' selected':'');x.innerHTML='<div class="avatarFace">'+avatarMarkup(a)+'</div><b>'+a[1]+'</b>';x.onclick=()=>selectAvatar(i);b.appendChild(x);});renderModalAvatars();}
function selectAvatar(i){const a=avatars[i];if(!a)return;document.querySelectorAll('.avatarChoice,.avatarPick').forEach(z=>z.classList.remove('selected'));document.querySelectorAll('.avatarChoice')[i]?.classList.add('selected');document.querySelectorAll('.avatarPick')[i]?.classList.add('selected');avatar=a[0];document.getElementById('chosen').textContent=a[1];document.getElementById('modalChosen').textContent=a[1];updateTravelAvatar();localStorage.setItem('nogalAvatar',JSON.stringify(a));}
function renderModalAvatars(){const g=document.getElementById('avatarGrid');if(!g)return;g.innerHTML='';avatars.forEach((a,i)=>{const x=document.createElement('button');x.type='button';x.className='avatarPick'+(avatar===a[0]?' selected':'');x.innerHTML='<span class="avatarBig">'+avatarMarkup(a)+'</span><b>'+a[1]+'</b><span class="avatarTag">'+a[2]+'</span>';x.addEventListener('click',()=>selectAvatar(i));g.appendChild(x);});}
function openAvatarPicker(){const m=document.getElementById('avatarModal');if(!m)return;renderModalAvatars();document.getElementById('modalChosen').textContent=avatars.find(a=>a[0]===avatar)?.[1]||'Niño explorador';m.classList.add('open');m.setAttribute('aria-hidden','false');}
function closeAvatarPicker(){const m=document.getElementById('avatarModal');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');}

function startGame(n){
  go('mapa');
  gameState.activeMission=n; gameState.gameStarted=true; syncGameState();
  const ov=document.getElementById('missionOverlay'), area=document.getElementById('overlayContent');
  if(!ov||!area)return;
  document.getElementById('overlayTag').textContent='MISIÓN '+n;
  document.getElementById('overlayAvatar').innerHTML=avatar==='BOY'?'<img src="avatar_nino.png" alt="Avatar" style="width:52px;height:64px;object-fit:contain">':avatar;
  const names={1:['Mundo 1 · Contexto','Conoce el contexto antes de avanzar.'],2:['Mundo 2 · El hecho','Reconstruye las pistas históricas.'],3:['Mundo 3 · Consecuencias','Relaciona el hecho con sus impactos.'],4:['Mundo 4 · Memoria','Encuentra parejas de cuidado y memoria.'],5:['Mundo 5 · Verdad','Detecta información que necesita verificación.'],6:['Mundo 6 · Ruta de atención','Decide y avanza con cuidado.'],7:['Mundo final · Carta por la paz','Construye tu mensaje final.']};
  const meta=names[n]||names[1]; document.getElementById('overlayTitle').textContent=meta[0]; document.getElementById('overlaySubtitle').textContent=meta[1];
  area.innerHTML=''; ov.classList.add('open'); ov.setAttribute('aria-hidden','false');
  if(n===7){ area.innerHTML='<div class="mini purple"><h3>💌 Tu carta por la paz</h3><p>Has llegado al último mundo. Escribe tu reflexión y completa la aventura.</p><div class="overlayContinue"><button class="btn primary" type="button" onclick="openFinalReflection()">💌 Abrir carta</button></div></div>'; return; }
  if(n===1)mission1(area);if(n===2)mission2(area);if(n===3)mission3(area);if(n===4)mission4(area);if(n===5)mission5(area);if(n===6)mission6(area);
}
function closeMissionOverlay(){const ov=document.getElementById('missionOverlay');if(!ov)return;ov.classList.remove('open');ov.setAttribute('aria-hidden','true');}
function openFinalReflection(){closeMissionOverlay();openMapCarta(true);}

function finish(n,points){
  if(!missionsDone.has(n)){
    missionsDone.add(n);localStorage.setItem('nogalDone',JSON.stringify([...missionsDone]));setScore(points);
    if(missionTravel[n]){mapAvatarPos={x:missionTravel[n].x,y:missionTravel[n].y};localStorage.setItem('nogalAvatarPos',JSON.stringify(mapAvatarPos));}
  }
  gameState.activeMission=null; syncMap();if(n===3)unlockAchievement('world3');if(n===7)unlockAchievement('world7');
  const ov=document.getElementById('missionOverlay');
  if(missionsDone.size===7){
    gameState.gameFinished=true;
    closeMapInfo();
    document.getElementById('certificate').style.display='block';
    if(ov && ov.classList.contains('open')) closeMissionOverlay();
    setTimeout(()=>showAdventureComplete(),260);
    return;
  }
  if(ov && ov.classList.contains('open')){closeMissionOverlay();setTimeout(()=>{go('mapa');placeTravelAvatar(mapAvatarPos.x,mapAvatarPos.y);showNextWorldNotice();},260);}
}
function showNextWorldNotice(){const n=missionsDone.size+1;if(n>7)return;const el=document.getElementById('mapLockMessage');if(!el)return;document.getElementById('lockText').textContent='🔓 ¡Mundo '+n+' desbloqueado! Sigue el camino para continuar.';el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200);}
function showAdventureComplete(){const el=document.getElementById('adventureComplete');if(!el)return;stopGameTimer();document.getElementById('completeScore').textContent=score+' puntos';const sec=gameState.elapsedTime,m=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');document.getElementById('completeTime').textContent='⏱️ '+m+':'+ss;el.classList.add('show');el.setAttribute('aria-hidden','false');}
function closeAdventureComplete(){const el=document.getElementById('adventureComplete');if(el){el.classList.remove('show');el.setAttribute('aria-hidden','true');}}
function resetAdventure(){closeAdventureComplete();resetGame();}

function base(title,desc,content,n){return '<div class="game"><div class="gameTop"><div><span class="tag">MISIÓN '+n+'</span><h2>'+title+'</h2><p class="lead">'+desc+'</p></div><div style="font-size:2.6rem">'+avatar+'</div></div>'+content+'</div>'}
function mission1(a){
  let step=0;
  const steps=[
    {title:'Observa la pista principal',body:`<div class="m1Intro"><div class="m1Photo"><img src="nogal_real.png" alt="Referencia visual del Club El Nogal en Bogotá"><small>📍 Club El Nogal · Bogotá</small></div><div><h3 style="margin-top:0">🔎 Primero, ubica la historia</h3><p>Antes de responder, observa la fotografía y relaciona <b>lugar, fecha y contexto</b>. En esta aventura no buscamos memorizar una cifra: buscamos comprender.</p><div class="m1Facts"><div class="m1Fact"><div class="ic">📍</div><b>Lugar</b><span>Club El Nogal, Bogotá.</span></div><div class="m1Fact"><div class="ic">📅</div><b>Fecha</b><span>7 de febrero de 2003.</span></div><div class="m1Fact"><div class="ic">🧩</div><b>Contexto</b><span>Conflicto armado colombiano.</span></div></div></div></div><div class="m1MissionStep"><b>🎯 Tu primera misión</b><p>¿Qué elemento nos ayuda a comprender un acontecimiento más allá de saber solo la fecha?</p><div class="m1ChoiceGrid"><button class="m1Choice" onclick="m1Answer(0)">🧭 El contexto histórico</button><button class="m1Choice" onclick="m1Answer(1)">📅 Solo la fecha</button><button class="m1Choice" onclick="m1Answer(2)">📱 Una publicación de redes</button><button class="m1Choice" onclick="m1Answer(3)">💬 Un rumor</button></div><div id="m1fb" class="m1Feedback"></div></div>`},
    {title:'Conecta las piezas',body:`<div class="m1MissionStep"><p><b>🧩 Ahora completa la relación:</b> ¿qué combinación representa mejor lo que necesitamos estudiar?</p><div class="m1ChoiceGrid"><button class="m1Choice" onclick="m1Answer(4)">📍 Lugar + 📅 fecha + 🧩 contexto</button><button class="m1Choice" onclick="m1Answer(5)">📅 Fecha + 💬 rumor</button><button class="m1Choice" onclick="m1Answer(6)">📱 Redes + opinión personal</button><button class="m1Choice" onclick="m1Answer(7)">🖼️ Solo una imagen</button></div><div id="m1fb" class="m1Feedback"></div></div>`},
    {title:'Tu primera pieza del mapa',body:`<div class="mini green"><h3>🧭 Contexto comprendido</h3><p>Ya identificaste que un acontecimiento histórico se comprende mejor cuando relacionamos <b>lugar, fecha y contexto</b>.</p><p>Ahora el camino puede continuar hacia <b>Mundo 2 · El hecho</b>.</p></div>`}
  ];
  function render(){
    if(step>=steps.length){finish(1,25);return;}
    const s=steps[step];
    if(step===2){a.innerHTML=base('¡Mundo 1 completado!','Has construido la primera pieza de la aventura.',s.body,1);setTimeout(()=>finish(1,25),500);return;}
    const bar='<div class="m1StepBar">'+[0,1,2].map(k=>'<i class="'+(k<=step?'on':'')+'"></i>').join('')+'</div>';
    a.innerHTML=base('Misión 1 · Contexto','Conoce primero el escenario histórico.',bar+s.body,1);
  }
  window.m1Answer=function(choice){
    const fb=document.getElementById('m1fb');
    const correct=choice===0 || choice===4;
    if(correct){fb.style.display='block';fb.textContent='✅ Correcto. Has encontrado una pieza clave. +10 puntos.';document.querySelectorAll('.m1Choice').forEach(b=>b.disabled=true);document.querySelectorAll('.m1Choice')[choice%4]?.classList.add('correct');setScore(10);step++;setTimeout(render,650);}
    else{fb.style.display='block';fb.style.background='#fff0f0';fb.style.color='#9a3d3d';fb.textContent='🔎 Pista: una fecha nos dice cuándo, pero el contexto ayuda a comprender qué estaba ocurriendo alrededor del acontecimiento.';document.querySelectorAll('.m1Choice')[choice%4]?.classList.add('wrong');}
  };
  render();
}
function mission2(a){
  // MUNDO 2 PROFUNDIZADO: expediente interactivo + pistas + reconstrucción temporal + síntesis.
  const clues=[
    {id:'place',icon:'📍',title:'Ubicación',short:'Una pista geográfica',secret:'Bogotá, Colombia.'},
    {id:'site',icon:'🏢',title:'Lugar',short:'La escena histórica',secret:'Club El Nogal.'},
    {id:'date',icon:'📅',title:'Fecha',short:'Una pista temporal',secret:'7 de febrero de 2003.'},
    {id:'event',icon:'💥',title:'Hecho',short:'La pieza central',secret:'Atentado con carro bomba.'}
  ];
  const timeline=[
    ['place','📍','Bogotá'],['date','📅','7 de febrero de 2003'],['site','🏢','Club El Nogal'],['event','🧩','Atentado con carro bomba']
  ];
  a.innerHTML=base('Misión 2 · El hecho','Investiga las pistas, reconstruye la secuencia y arma la historia.',`
    <div class="m2Mission">
      <div class="m2Hero">
        <div class="m2Scene"><img src="nogal_real.png" alt="Referencia visual del Club El Nogal"><div class="m2Stamp">📁 EXPEDIENTE HISTÓRICO</div></div>
        <div class="m2Brief">
          <h3>🕵️ Operación: reconstruir el hecho</h3>
          <p>Tu avatar recibió un expediente incompleto. Explora las pistas y decide dónde encaja cada una. <b>No se trata de memorizar: se trata de reconstruir.</b></p>
          <div class="m2Meters"><span class="m2Meter">🔎 Pistas <strong id="m2ClueCount">0/4</strong></span><span class="m2Meter">🧩 Secuencia <strong id="m2SeqCount">0/4</strong></span><span class="m2Meter">⭐ +0</span></div>
        </div>
      </div>
      <section class="m2Phase" id="m2Phase1">
        <div class="m2PhaseHead"><span class="m2PhaseNum">1</span><div><h3>🔎 Escanea la escena</h3><p>Toca las cuatro pistas para descubrir qué información contiene cada una.</p></div></div>
        <div class="m2Clues" id="m2Clues">${clues.map(c=>`<button class="m2Clue" id="m2clue${c.id}" onclick="revealM2Clue('${c.id}')"><span class="m2ClueIcon">${c.icon}</span><b>${c.title}</b><small>${c.short}</small><span class="m2Secret">${c.secret}</span></button>`).join('')}</div>
        <div id="m2ClueFb" class="feedback"></div>
      </section>
      <section class="m2Phase" id="m2Phase2" style="opacity:.45;pointer-events:none">
        <div class="m2PhaseHead"><span class="m2PhaseNum">2</span><div><h3>🧩 Reconstruye la secuencia</h3><p>Selecciona una pieza y luego el lugar donde debe quedar.</p></div></div>
        <div class="m2Timeline" id="m2Timeline">${timeline.map((x,i)=>`<button class="m2TimelineSlot" id="m2slot${x[0]}" onclick="placeM2('${x[0]}')"><span class="n">${i+1}</span><b>${['¿DÓNDE?','¿CUÁNDO?','¿EN QUÉ LUGAR?','¿QUÉ OCURRIÓ?'][i]}</b><small>Espacio de reconstrucción</small><strong class="m2SlotValue">+</strong></button>`).join('')}</div>
        <div class="m2TimelinePieceGrid" id="m2Pieces">${timeline.map(x=>`<button class="m2TimelinePiece" id="m2piece${x[0]}" onclick="selectM2('${x[0]}')"><span>${x[1]}</span><b>${x[2]}</b></button>`).join('')}</div>
        <div id="m2SeqFb" class="feedback"></div>
      </section>
      <section class="m2Phase" id="m2Phase3" style="opacity:.45;pointer-events:none">
        <div class="m2PhaseHead"><span class="m2PhaseNum">3</span><div><h3>🧠 Arma la síntesis</h3><p>Ahora observa las piezas juntas y reconoce qué hace que una reconstrucción sea histórica.</p></div></div>
        <div class="m2Story">
          <article class="m2StoryCard"><h4>📌 La historia necesita contexto</h4><p>Un lugar y una fecha ubican el acontecimiento; el hecho permite reconocer qué ocurrió.</p></article>
          <article class="m2StoryCard"><h4>🫶 Memoria con respeto</h4><p>Comprender el hecho no significa convertir el dolor en espectáculo. La aventura busca aprender con cuidado.</p></article>
        </div>
        <button class="btn primary" style="margin-top:12px" onclick="completeM2()">🧭 Completar reconstrucción</button>
        <div id="m2FinalFb" class="feedback"></div>
      </section>
    </div>`,2);

  let revealed=new Set(), selected=null, placed=0;
  window.revealM2Clue=function(id){
    const el=document.getElementById('m2clue'+id); if(!el||el.classList.contains('revealed')) return;
    el.classList.add('revealed'); revealed.add(id); setScore(2);
    document.getElementById('m2ClueCount').textContent=revealed.size+'/4';
    const fb=document.getElementById('m2ClueFb'); fb.style.display='block'; fb.textContent='🔎 Pista descubierta. Mira qué papel cumple dentro del expediente.';
    if(revealed.size===4){
      const phase=document.getElementById('m2Phase2'); phase.style.opacity='1'; phase.style.pointerEvents='auto';
      fb.textContent='✅ Expediente completo. Ahora reconstruye la secuencia.';
      phase.classList.add('m2Success'); phase.scrollIntoView({behavior:'smooth',block:'center'});
      speak('Has encontrado las cuatro pistas. Ahora reconstruye la secuencia del acontecimiento.');
    }
  };
  window.selectM2=function(id){
    const el=document.getElementById('m2piece'+id); if(!el||el.classList.contains('used')) return;
    selected=id; document.querySelectorAll('.m2TimelinePiece').forEach(x=>x.classList.remove('selected')); el.classList.add('selected');
    const fb=document.getElementById('m2SeqFb'); fb.style.display='block'; fb.textContent='🧩 Pieza seleccionada. Ahora toca el espacio donde encaja.';
  };
  window.placeM2=function(slotId){
    const fb=document.getElementById('m2SeqFb'); fb.style.display='block';
    if(!selected){fb.textContent='🧩 Selecciona primero una pieza del expediente.';return;}
    const slot=document.getElementById('m2slot'+slotId);
    if(slot.classList.contains('filled')){fb.textContent='🔎 Ese espacio ya está completo.';return;}
    if(selected!==slotId){fb.textContent='💡 Todavía no encaja aquí. Observa la pregunta de la casilla.';document.getElementById('m2piece'+selected)?.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:280});return;}
    const piece=document.getElementById('m2piece'+selected); slot.classList.add('filled'); slot.querySelector('.m2SlotValue').textContent=piece.querySelector('span').textContent+' '+piece.querySelector('b').textContent; piece.classList.add('used'); piece.disabled=true; selected=null; placed++; setScore(5);
    document.querySelectorAll('.m2TimelinePiece').forEach(x=>x.classList.remove('selected'));
    document.getElementById('m2SeqCount').textContent=placed+'/4'; fb.textContent='✅ Pieza encajada. La reconstrucción gana precisión.';
    if(placed===4){const phase=document.getElementById('m2Phase3');phase.style.opacity='1';phase.style.pointerEvents='auto';phase.classList.add('m2Success');phase.scrollIntoView({behavior:'smooth',block:'center'});speak('Secuencia reconstruida. Ahora observa la síntesis final.');}
  };
  window.completeM2=function(){
    const fb=document.getElementById('m2FinalFb'); fb.style.display='block'; fb.textContent='🏆 ¡Reconstrucción completada! El expediente está listo para continuar.';
    setTimeout(()=>{a.innerHTML=base('¡Mundo 2 completado!','Reconstruiste el hecho a partir de pistas y una secuencia histórica.','<div class="mini green"><h3>🧩 Expediente reconstruido</h3><p>Relacionaste <b>Bogotá, 7 de febrero de 2003, Club El Nogal y el atentado con carro bomba</b> para construir una comprensión básica del acontecimiento.</p><p>Ahora el camino puede continuar hacia <b>Mundo 3 · Consecuencias</b>.</p></div>',2);finish(2,30)},500);
  };
}

function mission3(a){
  const impacts=[
    ['people','👥','Personas','Reconocer que hubo personas afectadas por el hecho.'],
    ['families','🏠','Familias','Comprender que las consecuencias también alcanzan a los entornos familiares.'],
    ['community','🏙️','Comunidad','Observar que un acontecimiento puede dejar efectos sociales y colectivos.'],
    ['memory','💭','Memoria','Reconocer que las consecuencias también forman parte de lo que una sociedad recuerda.']
  ].sort(()=>Math.random()-.5);
  const zones=[['people','👥 Personas'],['families','🏠 Familias'],['community','🏙️ Comunidad'],['memory','💭 Memoria']];
  let phase=0,selected=null,done=0;
  function render(){
    if(phase===0){
      a.innerHTML=base('Misión 3 · Consecuencias','Paso 1 de 2 · Comprende el reto antes de conectar los impactos.',`<div class="missionBrief"><div class="missionSteps"><span class="missionStep active">1 · Comprender</span><span class="missionStep">2 · Conectar</span><span class="missionStep">3 · Cerrar</span></div><div class="missionBriefGrid"><div class="missionBriefIcon">🌐</div><div><span class="phaseTag">ANTES DE JUGAR</span><h3>El acontecimiento no termina en el momento del hecho</h3><p>Las consecuencias pueden alcanzar a personas, familias, comunidades y a la forma en que una sociedad construye memoria.</p><p><b>Tu misión:</b> relacionar cada pista con el ámbito de impacto que corresponde.</p><button class="btn primary" onclick="mission3Begin()">🧩 Comenzar a conectar</button></div></div></div>`,3);return;
    }
    if(phase===1){
      a.innerHTML=base('Misión 3 · Consecuencias','Paso 2 de 2 · Construye el mapa de impactos.',`<div class="impactMission"><div class="missionSteps"><span class="missionStep done">✓ 1 · Comprender</span><span class="missionStep active">2 · Conectar</span><span class="missionStep">3 · Cerrar</span></div><div class="impactIntro"><span class="bigIcon">🌐</span><div><h3>Conecta los impactos</h3><p>Selecciona una ficha y luego toca la zona que representa su relación. <b>No busques una respuesta rápida: lee la pista.</b></p></div></div><div class="impactBoard"><div class="impactCenter">🧩<b>EL HECHO</b><small>¿A quiénes y qué ámbitos puede afectar?</small></div>${zones.map((z,i)=>`<button class="impactZone zone${i}" id="zone${z[0]}" onclick="dropImpact('${z[0]}')"><span>${z[1].split(' ')[0]}</span><b>${z[1].substring(3)}</b><small>Zona de impacto</small></button>`).join('')}</div><div class="impactCards" id="impactCards">${impacts.map(x=>`<button class="impactCard" id="impact${x[0]}" onclick="selectImpact('${x[0]}')"><span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></button>`).join('')}</div><div id="impactFb" class="feedback"></div><div class="puzzleProgress"><span id="impactCount">0 / 4 conexiones</span><div class="miniProgress"><i id="impactFill"></i></div></div></div>`,3);phase=2;
    }
  }
  window.mission3Begin=function(){phase=1;render()};
  window.selectImpact=function(id){selected=id;document.querySelectorAll('.impactCard').forEach(x=>x.classList.remove('selected'));document.getElementById('impact'+id)?.classList.add('selected');const fb=document.getElementById('impactFb');fb.style.display='block';fb.textContent='🖐️ Ficha seleccionada. Ahora conéctala con una zona.'};
  window.dropImpact=function(id){const fb=document.getElementById('impactFb');fb.style.display='block';if(!selected){fb.textContent='🌐 Selecciona primero una ficha de impacto.';return}const zone=document.getElementById('zone'+id);if(zone.classList.contains('filled')){fb.textContent='🔎 Esa zona ya está conectada.';return}if(selected!==id){fb.textContent='💡 Esa ficha representa otro tipo de impacto. Lee nuevamente su descripción.';return}const card=document.getElementById('impact'+selected);zone.classList.add('filled');zone.querySelector('small').textContent='✓ Conectado';card.classList.add('used');card.disabled=true;selected=null;done++;setScore(7);document.querySelectorAll('.impactCard').forEach(x=>x.classList.remove('selected'));document.getElementById('impactCount').textContent=done+' / 4 conexiones';document.getElementById('impactFill').style.width=(done/4*100)+'%';fb.textContent='✅ Conexión correcta. Estás ampliando la mirada sobre las consecuencias.';if(done===4)setTimeout(()=>{a.innerHTML=base('¡Mundo 3 completado!','Paso 3 de 3 · Interpreta lo que construiste.',`<div class="missionDebrief"><div class="missionSteps"><span class="missionStep done">✓ Comprender</span><span class="missionStep done">✓ Conectar</span><span class="missionStep active">3 · Cerrar</span></div><div class="mini yellow"><h3>🌐 Mapa de impactos construido</h3><p>Comprender las consecuencias implica mirar más allá del acontecimiento y reconocer sus dimensiones humanas, familiares, comunitarias y de memoria.</p><p><b>Aprendizaje clave:</b> un hecho puede producir efectos en distintos ámbitos y esos efectos también hacen parte de la memoria histórica.</p></div></div>`,3);finish(3,25)},550)};
  render();
}
function mission4(a){
  const pairs=[['contexto','🧭','Contexto','Ayuda a comprender qué ocurría alrededor del hecho.'],['memoria','💬','Memoria','Conserva preguntas, relatos y aprendizajes.'],['cuidado','🫶','Cuidado','Invita a tratar el tema con respeto.'],['verificar','🔎','Verificar','Permite contrastar información antes de compartirla.'],['escuchar','👂','Escuchar','Da espacio a otras voces y experiencias.'],['paz','🕊️','Paz','Relaciona lo aprendido con formas responsables de convivir.']];
  let deck=[],open=[],done=0,phase=0;pairs.forEach(p=>{deck.push({id:p[0],type:'icon',content:p[1],title:p[2]},{id:p[0],type:'text',content:p[3],title:p[2]})});deck.sort(()=>Math.random()-.5);
  function render(){if(phase===0){a.innerHTML=base('Misión 4 · Memoria','Paso 1 de 2 · Entiende cómo funciona la memoria con sentido.',`<div class="missionBrief"><div class="missionSteps"><span class="missionStep active">1 · Comprender</span><span class="missionStep">2 · Relacionar</span><span class="missionStep">3 · Cerrar</span></div><div class="missionBriefGrid"><div class="missionBriefIcon">🧠</div><div><span class="phaseTag">ANTES DE JUGAR</span><h3>No son parejas idénticas</h3><p>En este reto tendrás que unir un <b>concepto</b> con su <b>significado</b>. La memoria histórica no consiste solo en recordar datos: también implica comprender, escuchar y cuidar.</p><button class="btn primary" onclick="mission4Begin()">🧠 Abrir tablero de memoria</button></div></div></div>`,4);return}a.innerHTML=base('Misión 4 · Memoria','Paso 2 de 2 · Encuentra las 6 parejas concepto–significado.',`<div class="memoryMission"><div class="missionSteps"><span class="missionStep done">✓ 1 · Comprender</span><span class="missionStep active">2 · Relacionar</span><span class="missionStep">3 · Cerrar</span></div><div class="memoryHeader"><span class="bigIcon">🧠</span><div><h3>Memoria visual con sentido</h3><p>Las parejas no son idénticas: debes <b>relacionar concepto y significado</b>.</p></div></div><p><b id="memInfo">0 / 6 parejas</b></p><div class="memoryBoard rich" id="memBoard">${deck.map((x,i)=>`<button class="memory richMemory" onclick="memClick(${i})"><span class="memoryMark">?</span><span class="memoryHidden">${x.type==='icon'?x.content:'📖'}</span><small>${x.type==='text'?'Explicación':'Concepto'}</small></button>`).join('')}</div><div id="memFb" class="feedback"></div></div>`,4);phase=1}
  window.mission4Begin=function(){phase=1;render()};
  window.memClick=function(i){const els=document.querySelectorAll('#memBoard .richMemory');if(els[i].classList.contains('open')||els[i].classList.contains('done')||open.length===2)return;els[i].classList.add('open');els[i].querySelector('.memoryMark').textContent='';els[i].querySelector('.memoryHidden').style.opacity='1';open.push(i);if(open.length===2){const A=deck[open[0]],B=deck[open[1]],fb=document.getElementById('memFb');fb.style.display='block';if(A.id===B.id&&A.type!==B.type){open.forEach(k=>els[k].classList.add('done'));done++;setScore(8);document.getElementById('memInfo').textContent=done+' / 6 parejas';fb.textContent='✅ Pareja encontrada: concepto y significado encajan.';open=[];if(done===6)setTimeout(()=>{a.innerHTML=base('¡Mundo 4 completado!','Paso 3 de 3 · Dale significado a lo que recordaste.',`<div class="missionDebrief"><div class="missionSteps"><span class="missionStep done">✓ Comprender</span><span class="missionStep done">✓ Relacionar</span><span class="missionStep active">3 · Cerrar</span></div><div class="mini purple"><h3>🧠 Memoria con sentido</h3><p>Recordar también implica comprender, escuchar y tratar las historias con respeto.</p><p><b>Aprendizaje clave:</b> la memoria puede conservar preguntas, relatos y aprendizajes para fortalecer una convivencia responsable.</p></div></div>`,4);finish(4,25)},550)}else{fb.textContent='🔄 No forman pareja. Observa nuevamente sus significados.';setTimeout(()=>{open.forEach(k=>{els[k].classList.remove('open');els[k].querySelector('.memoryMark').textContent='?';els[k].querySelector('.memoryHidden').style.opacity='0'});open=[]},800)}}};
  render();
}
function mission5(a){
  const cards=[['A','📰','Nota periodística con autor, fecha y medio identificables.','Contrastar la información con otras fuentes.','check'],['B','📱','Publicación anónima que afirma algo llamativo y no cita fuentes.','No compartirla todavía; verificar primero.','verify'],['C','📚','Fuente institucional o archivo histórico que permite consultar datos.','Usarla como referencia y contrastarla.','check'],['D','💬','Mensaje reenviado que dice “me contaron que…”.','Tratarlo como información no verificada.','verify']].sort(()=>Math.random()-.5);
  let selected=null,done=0,phase=0;
  function render(){if(phase===0){a.innerHTML=base('Misión 5 · Verdad','Paso 1 de 2 · Aprende el criterio del detective.',`<div class="missionBrief"><div class="missionSteps"><span class="missionStep active">1 · Comprender</span><span class="missionStep">2 · Investigar</span><span class="missionStep">3 · Cerrar</span></div><div class="missionBriefGrid"><div class="missionBriefIcon">🕵️</div><div><span class="phaseTag">ANTES DE JUGAR</span><h3>No se trata de creer o negar</h3><p>Una afirmación puede necesitar contraste. Busca señales como <b>autor, fecha, medio, institución, contexto y respaldo identificable</b>.</p><p>Tu misión será decidir qué tratamiento merece cada evidencia.</p><button class="btn primary" onclick="mission5Begin()">🔎 Abrir mesa de evidencias</button></div></div></div>`,5);return}a.innerHTML=base('Misión 5 · Verdad','Paso 2 de 2 · Clasifica cada evidencia según el siguiente paso.',`<div class="detectiveMission"><div class="missionSteps"><span class="missionStep done">✓ 1 · Comprender</span><span class="missionStep active">2 · Investigar</span><span class="missionStep">3 · Cerrar</span></div><div class="detectiveHeader"><span class="bigIcon">🕵️</span><div><h3>La mesa de evidencias</h3><p>Selecciona una tarjeta y envíala a <b>CONTRASTAR</b> o <b>VERIFICAR ANTES</b>.</p></div></div><div class="evidenceBoard"><div class="evidenceCards" id="evidenceCards">${cards.map(x=>`<button class="evidenceCard" id="e${x[0]}" onclick="selectEvidence('${x[0]}')"><span class="eLetter">${x[0]}</span><b>${x[1]} ${x[2]}</b><small>${x[3]}</small></button>`).join('')}</div><div class="evidenceBins"><button class="evidenceBin contrast" onclick="dropEvidence('check')"><span>🔎</span><b>CONTRASTAR</b><small>Hay elementos que permiten buscar respaldo.</small></button><button class="evidenceBin verify" onclick="dropEvidence('verify')"><span>⚠️</span><b>VERIFICAR ANTES</b><small>Falta respaldo suficiente para compartirla.</small></button></div></div><div id="detectiveFb" class="feedback"></div><div class="puzzleProgress"><span id="evidenceCount">0 / 4 evidencias</span><div class="miniProgress"><i id="evidenceFill"></i></div></div></div>`,5);phase=1}
  window.mission5Begin=function(){phase=1;render()};
  window.selectEvidence=function(id){selected=id;document.querySelectorAll('.evidenceCard').forEach(x=>x.classList.remove('selected'));document.getElementById('e'+id)?.classList.add('selected');const fb=document.getElementById('detectiveFb');fb.style.display='block';fb.textContent='🕵️ Evidencia seleccionada. Ahora decide qué hacer con ella.'};
  window.dropEvidence=function(bucket){const fb=document.getElementById('detectiveFb');fb.style.display='block';if(!selected){fb.textContent='🔎 Selecciona primero una evidencia.';return}const card=cards.find(x=>x[0]===selected),el=document.getElementById('e'+selected);if(card[4]!==bucket){fb.textContent='💡 Pista: revisa si hay autor, fecha, medio o respaldo identificable.';return}el.classList.add('used');el.disabled=true;done++;setScore(8);selected=null;document.querySelectorAll('.evidenceCard').forEach(x=>x.classList.remove('selected'));document.getElementById('evidenceCount').textContent=done+' / 4 evidencias';document.getElementById('evidenceFill').style.width=(done/4*100)+'%';fb.textContent='✅ Buena práctica de verificación.';if(done===4)setTimeout(()=>{a.innerHTML=base('¡Mundo 5 completado!','Paso 3 de 3 · Explica tu criterio de verificación.',`<div class="missionDebrief"><div class="missionSteps"><span class="missionStep done">✓ Comprender</span><span class="missionStep done">✓ Investigar</span><span class="missionStep active">3 · Cerrar</span></div><div class="mini purple"><h3>🕵️ Habilidad de detective desbloqueada</h3><p>Antes de compartir una afirmación histórica, conviene revisar su fuente, contexto y respaldo.</p><p><b>Aprendizaje clave:</b> verificar no significa desconfiar de todo; significa buscar elementos que permitan contrastar la información.</p></div></div>`,5);finish(5,30)},550)};
  render();
}
function mission6(a){
  // MECÁNICA: aventura ramificada. Cada decisión cambia el recorrido visual del avatar.
  const scenes=[
    {title:'🌿 Sendero 1 · Pausa',text:'Un compañero dice que necesita detenerse porque el tema le resulta difícil.',choices:[['🫶 Escuchar y ofrecer una pausa','care'],['😅 Burlarse para quitarle importancia','bad']]},
    {title:'🌉 Sendero 2 · Información',text:'Encuentras una publicación sobre el acontecimiento, pero no indica de dónde salió.',choices:[['🔎 Buscar una fuente antes de compartir','verify'],['📲 Compartirla de inmediato','bad']]},
    {title:'🏁 Sendero 3 · Comunidad',text:'El grupo debe decidir cómo hablar del tema en clase.',choices:[['💬 Escuchar, respetar y argumentar con fuentes','peace'],['🎭 Convertir el dolor en una broma','bad']]}
  ];
  let scene=0,routeScore=0,phase=0;
  function render(){
    if(phase===0){a.innerHTML=base('Misión 6 · Ruta de decisiones','Paso 1 de 2 · Prepárate para recorrer tres situaciones.',`<div class="missionBrief"><div class="missionSteps"><span class="missionStep active">1 · Preparar</span><span class="missionStep">2 · Decidir</span><span class="missionStep">3 · Cerrar</span></div><div class="missionBriefGrid"><div class="missionBriefIcon">🧭</div><div><span class="phaseTag">ANTES DE AVANZAR</span><h3>Cada decisión cambia tu recorrido</h3><p>Encontrarás tres situaciones relacionadas con <b>cuidado, verificación y convivencia</b>. Elige una opción y observa cómo avanza tu avatar.</p><p>Si una decisión no ayuda, podrás volver a intentarlo.</p><button class="btn primary" onclick="mission6Begin()">🧭 Iniciar ruta</button></div></div></div>`,6);return}
    const dots=scenes.map((_,i)=>`<span class="routeDot ${i<scene?'done':''} ${i===scene?'current':''}">${i+1}</span>`).join('<i class="routeLine"></i>');
    if(scene===scenes.length){a.innerHTML=base('¡Mundo 6 completado!','Llegaste al final de la ruta tomando decisiones de cuidado, verificación y respeto.',`<div class="routeAdventure"><div class="routeTrack final"><div class="routeAvatarFinal">${avatar==='BOY'?'<img src="avatar_nino.png" alt="Avatar">':avatar}</div><div class="routeGoal">🏁</div></div><div class="mini green"><h3>🕊️ Ruta completada</h3><p>Tu recorrido mostró que construir convivencia también implica <b>cuidar, verificar y escuchar</b>.</p></div></div>`,6);finish(6,30);return}
    const s=scenes[scene];
    a.innerHTML=base('Misión 6 · Ruta de decisiones','Elige el sendero y observa cómo avanza tu avatar.',`<div class="routeAdventure"><div class="routeDots">${dots}</div><div class="routeTrack"><div class="routePath"></div><div class="routeAvatarMoving ${scene?'moved':''}">${avatar==='BOY'?'<img src="avatar_nino.png" alt="Tu avatar">':avatar}</div><div class="routeFlags"><span>🚩 Inicio</span><span>🏁 Meta</span></div></div><div class="routeScene"><h3>${s.title}</h3><p>${s.text}</p><div class="routeChoices">${s.choices.map((c,i)=>`<button class="routeChoice" onclick="routeChoice('${c[1]}')">${c[0]}</button>`).join('')}</div><div id="routeFb" class="feedback"></div></div></div>`,6);
  }
  window.mission6Begin=function(){phase=1;render()};
  window.routeChoice=function(kind){const fb=document.getElementById('routeFb');fb.style.display='block';if(kind==='bad'){fb.textContent='🔎 Ese sendero necesita otra decisión. Busca una opción que cuide a las personas y la información.';return}routeScore++;setScore(10);fb.textContent='✅ ¡Sendero correcto! Tu avatar avanza al siguiente punto.';scene++;setTimeout(render,650)};
  render();
}

function saveLetter(){const t=document.getElementById('reflection').value.trim(),fb=document.getElementById('saved');fb.style.display='block';if(!t){fb.textContent='✍️ Escribe primero tu carta.';return}localStorage.setItem('nogalCarta',t);fb.textContent='✅ Carta guardada en este dispositivo. ¡Misión personal completada!';finish(7,30);document.getElementById('certificate').style.display='block'}


let gameStartedAt=null,mapTimerInterval=null;
function startGameTimer(){if(gameStartedAt)return;gameStartedAt=Date.now();gameState.gameStarted=true;clearInterval(mapTimerInterval);mapTimerInterval=setInterval(()=>{const el=document.getElementById('mapTimer');if(!el)return;const sec=Math.floor((Date.now()-gameStartedAt)/1000);gameState.elapsedTime=sec;const m=String(Math.floor(sec/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');el.textContent='⏱️ '+m+':'+s;},1000);}
function stopGameTimer(){clearInterval(mapTimerInterval);mapTimerInterval=null;if(gameStartedAt){gameState.elapsedTime=Math.floor((Date.now()-gameStartedAt)/1000);}}
function openStartPanel(){const p=document.getElementById('mapStartPanel');if(p){p.classList.remove('hidden');p.scrollIntoView({block:'center',behavior:'smooth'});}startGameTimer();}
function closeStartPanel(){const p=document.getElementById('mapStartPanel');if(p)p.classList.add('hidden');startGameTimer();}
function openMapInfo(type){const m=document.getElementById('mapInfoModal'),c=document.getElementById('mapInfoContent');if(!m||!c)return;let html='';if(type==='facts'){html='<span class="tag">ANTES DE JUGAR</span><h3>🗂️ Hechos históricos</h3><p class="lead">Conoce primero el contexto. Estas tarjetas aparecen sobre el mapa para que no pierdas la orientación.</p><div class="factOverlayGrid"><article class="factOverlayCard blue"><span>📍</span><b>Bogotá · 7 de febrero de 2003</b><p>El atentado con carro bomba ocurrió en el Club El Nogal, en Bogotá, en el contexto del conflicto armado colombiano.</p><button class="audio" onclick="speak(\"El 7 de febrero de 2003 ocurrió un atentado con carro bomba en el Club El Nogal, en Bogotá, en el contexto del conflicto armado colombiano.\")">🔊 Escuchar</button></article><article class="factOverlayCard green"><span>👥</span><b>Personas afectadas</b><p>El Centro Nacional de Memoria Histórica registra 36 personas muertas y 198 heridas.</p><button class="audio" onclick="speak(\"El Centro Nacional de Memoria Histórica registra 36 personas muertas y 198 heridas.\")">🔊 Escuchar</button></article><article class="factOverlayCard gold"><span>🧩</span><b>Contexto · hecho · consecuencias</b><p>La aventura conecta el acontecimiento con su contexto, sus consecuencias y la memoria.</p><button class="audio" onclick="speak(\"La aventura conecta el acontecimiento con su contexto, sus consecuencias y la memoria.\")">🔊 Escuchar</button></article><article class="factOverlayCard purple"><span>🫶</span><b>Memoria con respeto</b><p>Los hechos se presentan separados de los desafíos para favorecer una aproximación crítica y cuidadosa.</p><button class="audio" onclick="speak(\"Los hechos se presentan separados de los desafíos para favorecer una aproximación crítica y cuidadosa.\")">🔊 Escuchar</button></article></div><div class="overlayContinue"><button class="btn primary" onclick="closeMapInfo()">🎮 Volver al mapa</button></div>';}else if(type==='instructions'){html='<span class="tag">GUÍA RÁPIDA</span><h3>📖 Cómo jugar</h3><div class="infoRows"><div class="infoRow"><span>1️⃣</span><div><b>Sigue el orden.</b><br>Solo puedes entrar al mundo que esté disponible.</div></div><div class="infoRow"><span>2️⃣</span><div><b>Haz clic en el mundo.</b><br>Tu avatar recorrerá el camino hasta llegar a la misión.</div></div><div class="infoRow"><span>3️⃣</span><div><b>Completa el reto.</b><br>Al terminar se desbloquea el siguiente mundo.</div></div><div class="infoRow"><span>4️⃣</span><div><b>Reflexiona.</b><br>La aventura termina con tu Carta por la Paz.</div></div></div>';}else if(type==='truth'){html='<span class="tag">VERIFICA</span><h3>🕵️ Detectives de la verdad</h3><p>Durante la aventura encontrarás afirmaciones. Antes de aceptarlas, pregunta: <b>¿de dónde viene la información?, ¿puede verificarse?, ¿está presentada con respeto?</b></p><div class="infoRow"><span>🔎</span><div>La misión de verificación busca fortalecer el pensamiento crítico sin convertir el sufrimiento en espectáculo.</div></div>';}else if(type==='reflection'){html='<span class="tag">CIERRE DE LA AVENTURA</span><h3>💌 Reflexiona</h3><p>La Carta por la Paz se desbloquea únicamente al completar los mundos 1 al 6.</p><div class="infoRow"><span>🔒</span><div>Cuando llegues al Mundo 7 podrás escribir tu reflexión final y cerrar la aventura.</div></div><div class="overlayContinue"><button class="btn secondary" type="button" onclick="closeMapInfo()">Volver al mapa</button></div>';}else{return openMapConfig();}c.innerHTML=html;m.classList.add('open');m.setAttribute('aria-hidden','false');}
function closeMapInfo(){const m=document.getElementById('mapInfoModal');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');}
const MAP_THEMES={
  aventura:{name:'Aventura · Día',cls:'theme-aventura',desc:'La vista original: cielo claro, río y camino completo'},
  amanecer:{name:'Amanecer · Exploración',cls:'theme-amanecer',desc:'Luz cálida para comenzar una nueva ruta'},
  noche:{name:'Noche · Misterio',cls:'theme-noche',desc:'Cielo nocturno, estrellas y río iluminado'},
  explorador:{name:'Explorador · Topográfico',cls:'theme-explorador',desc:'Vista de exploración con cuadrícula y tonos de mapa'},
  bosque:{name:'Bosque · Naturaleza',cls:'theme-bosque',desc:'Paisaje verde, agua turquesa y ambiente natural'}
};
function playUISound(kind='click'){try{if(localStorage.getItem('nogalSound')==='0')return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=window.__nogalAudio||(window.__nogalAudio=new C());if(ctx.state==='suspended')ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=kind==='success'?660:kind==='open'?520:390;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.035,ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.11);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.12)}catch(e){}}
function applyMapTheme(key,save=true){
 const map=document.getElementById('worldMap'),t=MAP_THEMES[key]||MAP_THEMES.aventura;if(!map)return;
 Object.values(MAP_THEMES).forEach(x=>x.cls&&map.classList.remove(x.cls));
 map.classList.add(t.cls);
 map.dataset.theme=key;
 const zone=document.getElementById('mapSelectedZone');if(zone){zone.textContent=t.name;zone.classList.toggle('show',key!=='aventura');}
 if(save)localStorage.setItem('nogalMapTheme',key);
 document.querySelectorAll('.mapThemeCard').forEach(c=>c.classList.toggle('selected',c.dataset.theme===key));
 const st=document.getElementById('mapConfigStatus');if(st&&save){st.textContent='✅ Mapa cambiado: '+t.name;st.classList.add('show');clearTimeout(window.__mapStatusTimer);window.__mapStatusTimer=setTimeout(()=>st.classList.remove('show'),1700);playUISound('open')}
}

function getMapSetting(key,def=true){const v=localStorage.getItem(key);return v===null?def:v==='1'}function setMapSetting(key,val){localStorage.setItem(key,val?'1':'0')}function applyMapSettings(){const map=document.getElementById('worldMap');if(!map)return;map.classList.toggle('reduceMotion',!getMapSetting('nogalAnimations',true));map.classList.toggle('pauseCycle',!getMapSetting('nogalDayCycle',true));}
function openMapConfig(){
 const m=document.getElementById('mapInfoModal'),c=document.getElementById('mapInfoContent');if(!m||!c)return;
 const current=localStorage.getItem('nogalMapTheme')||'aventura';
 const cards=Object.entries(MAP_THEMES).map(([key,t])=>'<button type="button" class="mapThemeCard '+(key===current?'selected':'')+'" data-theme="'+key+'" onclick="applyMapTheme(\''+key+'\')"><span class="themeCheck">✓</span><span class="themePreview themePreview-'+key+'"></span><span class="themeShade"></span><b>'+t.name+'</b><small>'+t.desc+'</small></button>').join('');
 const sound=getMapSetting('nogalSound',true),anim=getMapSetting('nogalAnimations',true),day=getMapSetting('nogalDayCycle',true);
 c.innerHTML='<span class="tag">PERSONALIZA LA EXPERIENCIA</span><h3>⚙️ Configurar mapa</h3><p class="mapConfigIntro">Elige uno de los cinco mapas. Cada vista cambia el ambiente del escenario sin salir de la aventura.</p><div class="mapConfigGroupTitle">🗺️ Elige tu mapa de aventura</div><div class="mapThemes">'+cards+'</div><div class="mapConfigGroupTitle">🎛️ Preferencias</div><div class="mapConfig"><label class="configRow">🔊 Sonido de interfaz <span class="switch"><input id="soundToggle" type="checkbox" '+(sound?'checked':'')+' onchange="setMapSetting(\'nogalSound\',this.checked);playUISound(\'click\')"><span class="switchSlider"></span></span></label><label class="configRow">✨ Animaciones del escenario <span class="switch"><input id="animToggle" type="checkbox" '+(anim?'checked':'')+' onchange="setMapSetting(\'nogalAnimations\',this.checked);applyMapSettings();playUISound(\'click\')"><span class="switchSlider"></span></span></label><label class="configRow">🌙 Ciclo día / noche <span class="switch"><input id="dayToggle" type="checkbox" '+(day?'checked':'')+' onchange="setMapSetting(\'nogalDayCycle\',this.checked);applyMapSettings();playUISound(\'click\')"><span class="switchSlider"></span></span></label></div><div id="mapConfigStatus" class="mapConfigStatus"></div><div class="overlayContinue"><button class="btn secondary" type="button" onclick="closeMapInfo()">Cerrar</button></div>';
 m.classList.add('open');m.setAttribute('aria-hidden','false');applyMapSettings();playUISound('open');
}
function openMapCarta(isFinal=false){const m=document.getElementById('mapInfoModal'),c=document.getElementById('mapInfoContent');if(!m||!c)return;const old=document.getElementById('reflection')?.value||localStorage.getItem('nogalCarta')||'';c.innerHTML='<span class="tag">MUNDO FINAL</span><h3>💌 Mi Carta por la Paz</h3><p>'+ (isFinal?'Escribe tu reflexión final para completar la aventura.':'Esta tarjeta aparece sobre el mapa para que sigas dentro de la aventura.') +'</p><div class="mapCartaBox"><textarea id="mapCartaText" placeholder="Después de conocer esta historia, aprendí que…"></textarea><div class="mapCartaActions"><button class="btn secondary" type="button" onclick="speak(document.getElementById(\'mapCartaText\').value||\'Escribe tu reflexión sobre memoria, cuidado y paz.\')">🔊 Escuchar</button><button class="btn primary" type="button" onclick="saveMapCarta()">💾 Guardar carta</button></div><div class="mapSaved" id="mapSaved">✅ Carta guardada.</div></div>';const field=document.getElementById('mapCartaText');if(field)field.value=old;m.classList.add('open');m.setAttribute('aria-hidden','false');}
function saveMapCarta(){const t=document.getElementById('mapCartaText')?.value.trim();const fb=document.getElementById('mapSaved');if(!t){if(fb){fb.style.display='block';fb.textContent='✍️ Escribe primero tu carta.';}return;}localStorage.setItem('nogalCarta',t);const ref=document.getElementById('reflection');if(ref)ref.value=t;if(fb){fb.style.display='block';fb.textContent='✅ Carta guardada en este dispositivo.';}if(missionsDone.size===6 && gameState.activeMission===7){finish(7,30);}else{setScore(10);}}
function resetGame(){stopGameTimer();try{['nogalScore','nogalDone','nogalAvatar','nogalAvatarPos','nogalCarta','nogalSceneFound','nogalXP','nogalAchievements','nogalCluesFound','nogalAbilityUsed','nogalVerification'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();}catch(e){}window.location.reload();}
initAvatars();document.getElementById('mapProfile')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAvatarPicker();}});document.getElementById('openAvatarPicker')?.addEventListener('click',openAvatarPicker);document.getElementById('closeAvatarPicker')?.addEventListener('click',closeAvatarPicker);document.querySelector('[data-close-avatar]')?.addEventListener('click',closeAvatarPicker);document.getElementById('applyAvatar')?.addEventListener('click',closeAvatarPicker);const savedAvatar=localStorage.getItem('nogalAvatar');if(savedAvatar){try{const av=JSON.parse(savedAvatar);avatar=av[0];document.getElementById('chosen').textContent=av[1];document.querySelectorAll('.avatarChoice').forEach((z,i)=>{if(avatars[i][0]===avatar)z.classList.add('selected');else z.classList.remove('selected')});}catch(e){avatar='BOY';}}else{avatar='BOY';document.getElementById('chosen').textContent='Niño explorador';}updateTravelAvatar();syncInvestigatorUI();syncMapClues();const old=localStorage.getItem('nogalCarta');if(old)document.getElementById('reflection').value=old;document.getElementById('score').textContent=score;document.getElementById('finalScore').textContent=score+' puntos';document.getElementById('badge').textContent=score>=100?'Guardián de la memoria':score>=50?'Explorador':'Novato';syncGameState();syncMap();placeTravelAvatar(mapAvatarPos.x,mapAvatarPos.y);const wm=document.getElementById('worldMap');applyMapTheme(localStorage.getItem('nogalMapTheme')||'aventura',false);applyMapSettings();go('mapa');
