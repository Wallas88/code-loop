import { CHAPTERS, LESSONS, GLOSSARY } from './lessons.js'
import { STORAGE_KEY, SESSION_LENGTH, freshProgress, parseProgress, startSession, completeRound, summary, recommendedChapter, checkAnswer, shuffledChoices } from './learning.js'

const $ = selector => document.querySelector(selector)
const esc = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
const paths = {folder:'M3 7h7l2 2h9v11H3z M3 7V4h7l2 3',code:'m8 5-6 7 6 7m8-14 6 7-6 7m-2-16-4 18',layout:'M3 3h18v18H3z M3 9h18M10 9v12',bolt:'m14 2-10 12h7l-1 8 10-13h-7z',tool:'m14 5 5 5m-7 0 7-7 2 2-7 7M4 20l-1-4 8-8 4 4-8 8z',arrow:'M4 12h15m-6-6 6 6-6 6',check:'m5 12 4 4L19 6',loop:'M20 7v5h-5M4 17v-5h5 M5 7a8 8 0 0 1 14-1l1 6M4 12l1 6a8 8 0 0 0 14-1',book:'M12 5c-4-3-8-2-10-1v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-1-6-2-10 1Zm0 0v15',chart:'M4 20V10m8 10V4m8 16v-7',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',back:'M20 12H4m6-6-6 6 6 6'}
const icon = (name,size=20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]?`<path d="${paths[name]}"/>`:''}</svg>`
let notice = '', temporary = false, progress = freshProgress()
try { const raw=localStorage.getItem(STORAGE_KEY); if(raw) progress=parseProgress(JSON.parse(raw)) } catch { notice='Saved progress could not be read. You can restore a downloaded backup in Your progress.' }
let view = progress.active ? 'lesson' : 'home', answer = null, feedback = null, hintOpen = false, guideQuery = ''
let labMission = 'height', labWidth = 320, labObserver
const initialCss = `.demo-card {
  padding: 16px;
  border-radius: 12px;
  background: #242a23;
  border: 1px solid #495440;
}

.demo-actions {
  display: flex;
  gap: 10px;
}

.demo-button {
  min-height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: #c9f184;
  color: #17200d;
  font-weight: 700;
}

