import test from 'node:test'
import assert from 'node:assert/strict'
import { LESSONS, CHAPTERS } from '../src/lessons.js'
import { freshProgress, parseProgress, recordAnswer, chooseLesson, completeRound, startSession, summary, checkAnswer, shuffledChoices, isDue } from '../src/learning.js'
import { createServer } from '../server.mjs'

test('all 30 lessons have a valid answer and belong to a six-question trail',()=>{
  assert.equal(LESSONS.length,30)
  assert.equal(new Set(LESSONS.map(item=>item.id)).size,30)
  for(const chapter of CHAPTERS)assert.equal(LESSONS.filter(item=>item.chapter===chapter.id).length,6)
  for(const lesson of LESSONS){
    assert.ok(lesson.teach && lesson.why && lesson.hint)
    if(lesson.type==='choice'){
      assert.equal(lesson.choices.length,3)
      lesson.choices.forEach((_,index)=>assert.equal(checkAnswer(lesson,index),index===lesson.answer))
      for(let round=0;round<15;round++)assert.deepEqual(shuffledChoices(lesson,round).map(item=>item.index).sort(),[0,1,2])
    }else{
      lesson.answers.forEach(answer=>assert.equal(checkAnswer(lesson,' '+answer+' '),true))
      assert.equal(checkAnswer(lesson,''),false)
      assert.equal(checkAnswer(lesson,'not the answer'),false)
    }
  }
})

test('a new learner gets the first map lesson',()=>assert.equal(chooseLesson(freshProgress(),{chapter:'files'}).id,'files-prices'))
test('mistakes return after intervening rounds, ahead of unseen lessons',()=>{
  let p=recordAnswer(freshProgress(),'files-prices',{missed:true,now:1}).progress
  assert.equal(p.stats['files-prices'].box,0)
  assert.equal(p.xp,5)
  for(const id of ['files-styles','files-behaviour','files-assets'])p=recordAnswer(p,id,{now:1}).progress
  assert.equal(chooseLesson(p,{chapter:'files',recent:['files-styles','files-behaviour','files-assets'],now:1}).id,'files-prices')
})
test('hints and revealed solutions do not count as independent mastery',()=>{
  let p=recordAnswer(freshProgress(),'files-prices',{hinted:true,now:1}).progress
  assert.equal(p.stats['files-prices'].independent,0)
  assert.equal(p.stats['files-prices'].box,0)
  p=recordAnswer(p,'files-prices',{revealed:true,now:1}).progress
  assert.equal(p.stats['files-prices'].box,0)
  assert.equal(summary(p).confident,0)
})
test('clean answers build confidence and schedule both round and calendar reviews',()=>{
  let p=freshProgress()
  for(let n=0;n<3;n++)p=recordAnswer(p,'files-prices',{now:100}).progress
  assert.equal(summary(p,100).confident,1)
  assert.equal(p.xp,36)
  assert.equal(isDue(p.stats['files-prices'],p.round,100),false)
  assert.equal(isDue(p.stats['files-prices'],p.round,100+3*86400000),true)
})
test('a six-round session completes once and resumes from a valid backup',()=>{
  let p=startSession(freshProgress(),'files')
  for(let i=0;i<6;i++)p=completeRound(p,1)
  assert.equal(p.active.done,true)
  assert.equal(p.sessions,1)
  assert.equal(p.active.results.length,6)
  assert.equal(p.round,6)
  assert.deepEqual(completeRound(p),p)
  assert.deepEqual(parseProgress(JSON.parse(JSON.stringify(p))),p)
})
test('backup validation rejects incompatible files and ignores unknown keys',()=>{
  assert.throws(()=>parseProgress({version:2,stats:{}}))
  assert.throws(()=>parseProgress({hello:'world'}))
  const result=parseProgress({version:1,xp:-20,stats:{unknown:{seen:999}},labs:['height','height','unknown'],active:{lessonId:'unknown'},history:[]})
  assert.equal(result.xp,0)
  assert.deepEqual(result.stats,{})
  assert.deepEqual(result.labs,['height'])
  assert.equal(result.active,null)
})
test('local server serves the app but not server source or parent files',async()=>{
  const server=createServer()
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  try{
    const base='http://127.0.0.1:'+server.address().port
    const home=await fetch(base)
    assert.equal(home.status,200)
    assert.match(await home.text(),/Code Loop/)
    assert.match(home.headers.get('content-security-policy'),/connect-src 'none'/)
    for(const file of ['/server.mjs','/package.json','/src/%2e%2e%2fserver.mjs','/%2e%2e%2fREADME.md'])assert.equal((await fetch(base+file)).status,404)
    assert.equal((await fetch(base,{method:'POST'})).status,405)
    assert.match((await fetch(base+'/src/app.js')).headers.get('content-type'),/javascript/)
  }finally{await new Promise(resolve=>server.close(resolve))}
})
