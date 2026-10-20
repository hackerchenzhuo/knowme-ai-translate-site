// Presentation only. The graph and all evidence are supplied by the existing data pipeline.
export const researchMapColors = Object.freeze({ 'cs.CL': '#3c8578', 'cs.AI': '#547c92', 'cs.LG': '#87a18e', 'cs.CV': '#b59b77', 'cs.RO': '#b68b85', Scholar: '#317d66' });
const defaultView = [0, 0, 1160, 700];
const color = node => researchMapColors[node.group] ?? '#899c9c';

export function createResearchMapVisual(canvas, { onSelect = () => {}, onViewChange = () => {} } = {}) {
  const win = canvas.ownerDocument.defaultView, ctx = canvas.getContext('2d');
  let graph = { nodes: [], edges: [] }, indexed = new Map(), adjacent = new Map();
  let state = { selected: '', personal: false, query: '', paperId: '' }, active = new Set(), hovered = '';
  let view = [...defaultView], frame = 0, motion = null, disposed = false, drag = null, metrics = { scale: 1, ox: 0, oy: 0, width: 0, height: 0 };
  const reduced = () => win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const request = () => { if (!frame && !disposed) frame = win.requestAnimationFrame(draw); };
  const resize = new win.ResizeObserver(request); resize.observe(canvas);

  function membership() {
    active = new Set();
    if (state.paperId) for (const node of graph.nodes) { if (node.paperIds.includes(state.paperId)) active.add(node.id); }
    else if (state.selected) { active.add(state.selected); for (const id of adjacent.get(state.selected) ?? []) active.add(id); }
    else if (state.personal) {
      for (const node of graph.nodes) if (node.attention > 0) { active.add(node.id); for (const id of adjacent.get(node.id) ?? []) active.add(id); }
    }
  }
  function move(next, animate = true) {
    if (view.every((value, index) => Math.abs(value - next[index]) < .01)) { request(); return; }
    if (animate && !reduced()) motion = { from: [...view], to: next, start: win.performance.now(), duration: 360 };
    else { motion = null; view = next; }
    request();
  }
  function draw(now) {
    frame = 0; if (disposed) return;
    if (motion) {
      const fraction = Math.min(1, (now - motion.start) / motion.duration), ease = 1 - (1 - fraction) ** 3;
      view = motion.from.map((value, index) => value + (motion.to[index] - value) * ease);
      if (fraction >= 1) motion = null;
    }
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(2, win.devicePixelRatio || 1);
    if (!rect.width || !rect.height) return;
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height);
    const scale = Math.min(rect.width / view[2], rect.height / view[3]);
    const ox = (rect.width - view[2] * scale) / 2 - view[0] * scale, oy = (rect.height - view[3] * scale) / 2 - view[1] * scale;
    metrics = { scale, ox, oy, width: rect.width, height: rect.height };
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
    const query = state.query.trim().toLowerCase();
    const faded = node => query ? !node.name.toLowerCase().includes(query) : active.size > 0 && !active.has(node.id);
    const selectedEdges = [];
    ctx.beginPath();
    for (const edge of graph.edges) {
      const a = indexed.get(edge.source), b = indexed.get(edge.target);
      if (!a || !b) continue;
      const emphasized = state.paperId ? edge.paperIds.includes(state.paperId) : state.selected ? edge.source === state.selected || edge.target === state.selected : state.personal && (a.attention > 0 || b.attention > 0);
      if (emphasized) selectedEdges.push([a, b, edge]);
      else { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    }
    ctx.strokeStyle = active.size || query ? '#cfdbd4' : '#92ada4'; ctx.globalAlpha = active.size || query ? .18 : .15; ctx.lineWidth = .6 / scale; ctx.stroke();
    ctx.beginPath();
    for (const [a, b] of selectedEdges) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    ctx.globalAlpha = .58; ctx.strokeStyle = '#317b67'; ctx.lineWidth = 1.1 / scale; ctx.stroke();

    const buckets = new Map();
    for (const node of graph.nodes) {
      const alpha = faded(node) ? .11 : node.confidence === 'byline' ? .62 : .9;
      const key = `${color(node)}:${alpha}`;
      const bucket = buckets.get(key) ?? { color: color(node), alpha, nodes: [] }; bucket.nodes.push(node); buckets.set(key, bucket);
    }
    const radius = node => Math.min(6.8, 1.4 + Math.log2(1 + node.paperCount) * .85);
    for (const bucket of buckets.values()) {
      ctx.beginPath();
      for (const node of bucket.nodes) { const r = radius(node); ctx.moveTo(node.x + r, node.y); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); }
      ctx.globalAlpha = bucket.alpha; ctx.fillStyle = bucket.color; ctx.fill();
    }
    for (const node of graph.nodes) {
      if (state.personal && node.attention > 0) {
        ctx.beginPath(); ctx.arc(node.x, node.y, radius(node) + 9 + Math.min(8, node.attention), 0, Math.PI * 2); ctx.globalAlpha = .11; ctx.fillStyle = '#2d957a'; ctx.fill();
      }
      if (node.id === state.selected || node.id === hovered) {
        ctx.beginPath(); ctx.arc(node.x, node.y, radius(node) + 4 / scale, 0, Math.PI * 2); ctx.globalAlpha = .85; ctx.strokeStyle = '#225e4d'; ctx.lineWidth = 1.2 / scale; ctx.stroke();
      }
    }
    const labels = graph.nodes.filter(node => !faded(node)).sort((a, b) =>
      Number(b.id === state.selected || b.id === hovered) - Number(a.id === state.selected || a.id === hovered) ||
      (state.personal ? b.attention - a.attention : 0) || b.paperCount - a.paperCount).slice(0, query ? 35 : state.paperId ? 30 : 23);
    const occupied = [];
    ctx.font = `500 ${10.5 / scale}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`; ctx.textBaseline = 'middle';
    for (const node of labels) {
      const x = node.x + radius(node) + 4 / scale, y = node.y, w = ctx.measureText(node.name).width, h = 14 / scale;
      const bounds = { x, y: y - h / 2, w: w + 5 / scale, h };
      if (node.id !== state.selected && node.id !== hovered && occupied.some(box => bounds.x < box.x + box.w && bounds.x + bounds.w > box.x && bounds.y < box.y + box.h && bounds.y + bounds.h > box.y)) continue;
      occupied.push(bounds); ctx.globalAlpha = .88; ctx.strokeStyle = '#fbfdfb'; ctx.lineWidth = 3 / scale; ctx.lineJoin = 'round'; ctx.strokeText(node.name, x, y);
      ctx.fillStyle = node.id === state.selected ? '#1b5442' : '#36594f'; ctx.globalAlpha = 1; ctx.fillText(node.name, x, y);
    }
    ctx.globalAlpha = 1;
    canvas.dataset.nodeCount = String(graph.nodes.length); canvas.dataset.edgeCount = String(graph.edges.length);
    canvas.dataset.view = view.map(number => number.toFixed(2)).join(' ');
    onViewChange(view);
    if (motion) request();
  }
  function hit(event) {
    const rect = canvas.getBoundingClientRect(), x = (event.clientX - rect.left - metrics.ox) / metrics.scale, y = (event.clientY - rect.top - metrics.oy) / metrics.scale;
    let best = null, distance = (11 / metrics.scale) ** 2;
    for (const node of graph.nodes) {
      const d = (node.x - x) ** 2 + (node.y - y) ** 2;
      if (d < distance) { distance = d; best = node; }
    }
    return best;
  }
  function focus(id) {
    const node = indexed.get(id); if (!node) return;
    const w = 510, h = w * 700 / 1160; move([node.x - w / 2, node.y - h / 2, w, h]);
  }
  function zoom(factor) {
    const width = Math.max(160, Math.min(1740, view[2] * factor)), height = width * 700 / 1160;
    move([view[0] + (view[2] - width) / 2, view[1] + (view[3] - height) / 2, width, height]);
  }
  const down = event => { if (event.button !== 0) return; motion = null; drag = { x: event.clientX, y: event.clientY, view: [...view], moved: false }; };
  const pointerMove = event => {
    if (drag && event.buttons) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
      if (drag.moved) { canvas.setPointerCapture(event.pointerId); view = [drag.view[0] - dx / metrics.scale, drag.view[1] - dy / metrics.scale, drag.view[2], drag.view[3]]; request(); }
      return;
    }
    const node = hit(event), next = node?.id ?? '';
    if (hovered !== next) { hovered = next; canvas.title = node ? `${node.name} · ${node.paperCount}` : ''; canvas.style.cursor = node ? 'pointer' : 'grab'; request(); }
  };
  const up = event => { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); if (drag && !drag.moved) { const node = hit(event); if (node) onSelect(node.id); } drag = null; };
  const cancel = () => { drag = null; };
  const doubleClick = event => { const node = hit(event); if (node) { onSelect(node.id); focus(node.id); } };
  const wheel = event => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); zoom(event.deltaY > 0 ? 1.18 : .85); } };
  const key = event => {
    const shifts = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }, shift = shifts[event.key];
    if (shift) { event.preventDefault(); move([view[0] + shift[0] * view[2] * .1, view[1] + shift[1] * view[3] * .1, view[2], view[3]]); }
    else if (['+', '=', '-', 'Home'].includes(event.key)) { event.preventDefault(); if (event.key === 'Home') move([...defaultView]); else zoom(event.key === '-' ? 1.3 : .77); }
  };
  const leave = () => { if (hovered) { hovered = ''; request(); } };
  for (const [name, handler] of [['pointerdown', down], ['pointermove', pointerMove], ['pointerup', up], ['pointercancel', cancel], ['dblclick', doubleClick], ['keydown', key], ['pointerleave', leave]]) canvas.addEventListener(name, handler);
  canvas.addEventListener('wheel', wheel, { passive: false });
  return {
    setGraph(value) { graph = value; indexed = new Map(graph.nodes.map(node => [node.id, node])); adjacent = new Map(); for (const edge of graph.edges) for (const [a, b] of [[edge.source, edge.target], [edge.target, edge.source]]) { const set = adjacent.get(a) ?? new Set(); set.add(b); adjacent.set(a, set); } membership(); request(); },
    setState(update) { state = { ...state, ...update }; membership(); request(); },
    focus,
    focusPaper(id) {
      const members = graph.nodes.filter(node => node.paperIds.includes(id)); if (!members.length) return;
      const minX = Math.min(...members.map(node => node.x)), maxX = Math.max(...members.map(node => node.x));
      const minY = Math.min(...members.map(node => node.y)), maxY = Math.max(...members.map(node => node.y));
      const x = (minX + maxX) / 2, y = (minY + maxY) / 2, width = Math.max(280, Math.min(1160, Math.max(maxX - minX + 180, (maxY - minY + 120) * 1160 / 700))), height = width * 700 / 1160;
      move([x - width / 2, y - height / 2, width, height]);
    },
    zoom,
    reset() { move([...defaultView]); },
    destroy() { disposed = true; win.cancelAnimationFrame(frame); resize.disconnect(); for (const [name, handler] of [['pointerdown', down], ['pointermove', pointerMove], ['pointerup', up], ['pointercancel', cancel], ['dblclick', doubleClick], ['keydown', key], ['pointerleave', leave], ['wheel', wheel]]) canvas.removeEventListener(name, handler); },
  };
}
