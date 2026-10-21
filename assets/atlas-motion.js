(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const label = (zh, english) => en ? english : zh;
  const frame = document.querySelector('iframe[data-atlas-src]');
  if (frame) {
    const container = frame.closest('.atlas-frame');
    let started = false;
    const ready = () => {
      container.dataset.atlasState = 'ready';
      container.setAttribute('aria-busy', 'false');
    };
    window.addEventListener('message', event => {
      if (started && event.source === frame.contentWindow && event.origin === location.origin && event.data?.type === 'knowme-atlas-ready') ready();
    });
    frame.addEventListener('load', () => {
      if (!started) return;
      if (frame.contentWindow.__atlasReady) ready();
      else if (!frame.contentDocument?.querySelector('#atlas-canvas')) {
        container.dataset.atlasState = 'error';
        container.setAttribute('aria-busy', 'false');
        container.querySelector('.atlas-loading-label').textContent = label('图谱暂时未能加载，可使用下方入口重新打开。', 'The map could not load. Use the link below to open it again.');
      }
    });
    const observe = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || started) return;
      started = true; observe.disconnect();
      container.dataset.atlasState = 'loading';
      container.setAttribute('aria-busy', 'true');
      frame.src = frame.dataset.atlasSrc;
    }, { rootMargin: '160px 0px' });
    observe.observe(container);
  }

  const image = document.getElementById('atlas-motion-image');
  if (!image) return;
  const open = document.getElementById('atlas-motion-open');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const preview = image.closest('button');
  let engaged = false, visible = false, hydrated = false, expanded = false;
  const src = (node, value) => { if (node.getAttribute('src') !== value) node.setAttribute('src', value); };
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-motion-dialog';
  dialog.setAttribute('aria-label', label('图谱到论文 · 实际操作演示', 'Research graph to paper · Recorded workflow'));
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'atlas-motion-close'; close.textContent = '×';
  close.setAttribute('aria-label', label('关闭图示', 'Close view'));
  const title = document.createElement('p');
  title.textContent = label('从作者合作图谱，进入单篇论文的贡献依据。', 'From a coauthorship graph to a paper and its scoring evidence.');
  const large = document.createElement('img');
  large.width = 1280; large.height = 800; large.alt = image.alt; large.decoding = 'async';
  dialog.append(close, title, large); document.body.append(dialog);

  const update = () => {
    if (hydrated) src(image, engaged && !reduced.matches && visible && !expanded && !document.hidden ? image.dataset.motion : image.dataset.poster);
    if (expanded) src(large, !reduced.matches && !document.hidden ? image.dataset.motion : image.dataset.poster);
  };
  const preload = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    hydrated = true; preload.disconnect(); update();
  }, { rootMargin: '160px 0px' });
  preload.observe(image);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
    update();
  }, { threshold: [0, .15] }).observe(image);
  const engage = () => { engaged = true; hydrated = true; update(); };
  const disengage = () => { engaged = false; update(); };
  preview.addEventListener('pointerenter', engage);
  preview.addEventListener('pointerleave', disengage);
  preview.addEventListener('focusin', engage);
  preview.addEventListener('focusout', disengage);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener?.('change', update);
  const show = () => { hydrated = true; expanded = true; dialog.showModal(); update(); };
  close.onclick = () => dialog.close();
  dialog.addEventListener('close', () => { expanded = false; large.removeAttribute('src'); update(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  open.onclick = show; preview.onclick = show;
  update();
})();