/* Try an @media rule here. */`
let labCss = initialCss
try { labCss=localStorage.getItem(STORAGE_KEY+'-css') || initialCss } catch { /* The playground also works without storage. */ }

function save() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); temporary=false } catch { temporary=true }
  const badge=$('#save-status'); if(badge) badge.textContent=temporary?'Temporary progress · download a backup':'Progress saved in this browser'
}
save()
function go(next) {view=next;answer=null;feedback=null;hintOpen=false;render();window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true})}
function begin(chapter,mode='learn') {progress=startSession(progress,chapter,mode);save();go('lesson')}
const chapterById=id=>CHAPTERS.find(chapter=>chapter.id===id)
const lessonById=id=>LESSONS.find(lesson=>lesson.id===id)
const statusText=stat=>!stat?.seen?'Not tried':stat.box>=3?'Growing confidence':stat.box===0?'Practise again':'Building familiarity'

function shell(content) {
  const data=summary(progress)
  const nav=[['home','loop','Practise'],['lab','code','Playground'],['guide','book','Field guide'],['progress','chart','Your progress']]
  return `<aside class="sidebar"><a class="brand" href="#" data-action="nav" data-view="home"><span class="brand-symbol">${icon('loop',26)}</span><span>Code Loop<small>YOUR SITE. YOUR SKILLS.</small></span></a><div class="sidebar-label">YOUR WORKSPACE</div><nav aria-label="Main navigation">${nav.map(([id,symbol,label])=>`<button class="nav-item ${(view===id || id==='home'&&view==='lesson')?'active':''}" data-action="nav" data-view="${id}" ${view===id || id==='home'&&view==='lesson'?'aria-current="page"':''}>${icon(symbol)}<span>${label}</span>${id==='home'?'<span class="nav-dot"></span>':''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="little-code">{ <span>one step at a time</span> }</div><p>You don’t need to know it all.<br>Just the next small piece.</p><div class="offline"><span></span> Runs on your computer</div></div></aside><div class="workspace"><header class="topbar"><span>BUILT AROUND <strong>SITEREVIVESA</strong></span><div class="xp-badge">${icon('star',15)} ${progress.xp} XP <span class="topbar-divider"></span> ${data.explored}/30 explored</div></header>${notice?`<div class="notice" role="status">${esc(notice)}<button data-action="dismiss" aria-label="Dismiss notice">×</button></div>`:''}${temporary?'<div class="notice">Browser storage is unavailable. Practice still works; download a backup before closing.</div>':''}<main id="main" tabindex="-1">${content}</main><footer class="app-footer"><span id="save-status">${temporary?'Temporary progress · download a backup':'Progress saved in this browser'}</span><span>Small examples. Real understanding.</span></footer></div>`
}

function home() {
  const data=summary(progress), suggested=recommendedChapter(progress), chapter=chapterById(suggested), active=progress.active
  return `<section class="welcome"><div><p class="eyebrow"><span class="live-dot"></span> YOUR PERSONAL CODE PRACTICE</p><h1>Small steps.<br><em>Real understanding.</em></h1><p class="intro">Learn to read, change and understand your own website.<br class="desktop-break"> One little challenge at a time.</p></div><div class="welcome-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="code-slip slip-back">${icon('folder',18)} src / content / hosting.js</div><div class="code-slip slip-front"><div class="slip-title"><i></i><i></i><i></i><span>a little code, a little clearer</span></div><code><span class="muted">price:</span> {<br>&nbsp; monthly: <b>289</b>,<br>&nbsp; annual: <b>2890</b><br>}</code><span class="code-tag">You’ll understand this. ${icon('check',13)}</span></div><div class="floating-star">✳</div></div></section><section class="start-panel" aria-labelledby="loop-title"><div class="start-icon">${icon('loop',28)}</div><div class="start-copy"><p class="eyebrow">${active&&!active.done?'PICK UP WHERE YOU LEFT OFF':'YOUR NEXT SMALL STEP'}</p><h2 id="loop-title">${active&&!active.done?'Your loop is waiting.':esc(chapter.name)}</h2><p>${active&&!active.done?`${active.results.length} of ${SESSION_LENGTH} rounds complete. Your place is saved.`:'6 short rounds. Hints when you need them. Room to try again.'}</p></div><button class="button primary" data-action="${active&&!active.done?'resume':'start'}" data-chapter="${suggested}">${active&&!active.done?'Continue my loop':progress.round?'Start a practice loop':'Start my first loop'} ${icon('arrow',18)}</button></section><div class="stats-row"><div><span class="stat-icon">${icon('book')}</span><strong>${data.explored}<small> / 30</small></strong><span>Challenges explored</span></div><div><span class="stat-icon peach">${icon('loop')}</span><strong>${data.due}</strong><span>Ready to revisit</span><button class="text-button" data-action="review" ${data.explored?'':'disabled'}>Practise again ${icon('arrow',13)}</button></div><div><span class="stat-icon blue">${icon('star')}</span><strong>${data.confident}</strong><span>Growing confidence</span></div></div><section class="learning-path"><div class="section-head"><div><p class="eyebrow">FROM “WHAT IS THIS?” TO “I CAN CHANGE THIS.”</p><h2>Your learning path</h2></div><span>5 trails · 30 challenges</span></div><div class="chapter-list">${CHAPTERS.map(item=>chapterCard(item,suggested)).join('')}</div></section><div class="bottom-note">${icon('loop',18)}<p>Repetition is part of learning. Tricky questions return sooner; familiar ones get more space.</p><button class="text-button" data-action="nav" data-view="guide">Keep a field guide handy ${icon('arrow',14)}</button></div>`
}

function chapterCard(chapter,suggested) {
  const items=LESSONS.filter(lesson=>lesson.chapter===chapter.id), explored=items.filter(lesson=>progress.stats[lesson.id]?.seen).length
  return `<button class="chapter-card ${chapter.id===suggested?'suggested':''}" data-action="start" data-chapter="${chapter.id}"><span class="chapter-number">${chapter.number}</span><span class="chapter-icon ${chapter.color}">${icon(chapter.icon,23)}</span><span class="chapter-copy"><span class="chapter-tag">${chapter.tag}${chapter.id===suggested?' <b>UP NEXT</b>':''}</span><strong>${chapter.name}</strong><span>${chapter.description}</span></span><span class="chapter-meter"><span>${explored} of 6 explored</span><span class="mini-track"><i style="width:${explored/6*100}%"></i></span></span><span class="chapter-arrow">${icon('arrow',19)}</span></button>`
}

function highlightedCode(code) {
  return esc(code).split('\n').map((line,i)=>`<span class="code-line"><span class="line-number" aria-hidden="true">${i+1}</span><span>${line || ' '}</span></span>`).join('')
}

function lesson() {
  const session=progress.active
  if(!session) return home()
  if(session.done) return completed()
  const item=lessonById(session.lessonId), chapter=chapterById(item.chapter), review=!!progress.stats[item.id]?.seen
  return `<div class="lesson-top"><button class="text-button" data-action="nav" data-view="home">${icon('back',17)} Save & leave</button><span>${session.mode==='review'?'MIXED PRACTICE':chapter.name.toUpperCase()}</span><span>ROUND ${session.results.length+1} / ${SESSION_LENGTH}</span></div><div class="round-track" aria-label="${session.results.length} of ${SESSION_LENGTH} rounds completed">${Array.from({length:SESSION_LENGTH},(_,i)=>`<span class="${i<session.results.length?'complete':i===session.results.length?'current':''}"></span>`).join('')}</div><div class="question-heading"><p class="eyebrow">${review?'BACK FOR ANOTHER LOOK':chapter.tag} · ${item.type==='input'?'MAKE A SMALL EDIT':'READ & UNDERSTAND'}</p><h1>${item.title}</h1></div><div class="lesson-layout"><section class="code-column"><div class="code-window"><div class="code-bar">${icon('code',16)}<span>${esc(item.file)}</span><span class="code-language">${item.file.endsWith('.css')?'CSS':item.file.includes('.jsx')?'JSX':'CODE'}</span></div><pre tabindex="0" aria-label="Code example"><code>${highlightedCode(item.code)}</code></pre><div class="code-caption">A small teaching excerpt from your project.</div></div><div class="explanation"><span class="explanation-icon">${icon('book',19)}</span><div><h2>${review?'A quick reminder':'Before you try'}</h2><p>${esc(item.teach)}</p></div></div><p class="practice-note">${icon('folder',15)} These examples do not edit your website files.</p></section><section class="answer-panel" aria-labelledby="question"><h2 id="question">${esc(item.prompt)}</h2><div class="answer-area">${item.type==='choice'?`<div class="choices" role="radiogroup" aria-labelledby="question">${shuffledChoices(item,progress.round).map((choice,i)=>`<label class="choice ${String(answer)===String(choice.index)?'selected':''}"><input type="radio" name="answer" value="${choice.index}" ${String(answer)===String(choice.index)?'checked':''}><span class="choice-letter">${String.fromCharCode(65+i)}</span><span>${esc(choice.label)}</span><span class="choice-mark"></span></label>`).join('')}</div>`:`<label class="input-label" for="code-answer">Your answer</label><input id="code-answer" class="code-input" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(answer??'')}" placeholder="Type your answer here"><p class="input-help">Type the value requested. Press Enter to check.</p>`}</div><div class="hint-area"><button class="text-button" data-action="hint" aria-expanded="${hintOpen}">${icon('bolt',15)} ${hintOpen?'Hint is open':'Give me a hint'}</button>${hintOpen?`<p class="hint-text">${esc(item.hint)}</p>`:''}</div><div id="feedback" class="feedback" aria-live="polite" aria-atomic="true"></div><div class="answer-actions"><button id="check-answer" class="button primary" data-action="check" ${answer===null || answer===''?'disabled':''}>Check my answer ${icon('arrow',17)}</button><button class="text-button solution-button" data-action="solution">Walk me through it</button></div><p class="gentle-note">No timer. A wrong answer is a useful place to start.</p></section></div>`
}

