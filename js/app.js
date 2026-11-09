/* NEURO//PATH — логика: анализ, навыки, план, карта, график */
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2400)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* NAV */
$('#burger').onclick=()=>$('#menu').classList.toggle('open');
$$('#menu a').forEach(a=>a.onclick=()=>$('#menu').classList.remove('open'));
const secs=$$('section');
addEventListener('scroll',()=>{let cur='';secs.forEach(s=>{if(scrollY>=s.offsetTop-140)cur=s.id});$$('#menu a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur))},{passive:true});

/* COUNTERS */
$$('[data-count]').forEach(el=>{const n=+el.dataset.count;let i=0;const t=setInterval(()=>{i++;el.textContent=i;if(i>=n)clearInterval(t)},90)});

/* RISK */
let last=store.get('last',null), hist=store.get('hist',[]);
function calc(p,i,e,a){let s=IND[i][1]+AIU[a][1]+EXP[e][1];s=Math.max(10,Math.min(95,s));return{score:s,level:s>=70?'high':s>=40?'medium':'low'}}
function gauge(score,level){const r=64,c=2*Math.PI*r,o=c*(1-score/100);return `<svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14"/><circle cx="80" cy="80" r="${r}" fill="none" stroke="${COL[level]}" stroke-width="14" stroke-linecap="butt" stroke-dasharray="${c}" stroke-dashoffset="${o}" transform="rotate(-90 80 80)" style="filter:drop-shadow(0 0 8px ${COL[level]})"/><text x="80" y="88" text-anchor="middle" class="num" fill="${COL[level]}" font-family="Orbitron" font-weight="900" font-size="30">${score}%</text></svg>`}
function showResult(r){
  const col=COL[r.level];
  $('#result').innerHTML=`<div class="gauge">${gauge(r.score,r.level)}<div><div class="lvl ${r.level}">${LV[r.level]}</div><div style="color:var(--dim)">${esc(r.profession)} · ${IND[r.industry][0]}</div>
  <div class="breakdown">база <b>${IND[r.industry][1]}</b> · ИИ <b>${AIU[r.ai][1]}</b> · опыт <b>${EXP[r.exp][1]>0?'+':''}${EXP[r.exp][1]}</b></div></div></div><ul>${REC[r.level].map(x=>`<li>${x}</li>`).join('')}</ul>`;
  $('#resActions').style.display='flex';
}
function renderHist(){
  const h=$('#hist');
  if(!hist.length){h.innerHTML='<div class="empty">// пока пусто: ваши анализы будут сохраняться здесь</div>';}
  else h.innerHTML=hist.map((x,i)=>`<div class="hi"><div><b style="color:${COL[x.level]}">${x.score}%</b> &nbsp;${esc(x.profession)}</div><span>${x.date}</span><button class="btn line" style="padding:8px 14px" data-open="${i}">Открыть</button></div>`).join('');
  $$('[data-open]').forEach(b=>b.onclick=()=>{last=hist[+b.dataset.open];showResult(last);$('#prof').value=last.profession;$('#ind').value=last.industry;$('#exp').value=last.exp;$('#ai').value=last.ai;location.hash='#risk'});
  $('#statAn').textContent=hist.length;
}
$('#btnAnalyze').onclick=()=>{
  const p=$('#prof').value.trim(),i=$('#ind').value,e=$('#exp').value,a=$('#ai').value;
  if(!p||!i||!e||!a){toast('Заполните все четыре поля');return}
  const c=calc(p,i,e,a);
  last={profession:p,industry:i,exp:e,ai:a,score:c.score,level:c.level,date:new Date().toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})};
  hist.unshift(last);hist=hist.slice(0,8);store.set('hist',hist);store.set('last',last);
  showResult(last);renderHist();toast('Анализ готов');
};
$('#btnDemo').onclick=()=>{$('#prof').value='Веб-разработчик';$('#ind').value='tech';$('#exp').value='middle';$('#ai').value='basic';toast('Пример подставлен, нажмите «Запустить анализ»')};
$('#btnReset').onclick=()=>{['#prof','#ind','#exp','#ai'].forEach(s=>$(s).value='');$('#result').innerHTML='<div class="idle"><div class="big">00%</div><p>Здесь появится ваш результат: индекс риска, разбор по факторам и рекомендации.</p></div>';$('#resActions').style.display='none';last=null};
function report(r){return `NEURO//PATH — отчёт\nПрофессия: ${r.profession}\nОтрасль: ${IND[r.industry][0]}\nОпыт: ${EXP[r.exp][0]}\nИспользование ИИ: ${AIU[r.ai][0]}\nИндекс риска: ${r.score}% (${LV[r.level]})\nФормула: ${IND[r.industry][1]} ${AIU[r.ai][1]>=0?'+':''}${AIU[r.ai][1]} ${EXP[r.exp][1]>=0?'+':''}${EXP[r.exp][1]}\n\nРекомендации:\n${REC[r.level].map((x,i)=>(i+1)+'. '+x).join('\n')}\n`}
$('#btnCopy').onclick=async()=>{if(!last)return;try{await navigator.clipboard.writeText(report(last));toast('Скопировано')}catch(e){toast('Не удалось скопировать')}};
$('#btnDl').onclick=()=>{if(!last)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([report(last)],{type:'text/plain;charset=utf-8'}));a.download='neuropath-report.txt';a.click();toast('Отчёт скачан')};
$('#btnClearHist').onclick=()=>{hist=[];store.set('hist',hist);renderHist();toast('История очищена')};

