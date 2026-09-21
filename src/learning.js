/*
 * learning.js — the decision logic behind a practice loop: what a learner's
 * progress looks like, which lesson comes next, how an answer changes the
 * spaced-repetition schedule, and how a backup is validated. Pure functions,
 * no DOM, so tests/learning.test.mjs can prove every rule with made-up data.
 */
import { LESSONS, CHAPTERS } from './lessons.js'

export const STORAGE_KEY = 'siterevive-code-loop-v1'
export const SESSION_LENGTH = 6
export const PROGRESS_VERSION = 1

const LESSON_IDS = new Set(LESSONS.map(idOf))
const CHAPTER_IDS = new Set(CHAPTERS.map(idOf))
const LAB_IDS = ['height', 'padding', 'mobile']
const MODES = ['learn', 'review']

const MAX_COUNTER = 1000000
const MAX_BOX = 4
const MAX_DUE_AT = 9e15
const MAX_XP_PER_ROUND = 12
const HISTORY_LENGTH = 40
const RECENT_WINDOW = 2

// A clean answer moves the lesson up one box; each box waits longer before
// the lesson is due again, in rounds and (from box 2) in calendar days.
const XP_CLEAN = 12
const XP_ASSISTED = 8
const XP_MISSED = 5
const ROUNDS_UNTIL_DUE = [3, 6, 12, 24, 40]
const DAYS_UNTIL_DUE = [0, 0, 1, 3, 7]
const CALENDAR_REVIEW_BOX = 2
const CONFIDENT_BOX = 3
const DAY_MS = 86400000

// Deterministic shuffle so a lesson's choices sit in the same order for the
// same round, but move between rounds. Plain linear congruential generator.
const SEED_MULTIPLIER = 9301
const SEED_INCREMENT = 49297
const SEED_MODULUS = 233280
const ROUND_SEED_STEP = 97
const SEED_OFFSET = 17

function idOf(item) {
  return item.id
}

function clampCounter(value, maximum = MAX_COUNTER) {
  if (!Number.isFinite(value)) return 0
  return Math.min(maximum, Math.max(0, Math.floor(value)))
}

export function freshProgress() {
  return { version: PROGRESS_VERSION, xp: 0, round: 0, sessions: 0, stats: {}, history: [], labs: [], active: null }
}

function isLabId(id) {
  return LAB_IDS.includes(id)
}

function isKnownLessonEntry(item) {
  return item != null && LESSON_IDS.has(item.id)
}

function toHistoryEntry(item) {
  return { id: item.id, clean: item.clean === true, round: clampCounter(item.round), xp: clampCounter(item.xp, MAX_XP_PER_ROUND) }
}

function toResultEntry(item) {
  return { id: item.id, clean: item.clean === true, xp: clampCounter(item.xp, MAX_XP_PER_ROUND) }
}

export function parseProgress(raw) {
  const isObject = raw != null && typeof raw === 'object'
  const hasStats = isObject && raw.stats != null && typeof raw.stats === 'object'
  if (!isObject || raw.version !== PROGRESS_VERSION || !hasStats) throw new Error('This is not a Code Loop version 1 backup.')
  const result = freshProgress()
  for (const key of ['xp', 'round', 'sessions']) result[key] = clampCounter(raw[key])
  for (const id of LESSON_IDS) {
    const item = raw.stats[id]
    if (item == null || typeof item !== 'object') continue
    result.stats[id] = {
      seen: clampCounter(item.seen),
      independent: clampCounter(item.independent),
      box: clampCounter(item.box, MAX_BOX),
      dueRound: clampCounter(item.dueRound),
      dueAt: clampCounter(item.dueAt, MAX_DUE_AT),
      lastRound: clampCounter(item.lastRound),
    }
  }
  const labs = Array.isArray(raw.labs) ? raw.labs.filter(isLabId) : []
  result.labs = [...new Set(labs)]
  const history = Array.isArray(raw.history) ? raw.history : []
  result.history = history.filter(isKnownLessonEntry).slice(-HISTORY_LENGTH).map(toHistoryEntry)
  const active = raw.active
  const activeIsValid = active != null
    && LESSON_IDS.has(active.lessonId)
    && (active.chapter === null || CHAPTER_IDS.has(active.chapter))
    && MODES.includes(active.mode)
  if (activeIsValid) {
    const rawResults = Array.isArray(active.results) ? active.results : []
    const results = rawResults.filter(isKnownLessonEntry).slice(0, SESSION_LENGTH).map(toResultEntry)
    result.active = {
      chapter: active.chapter,
      mode: active.mode,
      lessonId: active.lessonId,
      results,
      missed: active.missed === true,
      hinted: active.hinted === true,
      revealed: active.revealed === true,
      done: results.length === SESSION_LENGTH,
    }
  }
  return result
}

export function isDue(stat, round, now = Date.now()) {
  const seen = stat != null && stat.seen > 0
  if (!seen) return false
  return stat.dueRound <= round || (stat.dueAt > 0 && stat.dueAt <= now)
}