function completed() {
  const entries=progress.active.results, clean=entries.filter(item=>item.clean).length, earned=entries.reduce((sum,item)=>sum+item.xp,0)
  return `<section class="completion"><div class="completion-icon">${icon('check',44)}</div><p class="eyebrow">ONE LOOP. A LITTLE MORE CONFIDENCE.</p><h1>That’s six steps forward.</h1><p>You worked through real ideas from your website.<br>Anything tricky will come back for another look.</p><div class="completion-stats"><span><strong>${earned}</strong> XP earned</span><span><strong>${clean} / 6</strong> Without hints or retries</span></div><div class="session-results">${entries.map(entry=>`<div>${icon(entry.clean?'check':'loop',17)}<span>${esc(lessonById(entry.id).title)}</span><small>${entry.clean?'Got it':'Worth another look'}</small></div>`).join('')}</div><div class="completion-actions"><button class="button primary" data-action="next-session">Another small loop ${icon('arrow',18)}</button><button class="button secondary" data-action="nav" data-view="lab">Try the playground</button><button class="text-button" data-action="nav" data-view="home">Done for now</button></div></section>`
}

function guide() {
  return `<div class="page-heading"><p class="eyebrow">A PLAIN-ENGLISH COMPANION</p><h1>Your field guide.</h1><p>You don’t have to memorise every word. Look it up, then try it.</p></div><label class="search-label" for="guide-search">Find a word</label><input class="search-input" id="guide-search" type="search" placeholder="Try “state”, “CSS” or “component”…" value="${esc(guideQuery)}"><div class="glossary-grid" id="glossary-results">${guideEntries()}</div>`
}
function guideEntries(){const entries=GLOSSARY.filter(entry=>entry.join(' ').toLowerCase().includes(guideQuery.toLowerCase()));return entries.length?entries.map(([name,description,example])=>`<article class="glossary-card"><h2>${esc(name)}</h2><p>${esc(description)}</p><code>${esc(example)}</code></article>`).join(''):'<p class="empty-state">No matching word yet. Try a shorter search.</p>'}

