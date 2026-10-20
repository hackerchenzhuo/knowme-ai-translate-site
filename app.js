'use strict';

// Locale copy
const english=document.documentElement.lang==='en';
const dictionary={"递归自我改进 · Agent Harness":"Recursive self-improvement · Agent harnesses","标题与摘要中的 RSI 和 harness":"RSI and harness in the title and abstract","选择研究方向":"Choose your interests","定方向":"Interests","滑动选读":"Browse","展开依据":"Evidence","暂停":"Pause","播放":"Play","暂停演示":"Pause tour","播放演示":"Play tour","训练数据选择 · 推理后训练":"Training-data selection · Reasoning post-training","标题中的 Data Selection":"Data Selection in the title","Agent 技能与工具":"Agent skills and tools","题名中的 Create, Evaluate, and Connect AI Skills":"Create, Evaluate, and Connect AI Skills in the title","推理后训练":"Reasoning post-training","选择关注方向":"Choose your interests","滑动浏览选读清单":"Scroll through the reading list","展开 RRSI 的研究线索":"Inspect the evidence behind RRSI","读摘要":"Excerpt","对照阅读":"Compare","沿用译法":"Your terms","从 RRSI 摘要开始":"Start with the RRSI abstract","原文与译文同步滑动":"Scroll the original and translation together","选择并记住个人译法":"Choose and remember a personal term","向下滑动选读":"Scroll to browse","选中论文摘要":"Select the abstract","滑动对照阅读":"Scroll and compare","选择个人译法":"Choose your preferred term","CHROME 商店案例":"CHROME STORE EXAMPLE","公开论文示例":"PUBLIC PAPER EXAMPLE","自动演示 · ":"Auto tour · ","手动探索 · ":"Explore · ","查看研究线索":"Explore the evidence","RRSI 围绕冻结的基础模型，迭代改进提示词、控制流程、工具、记忆与上下文管理。题名与摘要支持方向判断；作者与机构信息应分别核对来源。":"RRSI iteratively refines prompts, control flow, tools, memory and context around a frozen model. Its title and abstract support the topic match; author and affiliation sources require separate checks.","保存译法":"Save term","按领域与语境，沿用个人译法。":"Keep your terminology consistent with the domain and context.","保存这个译法":"Save this term","RRSI 公开案例 · 本页为预置演示，不发起检索或模型请求。":"Public RRSI example · A prewritten tour, with no search or model requests.","RRSI 摘要与预置译文 · 译法调整仅用于本页，不调用模型。":"RRSI excerpt and prewritten translation · Term changes apply only to this page. No model calls.","探讨推理模型后训练中的数据选择。":"Data selection for reasoning-model post-training.","在冻结基础模型的前提下，迭代改进提示词、控制流程、工具、记忆与上下文管理。":"Iterative improvements to prompts, control flow, tools, memory and context around a frozen model.","围绕 AI 技能的创建、评估与连接，展示 Agent 方向的研究线索。":"Creating, evaluating and connecting AI skills: an example from the Agent topic.","依据来自题名中的 Data Selection 与 Reasoning Model Post-Training。作者、摘要与机构信息，请结合原论文及插件中的来源记录核对。":"The title connects Data Selection with Reasoning Model Post-Training. Check author, abstract and affiliation details against the original paper and the extension’s source records.","题名中的 Create, Evaluate, and Connect AI Skills 对应 Agent 技能方向。这里只展示专题筛选示例；完整信息以原论文为准。":"Create, Evaluate, and Connect AI Skills in the title supports the Agent skills topic. This illustrates topic filtering; consult the original paper for full details.","查看 RRSI":"Explore RRSI","本页已保存 ":"Saved in this demo "};
const t=value=>english?(dictionary[value]??value):value;

