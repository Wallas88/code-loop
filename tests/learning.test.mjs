/*
 * learning.test.mjs — proves the learning rules with made-up progress: lesson
 * data is complete, the next lesson is chosen the way the rules say, answers
 * move the schedule correctly, backups round-trip and bad ones are refused,
 * and the local server serves the app and nothing else. Run with `npm test`.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { LESSONS, CHAPTERS } from '../src/lessons.js'
import { freshProgress, parseProgress, recordAnswer, chooseLesson, completeRound, startSession, summary, checkAnswer, shuffledChoices, isDue, SESSION_LENGTH } from '../src/learning.js'
import { createServer } from '../server.mjs'

const LESSON_COUNT = 30
const LESSONS_PER_TRAIL = 6
const CHOICES_PER_LESSON = 3
const SHUFFLE_ROUNDS_CHECKED = 15
const CLEAN_ANSWERS_FOR_CONFIDENCE = 3
const XP_MISSED = 5
const XP_CLEAN = 12
const DAY_MS = 86400000
const FIRST_MAP_LESSON = 'files-prices'
const BLOCKED_PATHS = ['/server.mjs', '/package.json', '/src/%2e%2e%2fserver.mjs', '/%2e%2e%2fREADME.md']

function idOf(item) {
  return item.id
}

function indexOf(item) {
  return item.index
}

function lessonsInChapter(chapter) {
  return LESSONS.filter(inChapter)

  function inChapter(lesson) {
    return lesson.chapter === chapter.id
  }
}

test('all 30 lessons have a valid answer and belong to a six-question trail', checkLessonData)

function checkLessonData() {
  assert.equal(LESSONS.length, LESSON_COUNT)
  assert.equal(new Set(LESSONS.map(idOf)).size, LESSON_COUNT)
  for (const chapter of CHAPTERS) assert.equal(lessonsInChapter(chapter).length, LESSONS_PER_TRAIL)
  for (const lesson of LESSONS) {
    assert.ok(lesson.teach !== '' && lesson.why !== '' && lesson.hint !== '')
    if (lesson.type === 'choice') {
      assert.equal(lesson.choices.length, CHOICES_PER_LESSON)
      for (let index = 0; index < lesson.choices.length; index++) assert.equal(checkAnswer(lesson, index), index === lesson.answer)
      for (let round = 0; round < SHUFFLE_ROUNDS_CHECKED; round++) assert.deepEqual(shuffledChoices(lesson, round).map(indexOf).sort(), [0, 1, 2])
    } else {
      for (const answer of lesson.answers) assert.equal(checkAnswer(lesson, ' ' + answer + ' '), true)
      assert.equal(checkAnswer(lesson, ''), false)
      assert.equal(checkAnswer(lesson, 'not the answer'), false)
    }
  }
}

test('a new learner gets the first map lesson', checkFirstLesson)

function checkFirstLesson() {
  assert.equal(chooseLesson(freshProgress(), { chapter: 'files' }).id, FIRST_MAP_LESSON)
}

test('mistakes return after intervening rounds, ahead of unseen lessons', checkMistakesReturn)

function checkMistakesReturn() {
  let progress = recordAnswer(freshProgress(), FIRST_MAP_LESSON, { missed: true, now: 1 }).progress
  assert.equal(progress.stats[FIRST_MAP_LESSON].box, 0)
  assert.equal(progress.xp, XP_MISSED)
  const others = ['files-styles', 'files-behaviour', 'files-assets']
  for (const id of others) progress = recordAnswer(progress, id, { now: 1 }).progress
  assert.equal(chooseLesson(progress, { chapter: 'files', recent: others, now: 1 }).id, FIRST_MAP_LESSON)
}

test('hints and revealed solutions do not count as independent mastery', checkAssistedAnswers)

function checkAssistedAnswers() {
  let progress = recordAnswer(freshProgress(), FIRST_MAP_LESSON, { hinted: true, now: 1 }).progress
  assert.equal(progress.stats[FIRST_MAP_LESSON].independent, 0)
  assert.equal(progress.stats[FIRST_MAP_LESSON].box, 0)
  progress = recordAnswer(progress, FIRST_MAP_LESSON, { revealed: true, now: 1 }).progress
  assert.equal(progress.stats[FIRST_MAP_LESSON].box, 0)
  assert.equal(summary(progress).confident, 0)
}

test('clean answers build confidence and schedule both round and calendar reviews', checkCleanAnswers)

function checkCleanAnswers() {
  const now = 100
  let progress = freshProgress()
  for (let n = 0; n < CLEAN_ANSWERS_FOR_CONFIDENCE; n++) progress = recordAnswer(progress, FIRST_MAP_LESSON, { now }).progress
  assert.equal(summary(progress, now).confident, 1)
  assert.equal(progress.xp, XP_CLEAN * CLEAN_ANSWERS_FOR_CONFIDENCE)
  assert.equal(isDue(progress.stats[FIRST_MAP_LESSON], progress.round, now), false)
  assert.equal(isDue(progress.stats[FIRST_MAP_LESSON], progress.round, now + 3 * DAY_MS), true)
}

test('a six-round session completes once and resumes from a valid backup', checkSessionRoundTrip)

function checkSessionRoundTrip() {
  let progress = startSession(freshProgress(), 'files')
  for (let i = 0; i < SESSION_LENGTH; i++) progress = completeRound(progress, 1)
  assert.equal(progress.active.done, true)
  assert.equal(progress.sessions, 1)
  assert.equal(progress.active.results.length, SESSION_LENGTH)
  assert.equal(progress.round, SESSION_LENGTH)
  assert.deepEqual(completeRound(progress), progress)
  assert.deepEqual(parseProgress(JSON.parse(JSON.stringify(progress))), progress)
}

test('backup validation rejects incompatible files and ignores unknown keys', checkBackupValidation)

function checkBackupValidation() {

  function parseWrongVersion() {
    parseProgress({ version: 2, stats: {} })
  }

  function parseNotABackup() {
    parseProgress({ hello: 'world' })
  }

  assert.throws(parseWrongVersion)
  assert.throws(parseNotABackup)
  const result = parseProgress({ version: 1, xp: -20, stats: { unknown: { seen: 999 } }, labs: ['height', 'height', 'unknown'], active: { lessonId: 'unknown' }, history: [] })
  assert.equal(result.xp, 0)
  assert.deepEqual(result.stats, {})
  assert.deepEqual(result.labs, ['height'])
  assert.equal(result.active, null)
}

test('local server serves the app but not server source or parent files', checkLocalServer)

async function checkLocalServer() {
  const server = createServer()

  function listenOnFreePort(resolve) {
    server.listen(0, '127.0.0.1', resolve)
  }

  function closeServer(resolve) {
    server.close(resolve)
  }

  await new Promise(listenOnFreePort)
  try {
    const base = 'http://127.0.0.1:' + server.address().port
    const home = await fetch(base)
    assert.equal(home.status, 200)
    assert.match(await home.text(), /Code Loop/)
    assert.match(home.headers.get('content-security-policy'), /connect-src 'none'/)
    for (const file of BLOCKED_PATHS) assert.equal((await fetch(base + file)).status, 404)
    assert.equal((await fetch(base, { method: 'POST' })).status, 405)
    assert.match((await fetch(base + '/src/app.js')).headers.get('content-type'), /javascript/)
  } finally {
    await new Promise(closeServer)
  }
}