/* SKILLS */
let cur=store.get('skills',SK.map(()=>40));
function renderSkills(){
  $('#skillList').innerHTML=SK.map((s,i)=>`<div class="sk"><div class="top"><span>${s[0]}</span><em>${cur[i]}% / ${s[1]}%</em></div><input type="range" min="0" max="100" value="${cur[i]}" data-i="${i}"><div class="bar"><i style="width:${cur[i]}%"></i><u style="left:${s[1]}%"></u></div></div>`).join('');
  $$('#skillList input').forEach(r=>r.oninput=()=>{const i=+r.dataset.i;cur[i]=+r.value;const w=r.closest('.sk');w.querySelector('em').textContent=cur[i]+'% / '+SK[i][1]+'%';w.querySelector('.bar i').style.width=cur[i]+'%';store.set('skills',cur)});
}
function gaps(){return SK.map((s,i)=>({n:s[0],g:Math.max(0,s[1]-cur[i])})).sort((a,b)=>b.g-a.g)}
$('#btnGap').onclick=()=>{const g=gaps().filter(x=>x.g>0);$('#prio').innerHTML=g.length?'<span style="width:100%;font-family:var(--mono);color:var(--dim)">Приоритеты (где разрыв больше):</span>'+g.slice(0,4).map((x,i)=>`<span class="chip">${i+1}. ${x.n} · −${x.g}</span>`).join(''):'<span class="chip" style="color:var(--green);border-color:var(--green)">Все навыки на целевом уровне</span>';toast('Разрыв рассчитан')};
$('#btnRandSk').onclick=()=>{cur=SK.map(()=>10+Math.floor(Math.random()*85));store.set('skills',cur);renderSkills();$('#btnGap').click()};
$('#btnZeroSk').onclick=()=>{cur=SK.map(()=>0);store.set('skills',cur);renderSkills();$('#prio').innerHTML=''};

/* ROADMAP */
let done=store.get('done',{});
const STEP={
 'Работа с ИИ-инструментами':'Каждый день решать одну рабочую задачу с помощью ИИ',
 'Анализ данных':'Пройти практикум по анализу данных (таблицы, графики)',
 'Критическое мышление':'Тренировать проверку ответов ИИ: искать ошибки и источники',
 'Prompt engineering':'Освоить структуру промпта и собрать личную библиотеку запросов',
 'Адаптивность':'Раз в месяц пробовать новый инструмент или формат работы',
 'Междисциплинарность':'Изучить основы смежной области и сделать мини-проект',
 'Цифровая грамотность':'Закрыть пробелы по безопасности и работе с облачными сервисами',
 'Эмоциональный интеллект':'Практиковать обратную связь и переговоры в командных задачах'};