function progressPage() {
  const data=summary(progress)
  return `<div class="page-heading"><p class="eyebrow">EVIDENCE THAT YOU’RE LEARNING</p><h1>Every little bit counts.</h1><p>Explored means you’ve worked through it. Confidence grows after several unassisted answers.</p></div><div class="progress-summary"><div><strong>${progress.xp}</strong><span>Total XP</span></div><div><strong>${progress.sessions}</strong><span>Loops finished</span></div><div><strong>${data.explored}/30</strong><span>Explored</span></div><div><strong>${data.confident}</strong><span>Growing confidence</span></div></div><div class="progress-grid">${CHAPTERS.map(chapter=>`<section class="progress-trail"><h2><span class="chapter-icon ${chapter.color}">${icon(chapter.icon,18)}</span>${chapter.name}</h2>${LESSONS.filter(item=>item.chapter===chapter.id).map(item=>`<div class="progress-item"><span>${item.title}</span><span class="confidence-dots" aria-label="${statusText(progress.stats[item.id])}">${[1,2,3].map(n=>`<i class="${(progress.stats[item.id]?.box||0)>=n?'filled':''}"></i>`).join('')}</span></div>`).join('')}<button class="text-button" data-action="start" data-chapter="${chapter.id}">Practise this trail ${icon('arrow',15)}</button></section>`).join('')}</div><section class="backup-panel"><div><h2>Keep what you’ve learned.</h2><p>Progress lives in this browser at this address. Download a backup before changing browsers, ports or computers. Restoring replaces the current progress.</p></div><div class="backup-actions"><button class="button secondary" data-action="export">${icon('download',17)} Download backup</button><label class="button quiet" for="restore-file">Restore backup<input class="visually-hidden" id="restore-file" type="file" accept="application/json,.json"></label></div></section>`
}

