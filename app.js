'use strict';

// Locale copy
const english = document.documentElement.lang === 'en';
const dictionary={"暂停":"Pause","播放":"Play","暂停演示":"Pause tour","播放演示":"Play tour","自动演示 · ":"Auto tour · ","手动探索 · ":"Explore · ","保存译法":"Save term","按领域与语境，沿用个人译法。":"Keep your terminology consistent with the domain and context.","论文雷达真实界面：机构先验、来源引用与逐项匹配依据。":"Original Paper Radar screenshot: institution priors, cited sources and individual matches.","论文雷达真实界面：arXiv 论文页面上的评分与证据浮窗。":"Original Paper Radar screenshot: scores and evidence on an arXiv paper page.","相关性、质量与时效分别展示，作者贡献和匹配子项清晰可查。":"Relevance, quality and recency, with author contributions and matching topics in detail.","机构依据逐项展开，来源、匹配线索与不确定性一并呈现。":"Inspect each institutional signal, its source, matching evidence and uncertainty.","在 arXiv 原页查看评分、研究方向与机构依据，阅读无需来回切换。":"View scores, topic matches and affiliation evidence directly on arXiv.","放大细节":"Zoom in","适应宽度":"Fit to width","论文详情":"Paper details","机构溯源":"Affiliations","网页标注":"On the page","查看真实的论文评分与作者依据":"Explore actual scores and author evidence","逐项追溯机构与来源":"Trace institutions and their sources","回到原网页，继续阅读":"Keep reading on the original page","文档结构":"Document","表格与链接":"Tables & links","代码与译法":"Code & terms","多级标题、引用与嵌套列表":"Headings, blockquotes and nested lists","表格和超链接，原样保留":"Tables and hyperlinks, preserved","代码保持原样，沿用个人译法":"Keep code intact and apply personal terms","插件界面 · 三篇公开论文，可切换或打开原图。":"Original Chrome Web Store screenshots · Scroll to explore or open the full-size image.","已保存":"Saved","论文详情 · When Agents Slow Down":"Paper details · When Agents Slow Down","论文详情 · WearableQA":"Paper details · WearableQA","论文详情 · Conversation Compiler":"Paper details · Conversation Compiler","Agent 推理":"Agent reasoning","健康数据问答":"Health data QA","对话分析":"Conversation analysis","查看 Agent 策略研究的作者与评分依据":"Inspect author and score evidence for agent strategies","查看可穿戴数据问答的机构与研究线索":"Explore institutions and evidence for wearable-data QA","查看对话轨迹分析的作者与来源":"Inspect authors and sources for conversation trace analysis","论文雷达界面：When Agents Slow Down 的论文与评分依据。":"Paper Radar: When Agents Slow Down and its scoring evidence.","论文雷达界面：WearableQA 的作者、机构与研究依据。":"Paper Radar: WearableQA authors, institutions and evidence.","论文雷达界面：Conversation Compiler 的作者与来源。":"Paper Radar: Conversation Compiler authors and sources.","插件界面 · 三篇公开论文，可切换或打开原图。":"Product interface · Three public papers. Switch examples or open the original images.","多论文 Markdown 阅读笔记 · 预置中英示例，不调用模型。":"Multi-paper Markdown reading brief · Preset English and Chinese examples. No model calls."};
const t = value => english ? (dictionary[value] ?? value) : value;

// Public screenshots and a prewritten Markdown reading note. No extension engine runs here.
const captures = [{"file": "radar-agents.png", "title": "论文详情 · When Agents Slow Down", "description": "查看 Agent 策略研究的作者与评分依据", "alt": "论文雷达界面：When Agents Slow Down 的论文与评分依据。"}, {"file": "radar-wearableqa.png", "title": "论文详情 · WearableQA", "description": "查看可穿戴数据问答的机构与研究线索", "alt": "论文雷达界面：WearableQA 的作者、机构与研究依据。"}, {"file": "radar-conversation.png", "title": "论文详情 · Conversation Compiler", "description": "查看对话轨迹分析的作者与来源", "alt": "论文雷达界面：Conversation Compiler 的作者与来源。"}];
const labels = {radar:['Agent 推理','健康数据问答','对话分析'], translate:['文档结构','表格与链接','代码与译法']};
const captions = {radar:['查看 Agent 策略研究的作者与评分依据','查看可穿戴数据问答的机构与研究线索','查看对话轨迹分析的作者与来源'], translate:['多级标题、引用与嵌套列表','表格和超链接，原样保留','代码保持原样，沿用个人译法']};
const durationByMode = {radar:[7000,6500,6500], translate:[5000,6500,8500]};
const root = document.querySelector('#experience');
const tabs = [...document.querySelectorAll('.product-tab')];
const stageButtons = [...document.querySelectorAll('.stage-controls button')];
const capture = document.querySelector('.radar-capture');
const captureImage = document.querySelector('#radar-screenshot');
const captureLink = document.querySelector('#capture-original');
const zoomButton = document.querySelector('#capture-zoom');
const sourceScroll = document.querySelector('.source-scroll');
const translationScroll = document.querySelector('.translation-scroll');
const sourceRendered = document.querySelector('.source-rendered');
const sourceMarkdown = document.querySelector('.markdown-source');
const sourceFormat = document.querySelector('#source-format');
const termChoice = document.querySelector('#term-choice');
const playButton = document.querySelector('#play-demo');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const state = {mode:'radar', stage:0, playing:!motion.matches, visible:true, zoom:false, markdown:false, term:'执行轨迹', remembered:false};
let frame = null, lastTime = 0, elapsed = 0, captureIndex = -1, scrollDriver = null;
const assetPrefix = new URL('assets/', document.querySelector('script[src*="app.js"]').src).href;