function buildPlan(){
  if(!last){toast('Сначала выполните анализ риска');location.hash='#risk';return}
  const top=gaps().filter(x=>x.g>0).slice(0,3).map(x=>STEP[x.n]);
  const urgent=last.level==='high'?['СРОЧНО: оценить 2–3 смежные роли с меньшим риском']:[];
  const ph=[
   ['0–3 мес','Базовая адаптация',[...urgent,'Провести аудит своих задач: что ИИ может взять на себя','Начать ежедневное использование ИИ-ассистента','Выучить основы prompt engineering',...top.slice(0,1)]],
   ['3–6 мес','Углубление',['Освоить специализированные ИИ-инструменты профессии "'+last.profession+'"','Сделать рабочий проект с применением ИИ',...top.slice(1,2),'Начать собирать портфолио']],
   ['6–12 мес','Экспертиза',['Стать «человеком по ИИ» в своей команде','Провести внутреннее обучение для коллег',...top.slice(2,3),'Опубликовать 1–2 кейса']],
   ['12+ мес','Лидерство',['Возглавить инициативу по внедрению ИИ','Участвовать в выработке правил использования ИИ','Выбрать направление на стыке ИИ и своей области']]
  ].map(p=>({n:p[0],t:p[1],it:p[2].filter(Boolean)}));
  store.set('plan',ph);done={};store.set('done',done);renderPlan(ph);toast('План построен');location.hash='#roadmap';
}
function renderPlan(ph){
  if(!ph){$('#roadBox').innerHTML='<div class="empty">// сначала выполните анализ риска, затем нажмите «Построить план»</div>';return}
  $('#roadBox').innerHTML=`<div class="road">${ph.map((p,pi)=>`<div class="ph"><span class="pt">${p.n}</span><h3>${p.t}</h3>${p.it.map((x,ii)=>{const k=pi+'-'+ii;return `<label class="${done[k]?'done':''}"><input type="checkbox" data-k="${k}" ${done[k]?'checked':''}><span>${esc(x)}</span></label>`}).join('')}</div>`).join('')}</div>
  <div class="progress"><i id="pbar"></i></div><div class="note" id="ptxt"></div>
  <div class="row"><button class="btn line" id="btnPlanDl">Скачать план (.txt)</button><button class="btn line" id="btnPlanReset">Сбросить прогресс</button></div>`;
  $$('#roadBox input[type=checkbox]').forEach(c=>c.onchange=()=>{done[c.dataset.k]=c.checked;store.set('done',done);c.closest('label').classList.toggle('done',c.checked);prog(ph)});
  $('#btnPlanDl').onclick=()=>{const t='NEURO//PATH — личный план\n\n'+ph.map(p=>p.n+' · '+p.t+'\n'+p.it.map(x=>'  [ ] '+x).join('\n')).join('\n\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'}));a.download='neuropath-plan.txt';a.click()};
  $('#btnPlanReset').onclick=()=>{done={};store.set('done',done);renderPlan(ph)};
  prog(ph);
}
function prog(ph){const tot=ph.reduce((a,p)=>a+p.it.length,0),d=Object.values(done).filter(Boolean).length;$('#pbar').style.width=(d/tot*100)+'%';$('#ptxt').textContent=`Выполнено ${d} из ${tot} шагов`}
$('#btnPlan').onclick=buildPlan;

/* PROFESSIONS */
let flt='all';
function renderCards(){
  const q=$('#search').value.trim().toLowerCase();
  const list=PR.filter(p=>(flt==='all'||p.s===flt)&&(!q||(p.t+' '+p.d+' '+p.tags.join(' ')+' '+p.sk.join(' ')).toLowerCase().includes(q)));
  $('#cards').innerHTML=list.length?list.map(p=>`<div class="card" data-id="${PR.indexOf(p)}"><div class="ic">${p.i}</div><h3>${p.t}</h3><span class="badge ${BADGE[p.s]}">${p.st}</span><p>${p.d}</p><div class="mini"><i style="width:${p.a}%"></i></div><small>автоматизация задач: ${p.a}% · рост спроса: +${p.g}</small></div>`).join(''):'<div class="empty" style="grid-column:1/-1">// ничего не найдено, попробуйте другой запрос</div>';
  $$('.card').forEach(c=>c.onclick=()=>openModal(+c.dataset.id));
}
$$('.fb').forEach(b=>b.onclick=()=>{$$('.fb').forEach(x=>x.classList.remove('on'));b.classList.add('on');flt=b.dataset.f;renderCards()});
$('#search').oninput=renderCards;
function openModal(i){const p=PR[i];$('#mbox').innerHTML=`<button class="x" id="mx">✕</button><div style="font-size:2.6rem">${p.i}</div><h3>${p.t}</h3><span class="badge ${BADGE[p.s]}">${p.st}</span><p style="margin-top:14px;color:var(--dim)">${p.d}</p><div class="kv"><div><small>Автоматизация задач</small><b>${p.a}%</b></div><div><small>Рост спроса (баллы)</small><b>+${p.g}</b></div></div><small style="font-family:var(--mono);color:var(--dim)">ЧТО УЧИТЬ</small><div class="prio" style="margin-top:8px">${p.sk.map(s=>`<span class="chip" style="border-color:var(--cyan);color:var(--cyan);background:rgba(0,245,255,.08)">${s}</span>`).join('')}</div>`;$('#modal').classList.add('open');$('#mx').onclick=closeModal}
function closeModal(){$('#modal').classList.remove('open')}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* TIMELINE */
$('#tl').innerHTML=TL.map(t=>`<div class="ti ${+t[0]>2026?'fc':''}"><b>${t[0]}</b><p>${t[1]}</p></div>`).join('');

