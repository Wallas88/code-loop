import { LESSONS, CHAPTERS } from './lessons.js'

export const STORAGE_KEY = 'siterevive-code-loop-v1'
export const SESSION_LENGTH = 6
const ids = new Set(LESSONS.map(lesson => lesson.id))
const chapterIds = new Set(CHAPTERS.map(chapter => chapter.id))
const number = (value, maximum = 1000000) => Number.isFinite(value) ? Math.min(maximum, Math.max(0, Math.floor(value))) : 0
export const freshProgress = () => ({ version:1, xp:0, round:0, sessions:0, stats:{}, history:[], labs:[], active:null })

export function parseProgress(raw) {
  if (!raw || typeof raw !== 'object' || raw.version !== 1 || !raw.stats || typeof raw.stats !== 'object') throw new Error('This is not a Code Loop version 1 backup.')
  const result = freshProgress()
  for (const key of ['xp','round','sessions']) result[key] = number(raw[key])
  for (const id of ids) {
    const item = raw.stats[id]
    if (!item || typeof item !== 'object') continue
    result.stats[id] = { seen:number(item.seen), independent:number(item.independent), box:number(item.box,4), dueRound:number(item.dueRound), dueAt:number(item.dueAt,9e15), lastRound:number(item.lastRound) }
  }
  result.labs = [...new Set(Array.isArray(raw.labs) ? raw.labs.filter(id => ['height','padding','mobile'].includes(id)) : [])]
  result.history = (Array.isArray(raw.history) ? raw.history : []).filter(item => item && ids.has(item.id)).slice(-40).map(item => ({id:item.id,clean:item.clean === true,round:number(item.round),xp:number(item.xp,12)}))
  const active = raw.active
  if (active && ids.has(active.lessonId) && (active.chapter === null || chapterIds.has(active.chapter)) && ['learn','review'].includes(active.mode)) {
    const results = (Array.isArray(active.results) ? active.results : []).filter(item => item && ids.has(item.id)).slice(0,SESSION_LENGTH).map(item => ({id:item.id,clean:item.clean === true,xp:number(item.xp,12)}))
    result.active = {chapter:active.chapter,mode:active.mode,lessonId:active.lessonId,results,missed:active.missed === true,hinted:active.hinted === true,revealed:active.revealed === true,done:results.length === SESSION_LENGTH}
  }
  return result
}

export function isDue(stat, round, now = Date.now()) {
  return !!stat?.seen && (stat.dueRound <= round || (stat.dueAt > 0 && stat.dueAt <= now))
}

export function chooseLesson(progress, { chapter = null, mode = 'learn', recent = [], now = Date.now() } = {}) {
  const pool = LESSONS.filter(lesson => chapter === null || lesson.chapter === chapter)
  if (!pool.length) return null
  const available = pool.filter(lesson => !recent.slice(-2).includes(lesson.id))
  const candidates = available.length ? available : pool
  const due = candidates.filter(lesson => isDue(progress.stats[lesson.id], progress.round, now))
    .sort((a,b) => progress.stats[a.id].box - progress.stats[b.id].box || progress.stats[a.id].lastRound - progress.stats[b.id].lastRound)
  if (due.length) return due[0]
  const unseen = candidates.find(lesson => !progress.stats[lesson.id]?.seen)
  if (mode === 'learn' && unseen) return unseen
  const seen = candidates.filter(lesson => progress.stats[lesson.id]?.seen)
    .sort((a,b) => progress.stats[a.id].box - progress.stats[b.id].box || progress.stats[a.id].lastRound - progress.stats[b.id].lastRound)
  return seen[0] || unseen || candidates[0]
}

export function recordAnswer(progress, id, { missed = false, hinted = false, revealed = false, now = Date.now() } = {}) {
  if (!ids.has(id)) throw new Error('Unknown lesson')
  const result = structuredClone(progress)
  const old = result.stats[id] || {seen:0,independent:0,box:0}
  const clean = !missed && !hinted && !revealed
  const box = clean ? Math.min(4,old.box + 1) : missed || revealed ? 0 : Math.min(1,old.box)
  const xp = clean ? 12 : missed || revealed ? 5 : 8
  result.round++
  result.xp += xp
  result.stats[id] = {seen:old.seen + 1,independent:old.independent + (clean ? 1 : 0),box,dueRound:result.round + [3,6,12,24,40][box],dueAt:box >= 2 ? now + [0,0,1,3,7][box] * 86400000 : 0,lastRound:result.round}
  result.history = [...result.history,{id,clean,round:result.round,xp}].slice(-40)
  return {progress:result,entry:{id,clean,xp}}
}

export function startSession(progress, chapter, mode = 'learn') {
  const lesson = chooseLesson(progress,{chapter,mode})
  if (!lesson) throw new Error('No lessons in this trail')
  return {...progress,active:{chapter,mode,lessonId:lesson.id,results:[],missed:false,hinted:false,revealed:false,done:false}}
}

export function completeRound(progress, now = Date.now()) {
  const session = progress.active
  if (!session || session.done) return progress
  const {progress:next,entry} = recordAnswer(progress,session.lessonId,{...session,now})
  const results = [...session.results,entry]
  const done = results.length >= SESSION_LENGTH
  const nextLesson = done ? session.lessonId : chooseLesson(next,{chapter:session.chapter,mode:session.mode,recent:results.map(item=>item.id),now}).id
  next.active = {...session,lessonId:nextLesson,results,done,missed:false,hinted:false,revealed:false}
  if (done) next.sessions++
  return next
}

export function summary(progress, now = Date.now()) {
  return {explored:LESSONS.filter(lesson=>progress.stats[lesson.id]?.seen).length,confident:LESSONS.filter(lesson=>(progress.stats[lesson.id]?.box || 0)>=3).length,due:LESSONS.filter(lesson=>isDue(progress.stats[lesson.id],progress.round,now)).length}
}

export function recommendedChapter(progress) {
  return CHAPTERS.find(chapter => LESSONS.some(lesson => lesson.chapter === chapter.id && !progress.stats[lesson.id]?.seen))?.id || CHAPTERS[0].id
}

export function checkAnswer(lesson, answer) {
  if (lesson.type === 'choice') return String(answer) === String(lesson.answer)
  const normalise = value => String(value).trim().replace(/\s+/g,' ')
  return lesson.answers.some(value => normalise(value) === normalise(answer))
}

export function shuffledChoices(lesson, round) {
  if (lesson.type !== 'choice') return []
  let seed = [...lesson.id].reduce((sum,char)=>sum+char.charCodeAt(0),round * 97 + 17)
  const choices = lesson.choices.map((label,index)=>({label,index}))
  for (let i=choices.length-1;i>0;i--) { seed=(seed * 9301+49297)%233280; const j=Math.floor(seed/233280*(i+1)); [choices[i],choices[j]]=[choices[j],choices[i]] }
  return choices
}