function active() { return state.playing && state.visible && !document.hidden; }
function ease(value) { const x = Math.max(0, Math.min(1, value)); return x*x*(3-2*x); }
function maxScroll(el) { return Math.max(0, el.scrollHeight-el.clientHeight); }
function sectionOffset(scroller, key) {
  const scope = scroller === sourceScroll ? (state.markdown ? sourceMarkdown : sourceRendered) : scroller;
  const section = scope.querySelector('[data-section="'+key+'"]');
  if (!section) return 0;
  return Math.max(0, Math.min(maxScroll(scroller), section.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-8));
}
function scrollReading(key, progress=1, from='intro') {
  for (const scroller of [sourceScroll, translationScroll]) {
    const start = sectionOffset(scroller, from), end = sectionOffset(scroller, key);
    scroller.scrollTop = start+(end-start)*progress;
  }
}
function renderCapture() {
  const item = captures[state.stage];
  if (captureIndex !== state.stage) {
    captureIndex = state.stage;
    captureImage.src = assetPrefix+item.file;
    captureImage.alt = t(item.alt);
    captureLink.href = assetPrefix+item.file;
    capture.scrollTop = 0;
    capture.scrollLeft = 0;
  }
  document.querySelector('#capture-title').textContent = t(item.title);
  document.querySelector('#capture-description').textContent = t(item.description);
  capture.classList.toggle('is-zoomed', state.zoom);
  zoomButton.setAttribute('aria-pressed', String(state.zoom));
  zoomButton.firstChild.textContent = t(state.zoom ? '适应宽度' : '放大细节')+' ';
  zoomButton.querySelector('span').textContent = state.zoom ? '−' : '＋';
}
function renderTerm() {
  document.querySelectorAll('[data-term]').forEach(el => el.textContent = state.term);
  termChoice.value = state.term;
  root.dataset.remembered = String(state.remembered);
  document.querySelector('#remember-term').firstChild.textContent = t(state.remembered ? '已保存' : '保存译法')+' ';
  document.querySelector('#memory-status').textContent = state.remembered
    ? (english ? 'Saved in this demo: trace → '+state.term+'. Replay resets it.' : '本页已保存：trace → '+state.term+'。重播可重置。')
    : t('按领域与语境，沿用个人译法。');
}
function updatePlayback() {
  root.classList.toggle('is-playing', active());
  playButton.querySelector('span').textContent = t(state.playing ? '暂停' : '播放');
  playButton.setAttribute('aria-label', t(state.playing ? '暂停演示' : '播放演示'));
  playButton.querySelector('path').setAttribute('d', state.playing ? 'M7 5v10M13 5v10' : 'M6 4l9 6-9 6z');
  document.querySelector('#tour-caption').textContent = t(state.playing ? '自动演示 · ' : '手动探索 · ')+t(captions[state.mode][state.stage]);
  cancelAnimationFrame(frame); frame = null; lastTime = 0;
  if (active()) frame = requestAnimationFrame(tick);
}
function render() {
  root.dataset.mode = state.mode;
  root.dataset.stage = String(state.stage);
  document.querySelector('#radar-demo').hidden = state.mode !== 'radar';
  document.querySelector('#translate-demo').hidden = state.mode !== 'translate';
  tabs.forEach(tab => {
    const selected = tab.dataset.mode === state.mode;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
  });
  stageButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === state.stage));
    button.querySelector('.stage-name').textContent = t(labels[state.mode][index]);
  });
  document.querySelector('#tour-position').textContent = String(state.stage+1).padStart(2,'0')+' / 03';
  document.querySelector('#demo-disclaimer').textContent = t(state.mode === 'radar'
    ? '插件界面 · 三篇公开论文，可切换或打开原图。'
    : '多论文 Markdown 阅读笔记 · 预置中英示例，不调用模型。');
  if (state.mode === 'radar') renderCapture();
  renderTerm(); updatePlayback();
}
function startStage(stage, manual=false) {
  state.stage = stage; elapsed = 0; scrollDriver = null;
  if (manual) state.playing = false;
  render();
  if (state.mode === 'translate') {
    if (stage === 0) { sourceScroll.scrollTop=0; translationScroll.scrollTop=0; }
    else scrollReading(stage === 1 ? (manual ? 'table' : 'intro') : (manual ? 'code' : 'outline'));
  }
  updateProgress();
}
function updateProgress() {
  const durations = durationByMode[state.mode];
  const total = durations.reduce((a,b)=>a+b,0);
  const done = durations.slice(0,state.stage).reduce((a,b)=>a+b,0)+elapsed;
  root.style.setProperty('--tour-progress', String(done/total));
}
function tick(now) {
  if (!active()) { frame=null; return; }
  if (lastTime) elapsed += Math.min(now-lastTime,80);
  lastTime = now;
  if (elapsed >= durationByMode[state.mode][state.stage]) { startStage((state.stage+1)%3); return; }
  if (!motion.matches) {
    if (state.mode === 'radar') capture.scrollTop = maxScroll(capture)*ease((elapsed-1300)/3600);
    else if (state.stage === 1) scrollReading('table',ease((elapsed-500)/2600));
    else if (state.stage === 2) {
      scrollReading('code',ease((elapsed-1900)/2800),'outline');
      if (elapsed>4900 && state.term!=='过程记录') { state.term='过程记录'; renderTerm(); }
      if (elapsed>6400 && !state.remembered) { state.remembered=true; renderTerm(); }
    }
  }
  updateProgress(); frame=requestAnimationFrame(tick);
}
function pause() { if (state.playing) { state.playing=false; updatePlayback(); } }
function chooseMode(mode) { if (['radar','translate'].includes(mode)) { state.mode=mode; startStage(0); } }
function replay() {
  state.term='执行轨迹'; state.remembered=false; state.zoom=false; state.markdown=false;
  sourceRendered.hidden=false; sourceMarkdown.hidden=true; sourceFormat.setAttribute('aria-pressed','false');
  captureIndex=-1; state.playing=!motion.matches; startStage(0);
}

