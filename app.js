'use strict';

// Locale copy
const english = document.documentElement.lang === 'en';
const dictionary={
  '保存译法':'Save term','已保存':'Saved',
  '按领域与语境，沿用个人译法。':'Keep your terminology consistent with the domain and context.',
  'Agent 推理':'Agent reasoning','文档结构':'Document','表格与链接':'Tables & links','代码与译法':'Code & terms',
  '多维加权 · 按你的研究偏好排序':'Multiple dimensions · Weighted to your research',
  '保留结构 · 沿用你的译法':'Original structure · Your preferred terms',
  '多论文 Markdown 阅读笔记 · 预置中英示例，不调用模型。':'Multi-paper Markdown reading brief · Preset English and Chinese examples. No model calls.',
};
const t = value => english ? (dictionary[value] ?? value) : value;

// Public screenshots and a prewritten Markdown reading note. No extension engine runs here.
Object.assign(dictionary, {
  '论文选读 · When Agents Slow Down':'Reading list · When Agents Slow Down',
  '论文选读 · WearableQA':'Reading list · WearableQA',
  '论文选读 · Conversation Compiler':'Reading list · Conversation Compiler',
  '研究图谱 · 公开书目':'Research map · Public bibliography',
  '从标题、作者与机构，快速找到值得继续读的论文。':'Find your next read through titles, authors and affiliations.',
  '研究线索、机构来源与个人评分，同屏呈现。':'Research topics, affiliations and personal scores, together.',
  '从摘要到代码入口，沿着论文继续探索。':'Follow the paper from its abstract to the original code.',
  '从论文到作者网络，探索研究之间的联系。':'Follow the connections between papers and their authors.',
  '可穿戴问答':'Wearable QA','对话轨迹':'Agent traces','研究图谱':'Research map',
  '论文雷达工作台：When Agents Slow Down 的完整论文卡片与选读列表。':'Paper Radar workbench: When Agents Slow Down in the reading list.',
  '论文雷达工作台：WearableQA 的论文、作者与机构标签。':'Paper Radar workbench: WearableQA, authors and affiliations.',
  '论文雷达工作台：Conversation Compiler 的论文卡片与代码入口。':'Paper Radar workbench: Conversation Compiler and its code link.',
  '研究图谱：公开书目中的作者与合作关系。':'Research map: authors and coauthorship from public bibliography.',
  '原始界面 · 左右滑动浏览。论文与图谱均为公开资料演示。':'Localized interface preview · Swipe to explore. Papers and scores use public metadata.',
});
const captures = [
  {file:'radar-agents.webp', original:'radar-agents.png', title:'论文选读 · When Agents Slow Down', description:'从标题、作者与机构，快速找到值得继续读的论文。', alt:'论文雷达工作台：When Agents Slow Down 的完整论文卡片与选读列表。'},
  {file:'radar-wearableqa.webp', original:'radar-wearableqa.png', title:'论文选读 · WearableQA', description:'研究线索、机构来源与个人评分，同屏呈现。', alt:'论文雷达工作台：WearableQA 的论文、作者与机构标签。'},
  {file:'radar-conversation.webp', original:'radar-conversation.png', title:'论文选读 · Conversation Compiler', description:'从摘要到代码入口，沿着论文继续探索。', alt:'论文雷达工作台：Conversation Compiler 的论文卡片与代码入口。'},
  {file:'radar-research-map.webp', original:'radar-research-map.png', title:'研究图谱 · 公开书目', description:'从论文到作者网络，探索研究之间的联系。', alt:'研究图谱：公开书目中的作者与合作关系。'},
];
if (english) for (const capture of captures) { capture.file=capture.file.replace('.webp','-en.webp'); capture.original=capture.original.replace('.png','-en.png'); }
const labels = {radar:['Agent 推理','可穿戴问答','对话轨迹','研究图谱'], translate:['文档结构','表格与链接','代码与译法']};
const root = document.querySelector('#experience');
const tabs = [...document.querySelectorAll('.product-tab')];
const stageButtons = [...document.querySelectorAll('.stage-controls button')];
const capture = document.querySelector('.radar-capture');
const captureSlides = [...document.querySelectorAll('.capture-slide')];
const captureLink = document.querySelector('#capture-original');
const sourceScroll = document.querySelector('.source-scroll');
const translationScroll = document.querySelector('.translation-scroll');
const sourceRendered = document.querySelector('.source-rendered');
const sourceMarkdown = document.querySelector('.markdown-source');
const sourceFormat = document.querySelector('#source-format');
const termChoice = document.querySelector('#term-choice');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const state = {mode:'radar', stage:0, markdown:false, term:'执行轨迹', remembered:false};
let scrollDriver = null, galleryTarget = null, galleryDrag = null;
const assetPrefix = new URL('assets/', document.querySelector('script[src*="app.js"]').src).href;

