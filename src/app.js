/*
 * app.js — the face of Code Loop: renders the five views (home, lesson, CSS
 * playground, field guide, progress) from plain template strings, wires the
 * buttons and inputs to the learning logic, and keeps progress in the
 * browser's own storage. Every rule about what comes next lives in
 * learning.js; this file only shows it and reacts to clicks.
 */
import { CHAPTERS, LESSONS, GLOSSARY } from './lessons.js'
import { STORAGE_KEY, SESSION_LENGTH, freshProgress, parseProgress, startSession, completeRound, summary, recommendedChapter, checkAnswer, shuffledChoices } from './learning.js'

const LESSON_COUNT = LESSONS.length
const LESSONS_PER_TRAIL = LESSON_COUNT / CHAPTERS.length
const LAB_CSS_KEY = STORAGE_KEY + '-css'
const MAX_BACKUP_BYTES = 1000000
const REVOKE_URL_AFTER_MS = 1000
const PREVIEW_DEBOUNCE_MS = 160
const PREVIEW_CHECK_TIMEOUT_MS = 3000
const PREVIEW_HEIGHT = 350
const PREVIEW_WIDTHS = [320, 390, 640]
const MOBILE_WIDTH = 320
const DESKTOP_WIDTH = 640
const LAB_XP = 20
const MIN_BUTTON_HEIGHT = 44
const MIN_CARD_PADDING = 24
const CHOICE_LETTER_START = 'A'.charCodeAt(0)
const CONFIDENCE_DOTS = [1, 2, 3]
const SOLVED_KINDS = ['success', 'guided']
const SAVED_TEXT = 'Progress saved in this browser'
const TEMPORARY_TEXT = 'Temporary progress · download a backup'
const STORAGE_UNAVAILABLE_TEXT = 'Browser storage is unavailable. Practice still works; download a backup before closing.'