/* CHART */
const YRS=['2020','2021','2022','2023','2024','2025','2026'];
const SER=[{n:'Традиционные профессии',c:'#ff2a8a',d:[100,95,88,78,68,58,52],on:true},{n:'Профессии, усиленные ИИ',c:'#00f5ff',d:[10,18,32,48,62,74,82],on:true},{n:'Новые ИИ-профессии',c:'#00ff9c',d:[1,3,8,18,28,42,58],on:true}];
const cv=$('#cv'),cx=cv.getContext('2d');let hov=-1;
function draw(){
  const dpr=devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,w,h);
  const L=46,R=16,T=16,B=34,pw=w-L-R,ph=h-T-B,X=i=>L+pw*i/(YRS.length-1),Y=v=>T+ph*(1-v/100);
  cx.font='13px "Share Tech Mono",monospace';cx.textAlign='right';cx.textBaseline='middle';
  for(let v=0;v<=100;v+=20){cx.strokeStyle='rgba(0,245,255,.12)';cx.beginPath();cx.moveTo(L,Y(v));cx.lineTo(w-R,Y(v));cx.stroke();cx.fillStyle='#9a9ab5';cx.fillText(v+'%',L-8,Y(v))}
  cx.textAlign='center';cx.textBaseline='top';YRS.forEach((y,i)=>{cx.fillStyle=i===hov?'#00f5ff':'#9a9ab5';cx.fillText(y,X(i),h-B+10)});
  SER.filter(s=>s.on).forEach(s=>{
    const g=cx.createLinearGradient(0,T,0,T+ph);g.addColorStop(0,s.c+'33');g.addColorStop(1,s.c+'00');
    cx.beginPath();s.d.forEach((v,i)=>i?cx.lineTo(X(i),Y(v)):cx.moveTo(X(i),Y(v)));cx.lineTo(X(6),Y(0));cx.lineTo(X(0),Y(0));cx.fillStyle=g;cx.fill();
    cx.beginPath();s.d.forEach((v,i)=>i?cx.lineTo(X(i),Y(v)):cx.moveTo(X(i),Y(v)));cx.strokeStyle=s.c;cx.lineWidth=3;cx.shadowColor=s.c;cx.shadowBlur=12;cx.stroke();cx.shadowBlur=0;
    s.d.forEach((v,i)=>{cx.beginPath();cx.arc(X(i),Y(v),i===hov?6:4,0,7);cx.fillStyle=s.c;cx.fill()});
  });
  if(hov>=0){cx.strokeStyle='rgba(255,255,255,.25)';cx.setLineDash([4,4]);cx.beginPath();cx.moveTo(X(hov),T);cx.lineTo(X(hov),T+ph);cx.stroke();cx.setLineDash([]);
    const act=SER.filter(s=>s.on);if(act.length){const bw=232,bh=26+act.length*22;let bx=X(hov)+14;if(bx+bw>w-4)bx=X(hov)-bw-14;const by=T+6;
      cx.fillStyle='rgba(4,4,10,.95)';cx.strokeStyle='#00f5ff';cx.lineWidth=1;cx.fillRect(bx,by,bw,bh);cx.strokeRect(bx,by,bw,bh);
      cx.textAlign='left';cx.textBaseline='middle';cx.fillStyle='#00f5ff';cx.fillText(YRS[hov],bx+10,by+14);
      act.forEach((s,k)=>{cx.fillStyle=s.c;cx.fillText(s.d[hov]+'%  '+s.n.slice(0,22),bx+10,by+36+k*22)})}}
}
$('#legend').innerHTML=SER.map((s,i)=>`<button data-s="${i}" style="color:${s.c};border-color:${s.c}">● ${s.n}</button>`).join('');
$$('#legend button').forEach(b=>b.onclick=()=>{const s=SER[+b.dataset.s];s.on=!s.on;b.classList.toggle('off',!s.on);draw()});
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect(),L=46,pw=r.width-L-16;const i=Math.round((e.clientX-r.left-L)/pw*(YRS.length-1));hov=Math.max(0,Math.min(YRS.length-1,i));draw()});
cv.addEventListener('mouseleave',()=>{hov=-1;draw()});
addEventListener('resize',draw);

/* INIT */
renderSkills();renderCards();renderHist();draw();
if(last)showResult(last);
const sp=store.get('plan',null);if(sp)renderPlan(sp);