function maxScroll(el) { return Math.max(0, el.scrollHeight-el.clientHeight); }
function sectionOffset(scroller, key) {
  const scope = scroller === sourceScroll ? (state.markdown ? sourceMarkdown : sourceRendered) : scroller;
  const section = scope.querySelector('[data-section="'+key+'"]');
  if (!section) return 0;
  return Math.max(0, Math.min(maxScroll(scroller), section.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-8));
}
function scrollReading(key) {
  for (const scroller of [sourceScroll, translationScroll]) scroller.scrollTop=sectionOffset(scroller,key);
}
function renderCapture(align=true) {
  const item = captures[state.stage];
  captureSlides.forEach((slide,index)=>{
    slide.setAttribute('aria-hidden',String(index!==state.stage));
    slide.querySelector('img').alt=t(captures[index].alt);
  });
  if (align && capture.clientWidth) {
    const left=state.stage*capture.clientWidth;
    galleryTarget=Math.abs(capture.scrollLeft-left)>1?left:null;
    if(motion.matches)capture.scrollLeft=left;
    else capture.scrollTo({left,behavior:'smooth'});
  }
  captureLink.href = assetPrefix+item.original;
  document.querySelector('#capture-title').textContent = t(item.title);
  document.querySelector('#capture-description').textContent = t(item.description);
  document.querySelector('#capture-position').textContent=String(state.stage+1).padStart(2,'0')+' / '+String(captures.length).padStart(2,'0');
}
function renderTerm() {
  document.querySelectorAll('[data-term]').forEach(el => el.textContent = state.term);
  termChoice.value = state.term;
  root.dataset.remembered = String(state.remembered);
  document.querySelector('#remember-term').firstChild.textContent = t(state.remembered ? '已保存' : '保存译法')+' ';
  document.querySelector('#memory-status').textContent = state.remembered
    ? (english ? 'Saved in this example: trace → '+state.term+'.' : '本页已保存：trace → '+state.term+'。')
    : t('按领域与语境，沿用个人译法。');
}
function render(alignCapture=true) {
  root.dataset.mode = state.mode;
  root.dataset.stage = String(state.stage);
  document.querySelector('#radar-demo').hidden = state.mode !== 'radar';
  document.querySelector('#translate-demo').hidden = state.mode !== 'translate';
  tabs.forEach(tab => {
    const selected = tab.dataset.mode === state.mode;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
  });
  stageButtons.forEach((button, index) => {
    button.hidden=index>=labels[state.mode].length;
    button.setAttribute('aria-pressed', String(index === state.stage));
    button.querySelector('.stage-name').textContent = t(labels[state.mode][index]||'');
  });
  document.querySelector('#demo-disclaimer').textContent = t(state.mode === 'radar'
    ? '原始界面 · 左右滑动浏览。论文与图谱均为公开资料演示。'
    : '多论文 Markdown 阅读笔记 · 预置中英示例，不调用模型。');
  if (state.mode === 'radar') renderCapture(alignCapture);
  document.querySelector('#tour-caption').textContent=t(state.mode==='radar'?'多维加权 · 按你的研究偏好排序':'保留结构 · 沿用你的译法');
  renderTerm();
}
function startStage(stage, alignCapture=true) {
  state.stage=stage;scrollDriver=null;
  render(alignCapture);
  if(state.mode==='translate'){
    if(stage===0){sourceScroll.scrollTop=0;translationScroll.scrollTop=0;}
    else scrollReading(stage===1?'table':'code');
  }
}
function chooseMode(mode) { if(['radar','translate'].includes(mode)){state.mode=mode;startStage(0);} }