tabs.forEach(tab => {
  tab.addEventListener('click',()=>chooseMode(tab.dataset.mode));
  tab.addEventListener('keydown',event=>{
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index=tabs.indexOf(tab), next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    chooseMode(tabs[next].dataset.mode); tabs[next].focus();
  });
});
stageButtons.forEach(button=>button.addEventListener('click',()=>startStage(Number(button.dataset.stage),true)));
playButton.addEventListener('click',()=>{state.playing=!state.playing;scrollDriver=null;updatePlayback();});
document.querySelector('#replay-demo').addEventListener('click',replay);
zoomButton.addEventListener('click',()=>{pause();state.zoom=!state.zoom;renderCapture();});
sourceFormat.addEventListener('click',()=>{
  pause(); scrollDriver=null;
  const fraction=maxScroll(sourceScroll)?sourceScroll.scrollTop/maxScroll(sourceScroll):0;
  state.markdown=!state.markdown;
  sourceRendered.hidden=state.markdown; sourceMarkdown.hidden=!state.markdown;
  sourceFormat.setAttribute('aria-pressed',String(state.markdown));
  sourceScroll.scrollTop=fraction*maxScroll(sourceScroll);
});
termChoice.addEventListener('change',()=>{pause();state.term=termChoice.value;state.remembered=false;renderTerm();});
document.querySelector('#remember-term').addEventListener('click',()=>{pause();state.remembered=true;renderTerm();});
for (const scroller of [capture,sourceScroll,translationScroll]) {
  const takeControl=()=>{pause();scrollDriver=scroller;};
  scroller.addEventListener('wheel',takeControl,{passive:true});
  scroller.addEventListener('touchstart',takeControl,{passive:true});
  scroller.addEventListener('keydown',event=>{if (['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','PageDown','PageUp','Home','End',' '].includes(event.key)) takeControl();});
  if (scroller!==capture) scroller.addEventListener('scroll',()=>{
    if (scrollDriver!==scroller || state.playing) return;
    const other=scroller===sourceScroll?translationScroll:sourceScroll;
    const fraction=maxScroll(scroller)?scroller.scrollTop/maxScroll(scroller):0;
    other.scrollTop=fraction*maxScroll(other);
  },{passive:true});
}
document.querySelectorAll('[data-open-demo]').forEach(button=>button.addEventListener('click',()=>{
  chooseMode(button.dataset.openDemo); state.playing=!motion.matches; startStage(0);
  root.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});
}));
document.querySelector('#watch-demo').addEventListener('click',()=>{state.playing=!motion.matches;startStage(0);});
const privacy=document.querySelector('#privacy-dialog');
document.querySelector('#open-privacy').addEventListener('click',()=>{pause();privacy.showModal();});
document.querySelector('#close-privacy').addEventListener('click',()=>privacy.close());
privacy.addEventListener('click',event=>{
  if (event.target!==privacy) return;
  const b=privacy.getBoundingClientRect();
  if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom) privacy.close();
});
privacy.addEventListener('close',()=>document.querySelector('#open-privacy').focus());
document.addEventListener('visibilitychange',updatePlayback);
if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{
  const visible=entries[0].isIntersecting;
  if (visible!==state.visible) {state.visible=visible;updatePlayback();}
},{threshold:.12}).observe(root);
motion.addEventListener('change',()=>{if(motion.matches)pause();});
const initialProduct = document.body.dataset.product || new URLSearchParams(location.search).get('tool');
if (['radar','translate'].includes(initialProduct)) state.mode = initialProduct;
render();

