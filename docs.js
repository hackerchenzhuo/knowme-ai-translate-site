'use strict';
function applyLanguage(){
 const english=location.hash==='#english'||location.hash.startsWith('#en-');
 const lang=english?'en':'zh';document.documentElement.lang=english?'en':'zh-CN';
 document.querySelectorAll('[data-doc-language]').forEach(el=>el.hidden=el.dataset.docLanguage!==lang);
 document.querySelectorAll('[data-en][data-zh]').forEach(el=>el.textContent=el.dataset[lang]);
 document.querySelectorAll('[data-language]').forEach(el=>el.classList.toggle('lang-current',el.dataset.language===lang));
 document.querySelectorAll('[data-home]').forEach(el=>el.href=english?'en/':'index.html');
 document.querySelectorAll('[data-home-products]').forEach(el=>el.href=(english?'en/':'index.html')+'#products');
 document.querySelectorAll('[data-doc-link]').forEach(el=>{el.href=el.getAttribute('href').split('#')[0]+(english?'#english':'');if(el.pathname===location.pathname)el.setAttribute('aria-current','page');});
 if(['#english','#chinese'].includes(location.hash))requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
}
window.addEventListener('hashchange',applyLanguage);applyLanguage();