tabs.forEach(tab => {
  tab.addEventListener('click',()=>chooseMode(tab.dataset.mode));
  tab.addEventListener('keydown',event=>{
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index=tabs.indexOf(tab), next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    chooseMode(tabs[next].dataset.mode); tabs[next].focus();
  });
});
stageButtons.forEach(button=>button.addEventListener('click',()=>startStage(Number(button.dataset.stage))));
document.querySelectorAll('[data-capture-direction]').forEach(button=>button.addEventListener('click',()=>{
  startStage((state.stage+Number(button.dataset.captureDirection)+captures.length)%captures.length);
}));
capture.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?captures.length-1:(state.stage+(event.key==='ArrowRight'?1:-1)+captures.length)%captures.length;
  startStage(next);
});
capture.addEventListener('scroll',()=>{
  if(state.mode!=='radar'||!capture.clientWidth||galleryDrag)return;
  if(galleryTarget!==null){if(Math.abs(capture.scrollLeft-galleryTarget)<2)galleryTarget=null;return;}
  const next=Math.max(0,Math.min(captures.length-1,Math.round(capture.scrollLeft/capture.clientWidth)));
  if(next!==state.stage)startStage(next,false);
},{passive:true});
capture.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  galleryTarget=null;
  if(event.pointerType!=='mouse')return;
  galleryDrag={x:event.clientX,left:capture.scrollLeft,id:event.pointerId};
  capture.classList.add('is-dragging');capture.setPointerCapture(event.pointerId);
});
capture.addEventListener('pointermove',event=>{
  if(!galleryDrag)return;
  capture.scrollLeft=galleryDrag.left+galleryDrag.x-event.clientX;
});
function finishGalleryDrag(){
  if(!galleryDrag)return;
  galleryDrag=null;capture.classList.remove('is-dragging');
  startStage(Math.max(0,Math.min(captures.length-1,Math.round(capture.scrollLeft/capture.clientWidth))));
}
capture.addEventListener('pointerup',finishGalleryDrag);
capture.addEventListener('pointercancel',finishGalleryDrag);
capture.addEventListener('lostpointercapture',finishGalleryDrag);
if('ResizeObserver' in window)new ResizeObserver(()=>{
  if(state.mode!=='radar'||!capture.clientWidth)return;
  galleryTarget=state.stage*capture.clientWidth;
  capture.scrollLeft=galleryTarget;
  galleryTarget=null;
}).observe(capture);
sourceFormat.addEventListener('click',()=>{
  scrollDriver=null;
  const fraction=maxScroll(sourceScroll)?sourceScroll.scrollTop/maxScroll(sourceScroll):0;
  state.markdown=!state.markdown;
  sourceRendered.hidden=state.markdown; sourceMarkdown.hidden=!state.markdown;
  sourceFormat.setAttribute('aria-pressed',String(state.markdown));
  sourceScroll.scrollTop=fraction*maxScroll(sourceScroll);
});
termChoice.addEventListener('change',()=>{state.term=termChoice.value;state.remembered=false;renderTerm();});
document.querySelector('#remember-term').addEventListener('click',()=>{state.remembered=true;renderTerm();});
for (const scroller of [capture,sourceScroll,translationScroll]) {
  const takeControl=()=>{scrollDriver=scroller;if(scroller===capture)galleryTarget=null;};
  scroller.addEventListener('wheel',takeControl,{passive:true});
  scroller.addEventListener('touchstart',takeControl,{passive:true});
  scroller.addEventListener('keydown',event=>{if (!event.defaultPrevented && ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','PageDown','PageUp','Home','End',' '].includes(event.key)) takeControl();});
  if (scroller!==capture) scroller.addEventListener('scroll',()=>{
    if (scrollDriver!==scroller) return;
    const other=scroller===sourceScroll?translationScroll:sourceScroll;
    const fraction=maxScroll(scroller)?scroller.scrollTop/maxScroll(scroller):0;
    other.scrollTop=fraction*maxScroll(other);
  },{passive:true});
}
document.querySelectorAll('[data-open-demo]').forEach(button=>button.addEventListener('click',()=>{
  chooseMode(button.dataset.openDemo);
  root.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});
}));
document.querySelector('#watch-demo').addEventListener('click',()=>startStage(0));
const privacy=document.querySelector('#privacy-dialog');
document.querySelector('#open-privacy').addEventListener('click',()=>privacy.showModal());
document.querySelector('#close-privacy').addEventListener('click',()=>privacy.close());
privacy.addEventListener('click',event=>{
  if (event.target!==privacy) return;
  const b=privacy.getBoundingClientRect();
  if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom) privacy.close();
});
privacy.addEventListener('close',()=>document.querySelector('#open-privacy').focus());
motion.addEventListener('change',()=>{if(motion.matches&&state.mode==='radar')renderCapture();});
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