// Precomputed public results only. The scoring engine stays in the extension.
(function mountPersonalPreview() {
 const root=document.getElementById('personal-ranking-preview'),source=document.getElementById('personal-preview-data');
 if(!root||!source)return;
 const data=JSON.parse(source.textContent),en=document.documentElement.lang==='en';
 let selectedPaper=data.papers[0].id,selectedProfile='agents';
 const names={berkeley:'UC Berkeley',washington:'University of Washington',princeton:'Princeton University',stanford:'Stanford University',meta:'Meta'};
 function show(){
  const paper=data.papers.find(p=>p.id===selectedPaper),sample=paper.cases.find(c=>c.id===selectedProfile);
  root.querySelectorAll('[data-personal-profile]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.personalProfile===selectedProfile)));
  root.querySelectorAll('[data-personal-paper]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.personalPaper===selectedPaper)));
  root.querySelector('[data-personal-title]').textContent=paper.short+' · '+paper.id;
  root.querySelector('[data-personal-source]').href=paper.url;
  for(const [field,value]of [['base',sample.base],['author-adjustment',sample.authorAdjustment],['institution-adjustment',sample.institutionAdjustment],['total',sample.total]])root.querySelector('[data-personal-'+field+']').textContent=value.toFixed(1);
  const rows=root.querySelector('[data-personal-rows]');rows.replaceChildren();
  for(const item of [...sample.authors,...sample.institutions]){
   const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=en?(names[item.id]||item.name):item.name;
   const weight=document.createElement('span');weight.textContent='×'+item.weight.toFixed(3);td.append(weight);
   const track=document.createElement('span'),fill=document.createElement('i');track.className='personal-weight-track';track.setAttribute('aria-hidden','true');fill.style.width=Math.max(0,Math.min(100,(item.weight-.5)*100))+'%';track.append(fill);td.append(track);tr.append(th,td);rows.append(tr);
  }
  root.querySelector('[data-personal-weight-note]').textContent=en?'1 is neutral. Authors without sufficient resolved bibliography retain neutral weights.':'×1 为中性；缺少足够身份与书目依据的作者保持中性，不作质量判断。';
  const details=root.querySelector('[data-personal-evidence]');details.replaceChildren();
  for(const institution of sample.institutions){const p=document.createElement('p');p.textContent=(en?(names[institution.id]||institution.name):institution.name)+' · '+institution.papers.toLocaleString()+(en?' evidenced papers · ':' 篇已核书目 · ')+institution.keywords.join(' / ');details.append(p);for(const example of institution.examples.slice(0,1)){const a=document.createElement('a');a.href=example.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=example.title+' ↗';details.append(a);}}
  root.dataset.personalCurrent=selectedProfile;root.dataset.paperCurrent=selectedPaper;
 }
 root.querySelectorAll('[data-personal-profile]').forEach(b=>b.addEventListener('click',()=>{selectedProfile=b.dataset.personalProfile;show()}));
 root.querySelectorAll('[data-personal-paper]').forEach(b=>b.addEventListener('click',()=>{selectedPaper=b.dataset.personalPaper;show()}));
 show();
})();