const missions = {
  height:{title:'Give the buttons room.',goal:'Make both buttons at least 44px tall.',hint:'Inside .demo-button, change min-height: 28px to min-height: 44px.',solution:'.demo-button { min-height: 44px; }'},
  padding:{title:'Let the card breathe.',goal:'Give the card at least 24px of padding on every side.',hint:'Inside .demo-card, change padding: 16px to padding: 24px.',solution:'.demo-card { padding: 24px; }'},
  mobile:{title:'A layout that fits.',goal:'Stack the buttons vertically at 320px, and keep them side by side at 640px.',hint:'Add a max-width: 480px media query, and set .demo-actions to flex-direction: column inside it.',solution:'@media (max-width: 480px) {\n  .demo-actions { flex-direction: column; }\n}'}
}
function lab() {
  const mission=missions[labMission]
  return `<div class="page-heading"><p class="eyebrow">CHANGE SOMETHING. SEE WHAT HAPPENS.</p><h1>Your CSS playground.</h1><p>Real CSS, a small practice card, and space to experiment. Changes appear as you type.</p></div><div class="mission-tabs" role="group" aria-label="Playground challenge">${Object.entries(missions).map(([id,item],i)=>`<button data-action="mission" data-mission="${id}" aria-pressed="${id===labMission}" class="${id===labMission?'selected':''}"><span>0${i+1}</span>${['Button size','Card spacing','Mobile layout'][i]}${progress.labs.includes(id)?icon('check',15):''}</button>`).join('')}</div><div class="mission-brief"><div><p class="eyebrow">YOUR CHALLENGE${progress.labs.includes(labMission)?' · COMPLETED':''}</p><h2>${mission.title}</h2><p>${mission.goal}</p></div><button class="button primary" data-action="check-lab">Check my CSS ${icon('arrow',17)}</button></div><div class="lab-layout"><section class="lab-editor"><div class="code-bar"><span>${icon('code',16)} practice.css</span><button class="text-button" data-action="reset-css">Reset example</button></div><label class="visually-hidden" for="css-editor">Edit the practice card CSS</label><textarea id="css-editor" spellcheck="false" autocapitalize="off">${esc(labCss)}</textarea><details class="lab-hint"><summary>Need a nudge?</summary><p>${mission.hint}</p><code>${esc(mission.solution)}</code></details></section><section class="preview-panel"><div class="preview-toolbar"><span>LIVE PREVIEW</span><label>Width <select id="preview-width" aria-label="Preview viewport width">${[320,390,640].map(width=>`<option value="${width}" ${width===labWidth?'selected':''}>${width}px</option>`).join('')}</select></label></div><div id="preview-space"><div id="preview-size"><iframe id="practice-frame" title="Live CSS practice preview" sandbox="allow-same-origin"></iframe></div></div><div class="preview-caption">The preview scales to fit. Media queries use the selected width.</div><div id="lab-feedback" class="feedback" aria-live="polite"></div><details class="preview-markup"><summary>The HTML your CSS styles</summary><pre><code>&lt;article class="demo-card"&gt;\n  &lt;h2&gt;A website with purpose.&lt;/h2&gt;\n  &lt;p&gt;Clear design. A clear next step.&lt;/p&gt;\n  &lt;div class="demo-actions"&gt;\n    &lt;button class="demo-button"&gt;Get in touch&lt;/button&gt;\n    &lt;button class="demo-button"&gt;See the work&lt;/button&gt;\n  &lt;/div&gt;\n&lt;/article&gt;</code></pre></details></section></div>`
}