// Public, prewritten product examples. This tour makes no scholarly or model requests.
const papers = [
  {id:'2610.20057',date:'2026.10.14',title:'Beyond Correctness: Compute-Responsive Data Selection for Reasoning Model Post-Training',short:'Beyond Correctness',authors:'Liang He, Xiangyu Li, …, Xilu Wang',topics:['data','reasoning'],tags:['Data Synthesis','推理后训练'],summary:'探讨推理模型后训练中的数据选择。',topic:'训练数据选择 · 推理后训练',phrase:'标题中的 Data Selection',detail:'依据来自题名中的 Data Selection 与 Reasoning Model Post-Training。作者、摘要与机构信息，请结合原论文及插件中的来源记录核对。'},
  {id:'2609.24972',date:'2026.09.23 · v2',title:'RRSI: Regularized Recursive Self-Improvement of Agent Harnesses',short:'RRSI',authors:'Peng Xia, Ruijun Han, …, Huaxiu Yao, Chen-Yu Lee',topics:['reasoning','agent'],tags:['RSI','Agent Harness'],summary:'在冻结基础模型的前提下，迭代改进提示词、控制流程、工具、记忆与上下文管理。',topic:'递归自我改进 · Agent Harness',phrase:'标题与摘要中的 RSI 和 harness',detail:'RRSI 围绕冻结的基础模型，迭代改进提示词、控制流程、工具、记忆与上下文管理。题名与摘要支持方向判断；作者与机构信息应分别核对来源。'},
  {id:'2603.04448',date:'2026.03',title:'SkillNet: Create, Evaluate, and Connect AI Skills',short:'SkillNet',authors:'Y. Liang, R. Zhong, H. Xu, …',topics:['agent'],tags:['Agent','AI Skills'],summary:'围绕 AI 技能的创建、评估与连接，展示 Agent 方向的研究线索。',topic:'Agent 技能与工具',phrase:'题名中的 Create, Evaluate, and Connect AI Skills',detail:'题名中的 Create, Evaluate, and Connect AI Skills 对应 Agent 技能方向。这里只展示专题筛选示例；完整信息以原论文为准。'},
];
const root=document.querySelector('#experience');
const tabs=[...document.querySelectorAll('.product-tab')];
const stageButtons=[...document.querySelectorAll('.stage-controls button')];
const topicButtons=[...document.querySelectorAll('.topic-chip')];
const list=document.querySelector('#paper-list');
const empty=document.querySelector('#empty-papers');
const evidence=document.querySelector('.evidence-panel');
const proof=document.querySelector('.demo-proof');
const sourceScroll=document.querySelector('.source-scroll');
const translationScroll=document.querySelector('.translation-scroll');
const cursor=document.querySelector('.tour-cursor');
const playButton=document.querySelector('#play-demo');
const termChoice=document.querySelector('#term-choice');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const durations=[2700,5400,5900];
const labels={radar:['定方向','滑动选读','展开依据'],translate:['读摘要','对照阅读','沿用译法']};
const captions={radar:['选择关注方向','滑动浏览选读清单','展开 RRSI 的研究线索'],translate:['从 RRSI 摘要开始','原文与译文同步滑动','选择并记住个人译法']};
const state={mode:'radar',stage:0,playing:!motion.matches,visible:true,topics:new Set(['data','reasoning']),selected:'2609.24972',term:'执行框架',remembered:false};
let frame=null,lastTime=0,elapsed=0,renderedKey='',automaticToggle=false,lastMode='';
let cursorFrom={x:40,y:140},cursorTo={x:40,y:140},cursorPosition={x:40,y:140},cursorMovedAt=0;