export function chooseLesson(progress, { chapter = null, mode = 'learn', recent = [], now = Date.now() } = {}) {
  const lastFew = recent.slice(-RECENT_WINDOW)

  function inChapter(lesson) {
    return chapter === null || lesson.chapter === chapter
  }

  function notJustSeen(lesson) {
    return !lastFew.includes(lesson.id)
  }

  function dueNow(lesson) {
    return isDue(progress.stats[lesson.id], progress.round, now)
  }

  function seenBefore(lesson) {
    const stat = progress.stats[lesson.id]
    return stat != null && stat.seen > 0
  }

  function notSeenBefore(lesson) {
    return !seenBefore(lesson)
  }

  // Lowest box first (weakest knowledge), then the one waiting longest.
  function byBoxThenAge(a, b) {
    const statA = progress.stats[a.id]
    const statB = progress.stats[b.id]
    return statA.box - statB.box || statA.lastRound - statB.lastRound
  }

  const pool = LESSONS.filter(inChapter)
  if (pool.length === 0) return null
  const available = pool.filter(notJustSeen)
  const candidates = available.length > 0 ? available : pool
  const due = candidates.filter(dueNow).sort(byBoxThenAge)
  if (due.length > 0) return due[0]
  const unseen = candidates.find(notSeenBefore)
  if (mode === 'learn' && unseen != null) return unseen
  const seen = candidates.filter(seenBefore).sort(byBoxThenAge)
  return seen[0] ?? unseen ?? candidates[0]
}

export function recordAnswer(progress, id, { missed = false, hinted = false, revealed = false, now = Date.now() } = {}) {
  if (!LESSON_IDS.has(id)) throw new Error('Unknown lesson')
  const result = structuredClone(progress)
  const old = result.stats[id] ?? { seen: 0, independent: 0, box: 0 }
  const clean = !missed && !hinted && !revealed
  const setBack = missed || revealed
  const box = clean ? Math.min(MAX_BOX, old.box + 1) : setBack ? 0 : Math.min(1, old.box)
  const xp = clean ? XP_CLEAN : setBack ? XP_MISSED : XP_ASSISTED
  result.round++
  result.xp += xp
  result.stats[id] = {
    seen: old.seen + 1,
    independent: old.independent + (clean ? 1 : 0),
    box,
    dueRound: result.round + ROUNDS_UNTIL_DUE[box],
    dueAt: box >= CALENDAR_REVIEW_BOX ? now + DAYS_UNTIL_DUE[box] * DAY_MS : 0,
    lastRound: result.round,
  }
  result.history = [...result.history, { id, clean, round: result.round, xp }].slice(-HISTORY_LENGTH)
  return { progress: result, entry: { id, clean, xp } }
}

export function startSession(progress, chapter, mode = 'learn') {
  const lesson = chooseLesson(progress, { chapter, mode })
  if (lesson == null) throw new Error('No lessons in this trail')
  const active = { chapter, mode, lessonId: lesson.id, results: [], missed: false, hinted: false, revealed: false, done: false }
  return { ...progress, active }
}

export function completeRound(progress, now = Date.now()) {
  const session = progress.active
  if (session == null || session.done) return progress
  const { progress: next, entry } = recordAnswer(progress, session.lessonId, { ...session, now })
  const results = [...session.results, entry]
  const done = results.length >= SESSION_LENGTH
  const recent = results.map(idOf)
  const nextLesson = done ? session.lessonId : chooseLesson(next, { chapter: session.chapter, mode: session.mode, recent, now }).id
  next.active = { ...session, lessonId: nextLesson, results, done, missed: false, hinted: false, revealed: false }
  if (done) next.sessions++
  return next
}

export function summary(progress, now = Date.now()) {

  function explored(lesson) {
    const stat = progress.stats[lesson.id]
    return stat != null && stat.seen > 0
  }

  function confident(lesson) {
    const stat = progress.stats[lesson.id]
    return stat != null && stat.box >= CONFIDENT_BOX
  }

  function due(lesson) {
    return isDue(progress.stats[lesson.id], progress.round, now)
  }

  return { explored: LESSONS.filter(explored).length, confident: LESSONS.filter(confident).length, due: LESSONS.filter(due).length }
}

export function recommendedChapter(progress) {

  function unseenLessonIn(chapter) {

    function isUnseenHere(lesson) {
      const stat = progress.stats[lesson.id]
      return lesson.chapter === chapter.id && (stat == null || !(stat.seen > 0))
    }

    return LESSONS.some(isUnseenHere)
  }

  const chapter = CHAPTERS.find(unseenLessonIn)
  return chapter != null ? chapter.id : CHAPTERS[0].id
}

function normaliseAnswer(value) {
  return String(value).trim().replace(/\s+/g, ' ')
}

export function checkAnswer(lesson, answer) {
  if (lesson.type === 'choice') return String(answer) === String(lesson.answer)
  const wanted = normaliseAnswer(answer)

  function matches(value) {
    return normaliseAnswer(value) === wanted
  }

  return lesson.answers.some(matches)
}

export function shuffledChoices(lesson, round) {
  if (lesson.type !== 'choice') return []

  function addCharCode(sum, char) {
    return sum + char.charCodeAt(0)
  }

  function toChoice(label, index) {
    return { label, index }
  }

  let seed = [...lesson.id].reduce(addCharCode, round * ROUND_SEED_STEP + SEED_OFFSET)
  const choices = lesson.choices.map(toChoice)
  for (let i = choices.length - 1; i > 0; i--) {
    seed = (seed * SEED_MULTIPLIER + SEED_INCREMENT) % SEED_MODULUS
    const j = Math.floor(seed / SEED_MODULUS * (i + 1))
    const swapped = choices[i]
    choices[i] = choices[j]
    choices[j] = swapped
  }
  return choices
}