function previewDocument(css) {
  const safeCss=css.replace(/</g,'\\3c ')
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; form-action 'none'; base-uri 'none'"><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#191d18;color:#f1f1e9;font:14px/1.5 system-ui,sans-serif}h2{font-size:25px;line-height:1.2;letter-spacing:-.8px;margin:15px 0 10px}p{color:#aeb7a7;margin:0 0 24px}.demo-label{font-size:10px;letter-spacing:2px;color:#c9f184}button{font:inherit;cursor:pointer}.demo-actions{margin-top:20px}${safeCss}</style></head><body><article class="demo-card"><span class="demo-label">SITEREVIVE / PRACTICE</span><h2>A website with purpose.</h2><p>Clear design. A clear next step.</p><div class="demo-actions"><button class="demo-button">Get in touch</button><button class="demo-button">See the work</button></div></article></body></html>`
}

function updatePreview() {
  const frame=$('#practice-frame'); if(!frame)return
  frame.srcdoc=previewDocument(labCss)
  frame.style.width=labWidth+'px'
  const fit=()=>{if(!$('#preview-space'))return;const scale=Math.min(1,$('#preview-space').clientWidth/labWidth);frame.style.transform=`scale(${scale})`;$('#preview-size').style.width=(labWidth*scale)+'px';$('#preview-size').style.height=(350*scale)+'px'}
  fit();labObserver?.disconnect();labObserver=new ResizeObserver(fit);labObserver.observe($('#preview-space'))
}

async function inspectCss(width, css = labCss) {
  const frame=document.createElement('iframe')
  frame.sandbox='allow-same-origin';frame.title='CSS check';frame.setAttribute('aria-hidden','true');frame.style.cssText=`position:fixed;left:-10000px;top:0;width:${width}px;height:350px;border:0;`
  try {
    const loaded=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Preview check timed out. Try again.')),3000);frame.onload=()=>{clearTimeout(timeout);resolve()}})
    frame.srcdoc=previewDocument(css);document.body.append(frame);await loaded
    const doc=frame.contentDocument, win=frame.contentWindow, card=doc.querySelector('.demo-card')
    return {heights:[...doc.querySelectorAll('.demo-button')].map(el=>el.getBoundingClientRect().height),padding:['Top','Right','Bottom','Left'].map(side=>parseFloat(win.getComputedStyle(card)['padding'+side])),direction:win.getComputedStyle(doc.querySelector('.demo-actions')).flexDirection}
  } finally {frame.remove()}
}

function render() {
  labObserver?.disconnect()
  $('#app').innerHTML=shell(view==='home'?home():view==='lesson'?lesson():view==='lab'?lab():view==='guide'?guide():progressPage())
  if(view==='lab')updatePreview()
  if(view==='lesson'&&feedback)renderFeedback()
}

function renderFeedback() {
  const target=$('#feedback'); if(!target || !feedback)return
  const solved=['success','guided'].includes(feedback.kind)
  target.className='feedback '+feedback.kind
  target.innerHTML=`<strong>${feedback.kind==='success'?'That’s it. You’ve got the idea.':feedback.kind==='guided'?'Let’s work through it.':'Not quite yet. Let’s look again.'}</strong><p>${esc(feedback.text)}</p>`
  const button=$('#check-answer');button.disabled=false;button.dataset.action=solved?'continue':'check';button.innerHTML=`${solved?'Next small step':'Try my answer again'} ${icon('arrow',17)}`
  $('.solution-button').hidden=solved
  document.querySelectorAll('.choices input,#code-answer').forEach(el=>el.disabled=solved)
}

function check() {
  if(answer===null || String(answer).trim()==='' || ['success','guided'].includes(feedback?.kind))return
  const item=lessonById(progress.active.lessonId), correct=checkAnswer(item,answer)
  if(!correct){progress.active.missed=true;save()}
  feedback={kind:correct?'success':'error',text:item.why+(correct?'':' Change your answer and try again. This one will return sooner.')}
  renderFeedback()
}