function text(tag,content,className){const el=document.createElement(tag);el.textContent=t(content);if(className)el.className=className;return el;}
function ease(t){const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);}
function matchingPapers(){return papers.filter(p=>p.topics.some(t=>state.topics.has(t)));}
function active(){return state.playing&&state.visible&&!document.hidden;}
function setProof(open){if(proof.open===open)return;automaticToggle=true;proof.open=open;}
function scrollToFraction(el,value){el.scrollTop=Math.max(0,el.scrollHeight-el.clientHeight)*value;}
function pointAt(el,label){
  if(!el||el.hidden||!el.getClientRects().length){cursor.removeAttribute('data-target');return;}
  const r=root.getBoundingClientRect(),b=el.getBoundingClientRect();
  cursorFrom={...cursorPosition};cursorTo={x:Math.max(12,Math.min(root.clientWidth-148,b.left-r.left+b.width*.68)),y:Math.max(90,Math.min(root.clientHeight-100,b.top-r.top+Math.min(b.height*.6,30)))};
  cursorMovedAt=performance.now();cursor.dataset.target=label;cursor.querySelector('span').textContent=t(label);
}
function renderEvidence(){
  const paper=papers.find(p=>p.id===state.selected);if(!paper)return;
  for(const [id,key] of [['evidence-title','short'],['evidence-topic','topic'],['evidence-phrase','phrase'],['evidence-detail','detail']])document.getElementById(id).textContent=t(paper[key]);
  document.querySelector('#paper-source').href='https://arxiv.org/abs/'+paper.id;
}
function renderPapers(){
  const results=matchingPapers(),key=results.map(p=>p.id).join('|');
  if(!results.some(p=>p.id===state.selected))state.selected=results[0]?.id??'';
  if(key!==renderedKey){
    list.replaceChildren();
    for(const paper of results){
      const row=document.createElement('button');row.type='button';row.className='paper-item';row.dataset.paper=paper.id;row.setAttribute('aria-label',english?'Inspect '+paper.short+' evidence':'查看 '+paper.short+' 的示例依据');
      const meta=text('div','','paper-meta');meta.append(text('span','arXiv:'+paper.id),text('span',paper.date));
      const tags=text('div','','paper-tags');paper.tags.forEach(tag=>tags.append(text('span',tag)));
      const footer=text('div','','paper-row-footer');footer.append(text('span',paper.short==='RRSI'?'CHROME 商店案例':'公开论文示例'),text('span','↗'));
      row.append(meta,text('h3',paper.title),text('p',paper.authors,'paper-authors'),text('p',paper.summary,'paper-summary'),tags,footer);list.append(row);
    }
    list.scrollTop=0;renderedKey=key;
  }
  for(const row of list.children)row.setAttribute('aria-pressed',String(row.dataset.paper===state.selected));
  list.hidden=!results.length;empty.hidden=!!results.length;evidence.hidden=!results.length;
  document.querySelector('#paper-count').textContent=String(results.length).padStart(2,'0')+(english?' public example'+(results.length===1?'':'s'):' 篇公开示例');
  topicButtons.forEach(button=>button.setAttribute('aria-pressed',String(state.topics.has(button.dataset.topic))));
  renderEvidence();
}
function renderTerm(){
  document.querySelectorAll('[data-term]').forEach(el=>el.textContent=state.term);termChoice.value=state.term;root.dataset.remembered=String(state.remembered);
  document.querySelector('#memory-status').textContent=state.remembered?(english?'Saved in this demo: harness → '+state.term+'. Replay resets it.':'本页已保存：harness → '+state.term+'。重播可重置。'):t('按领域与语境，沿用个人译法。');
  document.querySelector('#remember-term').firstChild.textContent=t(state.remembered?'本页已保存 ':'保存译法')+' ';
}
function updatePlayback(){
  const running=active();root.classList.toggle('is-playing',running);
  playButton.querySelector('span').textContent=t(state.playing?'暂停':'播放');playButton.setAttribute('aria-label',t(state.playing?'暂停演示':'播放演示'));
  playButton.querySelector('path').setAttribute('d',state.playing?'M7 5v10M13 5v10':'M6 4l9 6-9 6z');
  document.querySelector('#tour-caption').textContent=t(state.playing?'自动演示 · ':'手动探索 · ')+t(captions[state.mode][state.stage]);
  cancelAnimationFrame(frame);frame=null;lastTime=0;if(running)frame=requestAnimationFrame(tick);
}
function render(){
  root.dataset.mode=state.mode;root.dataset.stage=String(state.stage);
  document.querySelector('#radar-demo').hidden=state.mode!=='radar';document.querySelector('#translate-demo').hidden=state.mode!=='translate';
  tabs.forEach(tab=>{const selected=tab.dataset.mode===state.mode;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  stageButtons.forEach((button,index)=>{button.setAttribute('aria-pressed',String(index===state.stage));button.querySelector('.stage-name').textContent=t(labels[state.mode][index]);});
  document.querySelector('#radar-status').textContent=String(state.stage+1).padStart(2,'0')+' · '+t(captions.radar[state.stage]);
  document.querySelector('#tour-position').textContent=String(state.stage+1).padStart(2,'0')+' / 03';
  document.querySelector('#demo-disclaimer').textContent=t(state.mode==='radar'?'RRSI 公开案例 · 本页为预置演示，不发起检索或模型请求。':'RRSI 摘要与预置译文 · 译法调整仅用于本页，不调用模型。');
  renderPapers();renderTerm();
  if(lastMode&&lastMode!==state.mode&&!motion.matches){document.querySelector('#'+state.mode+'-demo').animate([{opacity:.3,transform:'translateX(16px)'},{opacity:1,transform:'translateX(0)'}],{duration:300,easing:'ease-out'});}
  lastMode=state.mode;updatePlayback();
}
function startStage(stage,manual=false){
  state.stage=stage;elapsed=0;if(manual)state.playing=false;
  if(state.mode==='radar'){
    if(stage===0){setProof(false);list.scrollTop=0;evidence.scrollTop=0;}
    if(stage===2){const rrsi=matchingPapers().find(p=>p.short==='RRSI');if(rrsi)state.selected=rrsi.id;setProof(true);}
  }else if(stage===0){state.term='执行框架';state.remembered=false;sourceScroll.scrollTop=0;translationScroll.scrollTop=0;}
  render();
  root.style.setProperty('--tour-progress',String(durations.slice(0,stage).reduce((a,b)=>a+b,0)/durations.reduce((a,b)=>a+b,0)));
  if(manual){if(stage===1){if(state.mode==='radar')scrollToFraction(list,1);else{scrollToFraction(sourceScroll,1);scrollToFraction(translationScroll,1);}}if(stage===2&&state.mode==='radar')evidence.scrollTop=evidence.scrollHeight;}
  targetForStage();
}
function targetForStage(){
  if(state.mode==='radar'){
    pointAt(state.stage===0?topicButtons[1]:state.stage===1?list:proof.querySelector('summary'),state.stage===0?'选择研究方向':state.stage===1?'向下滑动选读':'查看研究线索');
  }else pointAt(state.stage===0?sourceScroll:state.stage===1?translationScroll:document.querySelector('#term-choice'),state.stage===0?'选中论文摘要':state.stage===1?'滑动对照阅读':'选择个人译法');
}
function animateStage(){
  if(motion.matches)return;
  if(state.mode==='radar'){
    if(state.stage===1){scrollToFraction(list,ease((elapsed-350)/3150));if(elapsed>3500&&cursor.dataset.target!=='查看 RRSI'){const row=[...list.children].find(el=>el.dataset.paper==='2609.24972')||list.lastElementChild;pointAt(row,'查看 RRSI');}}
    if(state.stage===2)scrollToFraction(evidence,ease((elapsed-900)/1450));
  }else{
    if(state.stage===1){const progress=ease((elapsed-350)/3550);scrollToFraction(sourceScroll,progress);scrollToFraction(translationScroll,progress);}
    if(state.stage===2&&elapsed>1750&&state.term!=='运行框架'){state.term='运行框架';renderTerm();}
    if(state.stage===2&&elapsed>3350&&!state.remembered){state.remembered=true;renderTerm();pointAt(document.querySelector('#remember-term'),'保存这个译法');}
  }
}
function tick(now){
  if(!active()){frame=null;return;}
  if(lastTime)elapsed+=Math.min(now-lastTime,80);lastTime=now;
  if(elapsed>=durations[state.stage]){startStage((state.stage+1)%3);return;}
  animateStage();
  const total=durations.reduce((a,b)=>a+b,0),done=durations.slice(0,state.stage).reduce((a,b)=>a+b,0)+elapsed;
  root.style.setProperty('--tour-progress',String(done/total));
  const p=ease((now-cursorMovedAt)/720);cursorPosition={x:cursorFrom.x+(cursorTo.x-cursorFrom.x)*p,y:cursorFrom.y+(cursorTo.y-cursorFrom.y)*p};
  cursor.style.transform='translate3d('+cursorPosition.x+'px,'+cursorPosition.y+'px,0)';frame=requestAnimationFrame(tick);
}
function pause(){if(!state.playing)return;state.playing=false;updatePlayback();}
function chooseMode(mode){if(!['radar','translate'].includes(mode))return;state.mode=mode;startStage(0);}
function replay(){state.topics=new Set(['data','reasoning']);state.selected='2609.24972';state.term='执行框架';state.remembered=false;state.playing=!motion.matches;setProof(false);startStage(0);}

tabs.forEach(tab=>{
  tab.addEventListener('click',()=>chooseMode(tab.dataset.mode));
  tab.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;chooseMode(tabs[next].dataset.mode);tabs[next].focus();});
});
stageButtons.forEach(button=>button.addEventListener('click',()=>startStage(Number(button.dataset.stage),true)));
playButton.addEventListener('click',()=>{state.playing=!state.playing;updatePlayback();targetForStage();});
document.querySelector('#replay-demo').addEventListener('click',replay);
topicButtons.forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.topic;if(state.topics.has(key))state.topics.delete(key);else state.topics.add(key);startStage(1,true);}));
list.addEventListener('click',event=>{const row=event.target.closest('button[data-paper]');if(!row)return;state.selected=row.dataset.paper;state.stage=2;state.playing=false;elapsed=0;setProof(true);render();evidence.scrollTop=evidence.scrollHeight;});
proof.addEventListener('toggle',()=>{if(automaticToggle){automaticToggle=false;return;}pause();if(proof.open){state.stage=2;render();}});
termChoice.addEventListener('change',()=>{state.term=termChoice.value;state.remembered=false;state.stage=2;state.playing=false;render();});
document.querySelector('#remember-term').addEventListener('click',()=>{state.remembered=true;state.stage=2;state.playing=false;render();});
for(const scroller of [list,evidence,sourceScroll,translationScroll]){scroller.addEventListener('wheel',pause,{passive:true});scroller.addEventListener('touchstart',pause,{passive:true});scroller.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))pause();});}
document.querySelectorAll('[data-open-demo]').forEach(button=>button.addEventListener('click',()=>{chooseMode(button.dataset.openDemo);state.playing=!motion.matches;startStage(0);root.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});}));
document.querySelector('#watch-demo').addEventListener('click',()=>{state.playing=!motion.matches;startStage(0);});
const privacy=document.querySelector('#privacy-dialog');
document.querySelector('#open-privacy').addEventListener('click',()=>{pause();privacy.showModal();});
document.querySelector('#close-privacy').addEventListener('click',()=>privacy.close());
privacy.addEventListener('click',event=>{if(event.target===privacy){const b=privacy.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)privacy.close();}});
privacy.addEventListener('close',()=>document.querySelector('#open-privacy').focus());
document.addEventListener('visibilitychange',updatePlayback);
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;if(visible!==state.visible){state.visible=visible;updatePlayback();if(visible)targetForStage();}},{threshold:.12}).observe(root);
window.addEventListener('resize',()=>{if(state.playing)targetForStage();});
motion.addEventListener('change',()=>{if(motion.matches)pause();});
if(new URLSearchParams(location.search).get('tool')==='translate')state.mode='translate';
render();targetForStage();