const ICON_PATHS = { folder: 'M3 7h7l2 2h9v11H3z M3 7V4h7l2 3', code: 'm8 5-6 7 6 7m8-14 6 7-6 7m-2-16-4 18', layout: 'M3 3h18v18H3z M3 9h18M10 9v12', bolt: 'm14 2-10 12h7l-1 8 10-13h-7z', tool: 'm14 5 5 5m-7 0 7-7 2 2-7 7M4 20l-1-4 8-8 4 4-8 8z', arrow: 'M4 12h15m-6-6 6 6-6 6', check: 'm5 12 4 4L19 6', loop: 'M20 7v5h-5M4 17v-5h5 M5 7a8 8 0 0 1 14-1l1 6M4 12l1 6a8 8 0 0 0 14-1', book: 'M12 5c-4-3-8-2-10-1v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-1-6-2-10 1Zm0 0v15', chart: 'M4 20V10m8 10V4m8 16v-7', download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z', back: 'M20 12H4m6-6-6 6 6 6' }
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const NAV_ITEMS = [['home', 'loop', 'Practise'], ['lab', 'code', 'Playground'], ['guide', 'book', 'Field guide'], ['progress', 'chart', 'Your progress']]
const MISSION_LABELS = ['Button size', 'Card spacing', 'Mobile layout']
const MISSIONS = {
  height: { title: 'Give the buttons room.', goal: 'Make both buttons at least 44px tall.', hint: 'Inside .demo-button, change min-height: 28px to min-height: 44px.', solution: '.demo-button { min-height: 44px; }' },
  padding: { title: 'Let the card breathe.', goal: 'Give the card at least 24px of padding on every side.', hint: 'Inside .demo-card, change padding: 16px to padding: 24px.', solution: '.demo-card { padding: 24px; }' },
  mobile: { title: 'A layout that fits.', goal: 'Stack the buttons vertically at 320px, and keep them side by side at 640px.', hint: 'Add a max-width: 480px media query, and set .demo-actions to flex-direction: column inside it.', solution: '@media (max-width: 480px) {\n  .demo-actions { flex-direction: column; }\n}' },
}
const INITIAL_LAB_CSS = `.demo-card {
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

// Screen state. Everything that survives a reload lives in `progress` and `labCss`.
let notice = ''
let temporary = false
let progress = loadProgress()
let view = progress.active != null ? 'lesson' : 'home'
let answer = null
let feedback = null
let hintOpen = false
let guideQuery = ''
let labMission = 'height'
let labWidth = MOBILE_WIDTH
let labObserver = null
let labCss = loadLabCss()
let previewTimer = null

function query(selector) {
  return document.querySelector(selector)
}

function escapeChar(char) {
  return HTML_ESCAPES[char]
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, escapeChar)
}

function icon(name, size = 20) {
  const path = ICON_PATHS[name] != null ? `<path d="${ICON_PATHS[name]}"/>` : ''
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return freshProgress()
    return parseProgress(JSON.parse(raw))
  } catch {
    notice = 'Saved progress could not be read. You can restore a downloaded backup in Your progress.'
    return freshProgress()
  }
}

function loadLabCss() {
  try {
    return localStorage.getItem(LAB_CSS_KEY) ?? INITIAL_LAB_CSS
  } catch {
    // The playground also works without storage.
    return INITIAL_LAB_CSS
  }
}

function saveLabCss() {
  try {
    localStorage.setItem(LAB_CSS_KEY, labCss)
  } catch {
    // Storage is optional for the playground; the editor keeps the text.
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    temporary = false
  } catch {
    temporary = true
  }
  const badge = query('#save-status')
  if (badge != null) badge.textContent = temporary ? TEMPORARY_TEXT : SAVED_TEXT
}

function go(next) {
  view = next
  answer = null
  feedback = null
  hintOpen = false
  render()
  window.scrollTo({ top: 0, behavior: 'instant' })
  query('#main').focus({ preventScroll: true })
}

function begin(chapter, mode = 'learn') {
  progress = startSession(progress, chapter, mode)
  save()
  go('lesson')
}

function chapterById(id) {
  return CHAPTERS.find(hasId)

  function hasId(chapter) {
    return chapter.id === id
  }
}

function lessonById(id) {
  return LESSONS.find(hasId)

  function hasId(lesson) {
    return lesson.id === id
  }
}

function hasSeen(stat) {
  return stat != null && stat.seen > 0
}

function boxOf(stat) {
  return stat != null ? stat.box : 0
}

function statusText(stat) {
  if (!hasSeen(stat)) return 'Not tried'
  if (stat.box >= 3) return 'Growing confidence'
  if (stat.box === 0) return 'Practise again'
  return 'Building familiarity'
}

function shell(content) {
  const data = summary(progress)
  const onHome = view === 'home' || view === 'lesson'

  function navButton([id, symbol, label]) {
    const current = view === id || (id === 'home' && onHome)
    return `<button class="nav-item ${current ? 'active' : ''}" data-action="nav" data-view="${id}" ${current ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span>${id === 'home' ? '<span class="nav-dot"></span>' : ''}</button>`
  }

  const noticeBlock = notice !== '' ? `<div class="notice" role="status">${escapeHtml(notice)}<button data-action="dismiss" aria-label="Dismiss notice">×</button></div>` : ''
  const temporaryBlock = temporary ? `<div class="notice">${STORAGE_UNAVAILABLE_TEXT}</div>` : ''
  return `<aside class="sidebar"><a class="brand" href="#" data-action="nav" data-view="home"><span class="brand-symbol">${icon('loop', 26)}</span><span>Code Loop<small>YOUR SITE. YOUR SKILLS.</small></span></a><div class="sidebar-label">YOUR WORKSPACE</div><nav aria-label="Main navigation">${NAV_ITEMS.map(navButton).join('')}</nav><div class="sidebar-bottom"><div class="little-code">{ <span>one step at a time</span> }</div><p>You don’t need to know it all.<br>Just the next small piece.</p><div class="offline"><span></span> Runs on your computer</div></div></aside><div class="workspace"><header class="topbar"><span>BUILT AROUND <strong>SITEREVIVESA</strong></span><div class="xp-badge">${icon('star', 15)} ${progress.xp} XP <span class="topbar-divider"></span> ${data.explored}/${LESSON_COUNT} explored</div></header>${noticeBlock}${temporaryBlock}<main id="main" tabindex="-1">${content}</main><footer class="app-footer"><span id="save-status">${temporary ? TEMPORARY_TEXT : SAVED_TEXT}</span><span>Small examples. Real understanding.</span></footer></div>`
}

function home() {
  const data = summary(progress)
  const suggested = recommendedChapter(progress)
  const chapter = chapterById(suggested)
  const active = progress.active
  const resuming = active != null && !active.done

  function chapterCardFor(item) {
    return chapterCard(item, suggested)
  }

  const eyebrow = resuming ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR NEXT SMALL STEP'
  const title = resuming ? 'Your loop is waiting.' : escapeHtml(chapter.name)
  const copy = resuming ? `${active.results.length} of ${SESSION_LENGTH} rounds complete. Your place is saved.` : '6 short rounds. Hints when you need them. Room to try again.'
  const buttonLabel = resuming ? 'Continue my loop' : progress.round > 0 ? 'Start a practice loop' : 'Start my first loop'
  return `<section class="welcome"><div><p class="eyebrow"><span class="live-dot"></span> YOUR PERSONAL CODE PRACTICE</p><h1>Small steps.<br><em>Real understanding.</em></h1><p class="intro">Learn to read, change and understand your own website.<br class="desktop-break"> One little challenge at a time.</p></div><div class="welcome-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="code-slip slip-back">${icon('folder', 18)} src / content / hosting.ts</div><div class="code-slip slip-front"><div class="slip-title"><i></i><i></i><i></i><span>a little code, a little clearer</span></div><code><span class="muted">price:</span> {<br>&nbsp; monthly: <b>289</b>,<br>&nbsp; annual: <b>2890</b><br>}</code><span class="code-tag">You’ll understand this. ${icon('check', 13)}</span></div><div class="floating-star">✳</div></div></section><section class="start-panel" aria-labelledby="loop-title"><div class="start-icon">${icon('loop', 28)}</div><div class="start-copy"><p class="eyebrow">${eyebrow}</p><h2 id="loop-title">${title}</h2><p>${copy}</p></div><button class="button primary" data-action="${resuming ? 'resume' : 'start'}" data-chapter="${suggested}">${buttonLabel} ${icon('arrow', 18)}</button></section><div class="stats-row"><div><span class="stat-icon">${icon('book')}</span><strong>${data.explored}<small> / ${LESSON_COUNT}</small></strong><span>Challenges explored</span></div><div><span class="stat-icon peach">${icon('loop')}</span><strong>${data.due}</strong><span>Ready to revisit</span><button class="text-button" data-action="review" ${data.explored > 0 ? '' : 'disabled'}>Practise again ${icon('arrow', 13)}</button></div><div><span class="stat-icon blue">${icon('star')}</span><strong>${data.confident}</strong><span>Growing confidence</span></div></div><section class="learning-path"><div class="section-head"><div><p class="eyebrow">FROM “WHAT IS THIS?” TO “I CAN CHANGE THIS.”</p><h2>Your learning path</h2></div><span>${CHAPTERS.length} trails · ${LESSON_COUNT} challenges</span></div><div class="chapter-list">${CHAPTERS.map(chapterCardFor).join('')}</div></section><div class="bottom-note">${icon('loop', 18)}<p>Repetition is part of learning. Tricky questions return sooner; familiar ones get more space.</p><button class="text-button" data-action="nav" data-view="guide">Keep a field guide handy ${icon('arrow', 14)}</button></div>`
}

function lessonsIn(chapterId) {
  return LESSONS.filter(inChapter)

  function inChapter(lesson) {
    return lesson.chapter === chapterId
  }
}

function exploredIn(lessons) {
  return lessons.filter(explored).length

  function explored(lesson) {
    return hasSeen(progress.stats[lesson.id])
  }
}

function chapterCard(chapter, suggested) {
  const items = lessonsIn(chapter.id)
  const explored = exploredIn(items)
  const isSuggested = chapter.id === suggested
  return `<button class="chapter-card ${isSuggested ? 'suggested' : ''}" data-action="start" data-chapter="${chapter.id}"><span class="chapter-number">${chapter.number}</span><span class="chapter-icon ${chapter.color}">${icon(chapter.icon, 23)}</span><span class="chapter-copy"><span class="chapter-tag">${chapter.tag}${isSuggested ? ' <b>UP NEXT</b>' : ''}</span><strong>${chapter.name}</strong><span>${chapter.description}</span></span><span class="chapter-meter"><span>${explored} of ${LESSONS_PER_TRAIL} explored</span><span class="mini-track"><i style="width:${explored / LESSONS_PER_TRAIL * 100}%"></i></span></span><span class="chapter-arrow">${icon('arrow', 19)}</span></button>`
}

function highlightedCode(code) {
  return escapeHtml(code).split('\n').map(codeLine).join('')

  function codeLine(line, index) {
    return `<span class="code-line"><span class="line-number" aria-hidden="true">${index + 1}</span><span>${line === '' ? ' ' : line}</span></span>`
  }
}

function languageOf(file) {
  if (file.endsWith('.css')) return 'CSS'
  if (file.includes('.jsx')) return 'JSX'
  return 'CODE'
}

function lesson() {
  const session = progress.active
  if (session == null) return home()
  if (session.done) return completed()
  const item = lessonById(session.lessonId)
  const chapter = chapterById(item.chapter)
  const review = hasSeen(progress.stats[item.id])
  const completedRounds = session.results.length

  function roundDot(_, index) {
    const state = index < completedRounds ? 'complete' : index === completedRounds ? 'current' : ''
    return `<span class="${state}"></span>`
  }

  function choiceLabel(choice, index) {
    const selected = String(answer) === String(choice.index)
    return `<label class="choice ${selected ? 'selected' : ''}"><input type="radio" name="answer" value="${choice.index}" ${selected ? 'checked' : ''}><span class="choice-letter">${String.fromCharCode(CHOICE_LETTER_START + index)}</span><span>${escapeHtml(choice.label)}</span><span class="choice-mark"></span></label>`
  }

  const answerArea = item.type === 'choice'
    ? `<div class="choices" role="radiogroup" aria-labelledby="question">${shuffledChoices(item, progress.round).map(choiceLabel).join('')}</div>`
    : `<label class="input-label" for="code-answer">Your answer</label><input id="code-answer" class="code-input" autocomplete="off" autocapitalize="off" spellcheck="false" value="${escapeHtml(answer ?? '')}" placeholder="Type your answer here"><p class="input-help">Type the value requested. Press Enter to check.</p>`
  const checkDisabled = answer === null || answer === '' ? 'disabled' : ''
  return `<div class="lesson-top"><button class="text-button" data-action="nav" data-view="home">${icon('back', 17)} Save & leave</button><span>${session.mode === 'review' ? 'MIXED PRACTICE' : chapter.name.toUpperCase()}</span><span>ROUND ${completedRounds + 1} / ${SESSION_LENGTH}</span></div><div class="round-track" aria-label="${completedRounds} of ${SESSION_LENGTH} rounds completed">${Array.from({ length: SESSION_LENGTH }, roundDot).join('')}</div><div class="question-heading"><p class="eyebrow">${review ? 'BACK FOR ANOTHER LOOK' : chapter.tag} · ${item.type === 'input' ? 'MAKE A SMALL EDIT' : 'READ & UNDERSTAND'}</p><h1>${item.title}</h1></div><div class="lesson-layout"><section class="code-column"><div class="code-window"><div class="code-bar">${icon('code', 16)}<span>${escapeHtml(item.file)}</span><span class="code-language">${languageOf(item.file)}</span></div><pre tabindex="0" aria-label="Code example"><code>${highlightedCode(item.code)}</code></pre><div class="code-caption">A small teaching excerpt from your project.</div></div><div class="explanation"><span class="explanation-icon">${icon('book', 19)}</span><div><h2>${review ? 'A quick reminder' : 'Before you try'}</h2><p>${escapeHtml(item.teach)}</p></div></div><p class="practice-note">${icon('folder', 15)} These examples do not edit your website files.</p></section><section class="answer-panel" aria-labelledby="question"><h2 id="question">${escapeHtml(item.prompt)}</h2><div class="answer-area">${answerArea}</div><div class="hint-area"><button class="text-button" data-action="hint" aria-expanded="${hintOpen}">${icon('bolt', 15)} ${hintOpen ? 'Hint is open' : 'Give me a hint'}</button>${hintOpen ? `<p class="hint-text">${escapeHtml(item.hint)}</p>` : ''}</div><div id="feedback" class="feedback" aria-live="polite" aria-atomic="true"></div><div class="answer-actions"><button id="check-answer" class="button primary" data-action="check" ${checkDisabled}>Check my answer ${icon('arrow', 17)}</button><button class="text-button solution-button" data-action="solution">Walk me through it</button></div><p class="gentle-note">No timer. A wrong answer is a useful place to start.</p></section></div>`
}

function isClean(entry) {
  return entry.clean
}

function addXp(sum, entry) {
  return sum + entry.xp
}

function completed() {
  const entries = progress.active.results
  const clean = entries.filter(isClean).length
  const earned = entries.reduce(addXp, 0)

  function resultRow(entry) {
    return `<div>${icon(entry.clean ? 'check' : 'loop', 17)}<span>${escapeHtml(lessonById(entry.id).title)}</span><small>${entry.clean ? 'Got it' : 'Worth another look'}</small></div>`
  }

  return `<section class="completion"><div class="completion-icon">${icon('check', 44)}</div><p class="eyebrow">ONE LOOP. A LITTLE MORE CONFIDENCE.</p><h1>That’s six steps forward.</h1><p>You worked through real ideas from your website.<br>Anything tricky will come back for another look.</p><div class="completion-stats"><span><strong>${earned}</strong> XP earned</span><span><strong>${clean} / ${SESSION_LENGTH}</strong> Without hints or retries</span></div><div class="session-results">${entries.map(resultRow).join('')}</div><div class="completion-actions"><button class="button primary" data-action="next-session">Another small loop ${icon('arrow', 18)}</button><button class="button secondary" data-action="nav" data-view="lab">Try the playground</button><button class="text-button" data-action="nav" data-view="home">Done for now</button></div></section>`
}

function guide() {
  return `<div class="page-heading"><p class="eyebrow">A PLAIN-ENGLISH COMPANION</p><h1>Your field guide.</h1><p>You don’t have to memorise every word. Look it up, then try it.</p></div><label class="search-label" for="guide-search">Find a word</label><input class="search-input" id="guide-search" type="search" placeholder="Try “state”, “CSS” or “component”…" value="${escapeHtml(guideQuery)}"><div class="glossary-grid" id="glossary-results">${guideEntries()}</div>`
}

function guideEntries() {
  const wanted = guideQuery.toLowerCase()

  function matchesQuery(entry) {
    return entry.join(' ').toLowerCase().includes(wanted)
  }

  function glossaryCard([name, description, example]) {
    return `<article class="glossary-card"><h2>${escapeHtml(name)}</h2><p>${escapeHtml(description)}</p><code>${escapeHtml(example)}</code></article>`
  }

  const entries = GLOSSARY.filter(matchesQuery)
  if (entries.length === 0) return '<p class="empty-state">No matching word yet. Try a shorter search.</p>'
  return entries.map(glossaryCard).join('')
}

function progressPage() {
  const data = summary(progress)

  function confidenceDot(item, level) {
    return `<i class="${boxOf(progress.stats[item.id]) >= level ? 'filled' : ''}"></i>`
  }

  function progressItem(item) {

    function dotFor(level) {
      return confidenceDot(item, level)
    }

    return `<div class="progress-item"><span>${item.title}</span><span class="confidence-dots" aria-label="${statusText(progress.stats[item.id])}">${CONFIDENCE_DOTS.map(dotFor).join('')}</span></div>`
  }

  function trailSection(chapter) {
    return `<section class="progress-trail"><h2><span class="chapter-icon ${chapter.color}">${icon(chapter.icon, 18)}</span>${chapter.name}</h2>${lessonsIn(chapter.id).map(progressItem).join('')}<button class="text-button" data-action="start" data-chapter="${chapter.id}">Practise this trail ${icon('arrow', 15)}</button></section>`
  }

  return `<div class="page-heading"><p class="eyebrow">EVIDENCE THAT YOU’RE LEARNING</p><h1>Every little bit counts.</h1><p>Explored means you’ve worked through it. Confidence grows after several unassisted answers.</p></div><div class="progress-summary"><div><strong>${progress.xp}</strong><span>Total XP</span></div><div><strong>${progress.sessions}</strong><span>Loops finished</span></div><div><strong>${data.explored}/${LESSON_COUNT}</strong><span>Explored</span></div><div><strong>${data.confident}</strong><span>Growing confidence</span></div></div><div class="progress-grid">${CHAPTERS.map(trailSection).join('')}</div><section class="backup-panel"><div><h2>Keep what you’ve learned.</h2><p>Progress lives in this browser at this address. Download a backup before changing browsers, ports or computers. Restoring replaces the current progress.</p></div><div class="backup-actions"><button class="button secondary" data-action="export">${icon('download', 17)} Download backup</button><label class="button quiet" for="restore-file">Restore backup<input class="visually-hidden" id="restore-file" type="file" accept="application/json,.json"></label></div></section>`
}

function lab() {
  const mission = MISSIONS[labMission]
  const missionDone = progress.labs.includes(labMission)

  function missionTab([id, item], index) {
    const selected = id === labMission
    return `<button data-action="mission" data-mission="${id}" aria-pressed="${selected}" class="${selected ? 'selected' : ''}"><span>0${index + 1}</span>${MISSION_LABELS[index]}${progress.labs.includes(id) ? icon('check', 15) : ''}</button>`
  }

  function widthOption(width) {
    return `<option value="${width}" ${width === labWidth ? 'selected' : ''}>${width}px</option>`
  }

  return `<div class="page-heading"><p class="eyebrow">CHANGE SOMETHING. SEE WHAT HAPPENS.</p><h1>Your CSS playground.</h1><p>Real CSS, a small practice card, and space to experiment. Changes appear as you type.</p></div><div class="mission-tabs" role="group" aria-label="Playground challenge">${Object.entries(MISSIONS).map(missionTab).join('')}</div><div class="mission-brief"><div><p class="eyebrow">YOUR CHALLENGE${missionDone ? ' · COMPLETED' : ''}</p><h2>${mission.title}</h2><p>${mission.goal}</p></div><button class="button primary" data-action="check-lab">Check my CSS ${icon('arrow', 17)}</button></div><div class="lab-layout"><section class="lab-editor"><div class="code-bar"><span>${icon('code', 16)} practice.css</span><button class="text-button" data-action="reset-css">Reset example</button></div><label class="visually-hidden" for="css-editor">Edit the practice card CSS</label><textarea id="css-editor" spellcheck="false" autocapitalize="off">${escapeHtml(labCss)}</textarea><details class="lab-hint"><summary>Need a nudge?</summary><p>${mission.hint}</p><code>${escapeHtml(mission.solution)}</code></details></section><section class="preview-panel"><div class="preview-toolbar"><span>LIVE PREVIEW</span><label>Width <select id="preview-width" aria-label="Preview viewport width">${PREVIEW_WIDTHS.map(widthOption).join('')}</select></label></div><div id="preview-space"><div id="preview-size"><iframe id="practice-frame" title="Live CSS practice preview" sandbox="allow-same-origin"></iframe></div></div><div class="preview-caption">The preview scales to fit. Media queries use the selected width.</div><div id="lab-feedback" class="feedback" aria-live="polite"></div><details class="preview-markup"><summary>The HTML your CSS styles</summary><pre><code>&lt;article class="demo-card"&gt;\n  &lt;h2&gt;A website with purpose.&lt;/h2&gt;\n  &lt;p&gt;Clear design. A clear next step.&lt;/p&gt;\n  &lt;div class="demo-actions"&gt;\n    &lt;button class="demo-button"&gt;Get in touch&lt;/button&gt;\n    &lt;button class="demo-button"&gt;See the work&lt;/button&gt;\n  &lt;/div&gt;\n&lt;/article&gt;</code></pre></details></section></div>`
}

function previewDocument(css) {
  // A "<" inside the learner's CSS would end the style block; the escape keeps it CSS.
  const safeCss = css.replace(/</g, '\\3c ')
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; form-action 'none'; base-uri 'none'"><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#191d18;color:#f1f1e9;font:14px/1.5 system-ui,sans-serif}h2{font-size:25px;line-height:1.2;letter-spacing:-.8px;margin:15px 0 10px}p{color:#aeb7a7;margin:0 0 24px}.demo-label{font-size:10px;letter-spacing:2px;color:#c9f184}button{font:inherit;cursor:pointer}.demo-actions{margin-top:20px}${safeCss}</style></head><body><article class="demo-card"><span class="demo-label">SITEREVIVE / PRACTICE</span><h2>A website with purpose.</h2><p>Clear design. A clear next step.</p><div class="demo-actions"><button class="demo-button">Get in touch</button><button class="demo-button">See the work</button></div></article></body></html>`
}

function updatePreview() {
  const frame = query('#practice-frame')
  if (frame == null) return
  frame.srcdoc = previewDocument(labCss)
  frame.style.width = labWidth + 'px'

  function fitToSpace() {
    const space = query('#preview-space')
    if (space == null) return
    const scale = Math.min(1, space.clientWidth / labWidth)
    frame.style.transform = `scale(${scale})`
    query('#preview-size').style.width = (labWidth * scale) + 'px'
    query('#preview-size').style.height = (PREVIEW_HEIGHT * scale) + 'px'
  }

  fitToSpace()
  if (labObserver != null) labObserver.disconnect()
  labObserver = new ResizeObserver(fitToSpace)
  labObserver.observe(query('#preview-space'))
}

function whenFrameLoads(frame) {

  function settle(resolve, reject) {

    function giveUp() {
      reject(new Error('Preview check timed out. Try again.'))
    }

    function loaded() {
      clearTimeout(timeout)
      resolve()
    }

    const timeout = setTimeout(giveUp, PREVIEW_CHECK_TIMEOUT_MS)
    frame.onload = loaded
  }

  return new Promise(settle)
}

function heightOf(element) {
  return element.getBoundingClientRect().height
}

// Renders the learner's CSS in a hidden frame at the given width and measures
// the real result, so the playground checks what the browser did, not the text.
async function inspectCss(width, css = labCss) {
  const frame = document.createElement('iframe')
  frame.sandbox = 'allow-same-origin'
  frame.title = 'CSS check'
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:${PREVIEW_HEIGHT}px;border:0;`
  try {
    const loaded = whenFrameLoads(frame)
    frame.srcdoc = previewDocument(css)
    document.body.append(frame)
    await loaded
    const doc = frame.contentDocument
    const win = frame.contentWindow
    const card = doc.querySelector('.demo-card')

    function paddingOn(side) {
      return parseFloat(win.getComputedStyle(card)['padding' + side])
    }

    return {
      heights: [...doc.querySelectorAll('.demo-button')].map(heightOf),
      padding: ['Top', 'Right', 'Bottom', 'Left'].map(paddingOn),
      direction: win.getComputedStyle(doc.querySelector('.demo-actions')).flexDirection,
    }
  } finally {
    frame.remove()
  }
}

const VIEWS = { home, lesson, lab, guide, progress: progressPage }

function render() {
  if (labObserver != null) labObserver.disconnect()
  const renderView = VIEWS[view] ?? progressPage
  query('#app').innerHTML = shell(renderView())
  if (view === 'lab') updatePreview()
  if (view === 'lesson' && feedback != null) renderFeedback()
}

function feedbackTitle(kind) {
  if (kind === 'success') return 'That’s it. You’ve got the idea.'
  if (kind === 'guided') return 'Let’s work through it.'
  return 'Not quite yet. Let’s look again.'
}

function disableIf(solved) {
  return function setDisabled(element) {
    element.disabled = solved
  }
}

function renderFeedback() {
  const target = query('#feedback')
  if (target == null || feedback == null) return
  const solved = SOLVED_KINDS.includes(feedback.kind)
  target.className = 'feedback ' + feedback.kind
  target.innerHTML = `<strong>${feedbackTitle(feedback.kind)}</strong><p>${escapeHtml(feedback.text)}</p>`
  const button = query('#check-answer')
  button.disabled = false
  button.dataset.action = solved ? 'continue' : 'check'
  button.innerHTML = `${solved ? 'Next small step' : 'Try my answer again'} ${icon('arrow', 17)}`
  query('.solution-button').hidden = solved
  document.querySelectorAll('.choices input,#code-answer').forEach(disableIf(solved))
}

function check() {
  const alreadySolved = feedback != null && SOLVED_KINDS.includes(feedback.kind)
  if (answer === null || String(answer).trim() === '' || alreadySolved) return
  const item = lessonById(progress.active.lessonId)
  const correct = checkAnswer(item, answer)
  if (!correct) {
    progress.active.missed = true
    save()
  }
  feedback = { kind: correct ? 'success' : 'error', text: item.why + (correct ? '' : ' Change your answer and try again. This one will return sooner.') }
  renderFeedback()
}

// One function per data-action attribute in the templates.
function navigate(el) {
  go(el.dataset.view)
}

function dismissNotice() {
  notice = ''
  render()
}

function startTrail(el) {
  begin(el.dataset.chapter)
}

function resumeLoop() {
  go('lesson')
}

function reviewMixed() {
  begin(null, 'review')
}

function nextSession() {
  begin(recommendedChapter(progress))
}

function continueRound() {
  progress = completeRound(progress)
  save()
  go('lesson')
}

function openHint() {
  hintOpen = true
  progress.active.hinted = true
  save()
  render()
}

function showSolution() {
  const item = lessonById(progress.active.lessonId)
  progress.active.revealed = true
  save()
  const solution = item.type === 'choice' ? item.choices[item.answer] : item.answers[0]
  answer = item.type === 'choice' ? item.answer : item.answers[0]
  feedback = { kind: 'guided', text: `The answer is ${solution}. ${item.why} We’ll practise this again.` }
  render()
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `code-loop-progress-${new Date().toISOString().slice(0, 10)}.json`
  link.click()

  function releaseUrl() {
    URL.revokeObjectURL(url)
  }

  setTimeout(releaseUrl, REVOKE_URL_AFTER_MS)
}

function pickMission(el) {
  labMission = el.dataset.mission
  render()
}

function resetCss() {
  labCss = INITIAL_LAB_CSS
  saveLabCss()
  render()
}

function tallEnough(height) {
  return height >= MIN_BUTTON_HEIGHT
}

function paddedEnough(value) {
  return value >= MIN_CARD_PADDING
}

function missionPassed(mission, mobile, desktop) {
  if (mission === 'height') return mobile.heights.every(tallEnough)
  if (mission === 'padding') return mobile.padding.every(paddedEnough)
  return mobile.direction === 'column' && desktop.direction === 'row'
}

async function checkLab(el) {
  el.disabled = true
  const checkedMission = labMission
  const checkedCss = labCss
  clearTimeout(previewTimer)
  updatePreview()
  try {
    const mobile = await inspectCss(MOBILE_WIDTH, checkedCss)
    const desktop = checkedMission === 'mobile' ? await inspectCss(DESKTOP_WIDTH, checkedCss) : null
    // The learner may have moved on while the check ran; then the result is stale.
    if (view !== 'lab' || labMission !== checkedMission || labCss !== checkedCss) return
    const passed = missionPassed(labMission, mobile, desktop)
    const target = query('#lab-feedback')
    if (target == null) return
    const fresh = !progress.labs.includes(labMission)
    if (passed && fresh) {
      progress.labs.push(labMission)
      progress.xp += LAB_XP
      save()
    }
    target.className = 'feedback ' + (passed ? 'success' : 'error')
    const heading = passed ? 'Your CSS does it.' + (fresh ? ` +${LAB_XP} XP` : '') : 'Keep experimenting.'
    const detail = passed ? 'The real rendered preview passes this challenge. Try another width to see how it behaves.' : escapeHtml(MISSIONS[labMission].hint)
    target.innerHTML = `<strong>${heading}</strong><p>${detail}</p>`
  } catch (error) {
    const target = query('#lab-feedback')
    if (target != null) {
      target.className = 'feedback error'
      target.textContent = error.message
    }
  } finally {
    el.disabled = false
    if (el.isConnected) el.focus({ preventScroll: true })
  }
}

const ACTIONS = {
  nav: navigate,
  dismiss: dismissNotice,
  start: startTrail,
  resume: resumeLoop,
  review: reviewMixed,
  'next-session': nextSession,
  check,
  continue: continueRound,
  hint: openHint,
  solution: showSolution,
  export: exportBackup,
  mission: pickMission,
  'reset-css': resetCss,
  'check-lab': checkLab,
}

async function handleClick(event) {
  const el = event.target.closest('[data-action]')
  if (el == null || el.disabled) return
  event.preventDefault()
  const action = ACTIONS[el.dataset.action]
  if (action == null) return
  await action(el)
}

function syncSelectedChoice(label) {
  label.classList.toggle('selected', label.querySelector('input').checked)
}

async function restoreBackup(input) {
  const file = input.files[0]
  if (file == null) return
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error('That backup is too large.')
    const restored = parseProgress(JSON.parse(await file.text()))
    progress = restored
    save()
    notice = 'Your backup has been restored.'
    go('progress')
  } catch (error) {
    notice = 'Could not restore that file. ' + error.message
    render()
  }
}

async function handleChange(event) {
  const target = event.target
  if (target.name === 'answer') {
    answer = target.value
    document.querySelectorAll('.choice').forEach(syncSelectedChoice)
    query('#check-answer').disabled = false
  }
  if (target.id === 'preview-width') {
    labWidth = Number(target.value)
    updatePreview()
  }
  if (target.id === 'restore-file') await restoreBackup(target)
}

function handleInput(event) {
  const target = event.target
  if (target.id === 'code-answer') {
    answer = target.value
    query('#check-answer').disabled = answer.trim() === ''
  }
  if (target.id === 'guide-search') {
    guideQuery = target.value
    query('#glossary-results').innerHTML = guideEntries()
  }
  if (target.id === 'css-editor') {
    labCss = target.value
    saveLabCss()
    clearTimeout(previewTimer)
    previewTimer = setTimeout(updatePreview, PREVIEW_DEBOUNCE_MS)
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' && event.target.id === 'code-answer') {
    event.preventDefault()
    check()
  }
}

save()
document.addEventListener('click', handleClick)
document.addEventListener('change', handleChange)
document.addEventListener('input', handleInput)
document.addEventListener('keydown', handleKeydown)
render()