document.addEventListener('click',async event=>{
  const el=event.target.closest('[data-action]');if(!el || el.disabled)return
  event.preventDefault()
  const action=el.dataset.action
  if(action==='nav')go(el.dataset.view)
  if(action==='dismiss'){notice='';render()}
  if(action==='start')begin(el.dataset.chapter)
  if(action==='resume')go('lesson')
  if(action==='review')begin(null,'review')
  if(action==='next-session')begin(recommendedChapter(progress))
  if(action==='check')check()
  if(action==='continue'){progress=completeRound(progress);save();go('lesson')}
  if(action==='hint'){hintOpen=true;progress.active.hinted=true;save();render()}
  if(action==='solution'){
    const item=lessonById(progress.active.lessonId)
    progress.active.revealed=true;save();answer=item.type==='choice'?item.answer:item.answers[0]
    feedback={kind:'guided',text:`The answer is ${item.type==='choice'?item.choices[item.answer]:item.answers[0]}. ${item.why} We’ll practise this again.`};render()
  }
  if(action==='export'){
    const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a')
    link.href=url;link.download=`code-loop-progress-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  if(action==='mission'){labMission=el.dataset.mission;render()}
  if(action==='reset-css'){labCss=initialCss;try{localStorage.setItem(STORAGE_KEY+'-css',labCss)}catch{}render()}
  if(action==='check-lab'){
    el.disabled=true
    const checkedMission=labMission, checkedCss=labCss
    clearTimeout(previewTimer)
    updatePreview()
    try {
      const mobile=await inspectCss(320,checkedCss),desktop=checkedMission==='mobile'?await inspectCss(640,checkedCss):null
      if(view!=='lab' || labMission!==checkedMission || labCss!==checkedCss)return
      const passed=labMission==='height'?mobile.heights.every(height=>height>=44):labMission==='padding'?mobile.padding.every(value=>value>=24):mobile.direction==='column'&&desktop.direction==='row'
      const target=$('#lab-feedback');if(!target)return
      const fresh=!progress.labs.includes(labMission)
      if(passed&&fresh){progress.labs.push(labMission);progress.xp+=20;save()}
      target.className='feedback '+(passed?'success':'error');target.innerHTML=`<strong>${passed?'Your CSS does it.'+(fresh?' +20 XP':''):'Keep experimenting.'}</strong><p>${passed?'The real rendered preview passes this challenge. Try another width to see how it behaves.':esc(missions[labMission].hint)}</p>`
    }catch(error){const target=$('#lab-feedback');if(target){target.className='feedback error';target.textContent=error.message}}
    finally{el.disabled=false;if(el.isConnected)el.focus({preventScroll:true})}
  }
})

document.addEventListener('change',async event=>{
  if(event.target.name==='answer'){
    answer=event.target.value
    document.querySelectorAll('.choice').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked))
    $('#check-answer').disabled=false
  }
  if(event.target.id==='preview-width'){labWidth=Number(event.target.value);updatePreview()}
  if(event.target.id==='restore-file'){
    const file=event.target.files[0];if(!file)return
    try{if(file.size>1000000)throw new Error('That backup is too large.');const restored=parseProgress(JSON.parse(await file.text()));progress=restored;save();notice='Your backup has been restored.';go('progress')}
    catch(error){notice='Could not restore that file. '+error.message;render()}
  }
})
let previewTimer
document.addEventListener('input',event=>{
  if(event.target.id==='code-answer'){answer=event.target.value;$('#check-answer').disabled=!answer.trim()}
  if(event.target.id==='guide-search'){guideQuery=event.target.value;$('#glossary-results').innerHTML=guideEntries()}
  if(event.target.id==='css-editor'){labCss=event.target.value;try{localStorage.setItem(STORAGE_KEY+'-css',labCss)}catch{}clearTimeout(previewTimer);previewTimer=setTimeout(updatePreview,160)}
})
document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='code-answer'){event.preventDefault();check()}})
render()
