/* Arcticonomics v5 — the lens.
   One switch, "the world: united / broken", changes the whole page, because that is the theory:
   the Arctic does not change. The world around it does. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AMBER = '#ffb21e', FLOW = '#6cc6ff', SNOW = '#eceff1', INK = '#0a0c0e', GREY = '#2a3036', MIST = '#8a949b';
  var D = window.OIL, N = D.real.length, Y0 = D.start[0];
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function idx(y, m) { return (y - Y0) * 12 + (m - D.start[1]); }
  function label(i) { i = clamp(Math.round(i), 0, N - 1); return MON[i % 12] + ' ' + (Y0 + Math.floor(i / 12)); }
  function money(v) { v = Math.round(v); return (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US'); }
  function signed(v) { v = Math.round(v); return (v < 0 ? '−$' : '+$') + Math.abs(v); }
  function font(c, px, w, fam) { c.font = (w || 500) + ' ' + px + 'px ' + (fam || '"IBM Plex Mono", monospace'); }
  function fill(r) { r.style.setProperty('--f', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }

  /* ---------- the world switch ---------- */
  var body = document.body, sw = document.getElementById('sw'), toast = document.getElementById('toast'), meta = document.querySelector('meta[name=theme-color]');
  var world = 'united', touched = false, listeners = [], tt;
  function setWorld(w, msg) {
    if (w === world) return; world = w;
    body.classList.toggle('united', w === 'united'); body.classList.toggle('broken', w === 'broken');
    sw.setAttribute('aria-checked', String(w === 'broken'));
    meta.setAttribute('content', w === 'broken' ? '#0a0c0e' : '#eceff1');
    listeners.forEach(function (f) { f(w); });
    if (msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 3600); }
  }
  function flip(msg) { touched = true; setWorld(world === 'united' ? 'broken' : 'united', msg); }
  sw.addEventListener('click', function () { flip(); });
  document.getElementById('breakBtn').addEventListener('click', function () { flip(world === 'united' ? 'You broke the world. Look at the whole page.' : 'The world is united again.'); });

  /* ---------- I. what is value ---------- */
  var vS = document.getElementById('vS'), vW = document.getElementById('vW'), vM = document.getElementById('vM'), vV = document.getElementById('vV'), vL = document.getElementById('vL'), vB = document.getElementById('vB');
  var shown = 0, vAnim;
  function value() {
    var S = +vS.value / 100, W = +vW.value / 100, M = +vM.value / 100;
    return 1000 * W * M * Math.pow(1 - S, 1.6);
  }
  function showValue() {
    [vS, vW, vM].forEach(fill);
    var v = value(), S = +vS.value, W = +vW.value, M = +vM.value;
    cancelAnimationFrame(vAnim); var from = shown, t0 = performance.now();
    (function go(n) { var k = reduce ? 1 : ease((n - t0) / 450); shown = from + (v - from) * k; vV.textContent = shown < 1 ? 'Free' : money(shown); if (k < 1) vAnim = requestAnimationFrame(go); })(t0);
    vB.style.width = (v / 10) + '%';
    vL.textContent = S >= 98 ? 'Infinite. So it is free.' : W <= 2 ? 'Nobody wants it. So it is free.' : M <= 2 ? 'Nobody can pay for it.' :
      v < 60 ? 'Plenty of it. Cheap.' : v < 300 ? 'Worth something.' : v < 650 ? 'Scarce and wanted. Valuable.' : 'Everyone needs it. As much as they can pay.';
  }
  [vS, vW, vM].forEach(function (r) { r.addEventListener('input', function () { vP.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); showValue(); }); });
  var vP = document.getElementById('vP');
  [['Air', 100, 100, 100], ['Water in a desert', 4, 100, 70], ['Diamonds', 10, 60, 92], ['Arctic oil · united world', 88, 55, 55, 'united'], ['Arctic oil · broken world', 12, 100, 92, 'broken']].forEach(function (p) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = p[0];
    b.addEventListener('click', function () {
      vS.value = p[1]; vW.value = p[2]; vM.value = p[3]; showValue();
      vP.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (p[4] && p[4] !== world) { touched = true; setWorld(p[4], p[4] === 'broken' ? 'The world is broken now. Arctic oil is worth a fortune.' : 'The world is united. Arctic oil is worth little.'); }
    });
    vP.appendChild(b);
  });
  showValue();

  /* ---------- III. Norway: the barrel ---------- */
  var range = document.getElementById('price'), pV = document.getElementById('pV'), bS = document.getElementById('bS'), bN = document.getElementById('bN');
  var oS = document.getElementById('oS'), oN = document.getElementById('oN'), verdict = document.getElementById('verdict');
  var LO = -20, HI = 210, Z = (0 - LO) / (HI - LO) * 100, pAnim;
  document.querySelectorAll('.pb__bar').forEach(function (b) { b.style.setProperty('--z', Z + '%'); });
  function setBar(el, v) { var wv = Math.abs(v) / (HI - LO) * 100; el.style.left = (v >= 0 ? Z : Z - wv) + '%'; el.style.width = wv + '%'; el.classList.toggle('neg', v < 0); }
  function setPrice(p) {
    p = Math.round(p); range.value = p; fill(range); pV.textContent = '$' + p;
    setBar(bS, p - 2); setBar(bN, p - 30); oS.textContent = signed(p - 2); oN.textContent = signed(p - 30);
    verdict.textContent = p < 30 ? 'Norway is outcompeted. Its oil industry collapses.' : p < 55 ? 'Norway barely gets by.' : p < 100 ? 'One of the few trusted sources. Highly profitable.' : 'People pay whatever it takes. Norway prints money.';
    verdict.classList.toggle('is-hot', p >= 55);
  }
  function animPrice(to) { cancelAnimationFrame(pAnim); var from = +range.value, t0 = performance.now(); (function go(n) { var k = reduce ? 1 : ease((n - t0) / 1000); setPrice(from + (to - from) * k); if (k < 1) pAnim = requestAnimationFrame(go); })(t0); }
  range.addEventListener('input', function () { cancelAnimationFrame(pAnim); setPrice(+range.value); });
  setPrice(20);
  listeners.push(function (w) { animPrice(w === 'broken' ? 110 : 20); });

  // reaching the case studies still in a united world: wake the reader up
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !touched && world === 'united') {
      touched = true; setWorld('broken', 'Back to reality: the world of 2026 is broken. The switch says so.');
      sw.classList.add('pulse'); setTimeout(function () { sw.classList.remove('pulse'); }, 4400);
    }
  }, { threshold: .12 }).observe(document.getElementById('norway'));

  /* ---------- III. Norway: eighty years of proof ---------- */
  var EV = [
    { y: 1973, m: 10, k: 'b', n: 'Oil embargo', t: 'Arab–Israeli war and the oil embargo' },
    { y: 1979, m: 1, k: 'b', n: 'Iranian revolution', t: 'The Iranian revolution' },
    { y: 1980, m: 9, k: 'b', n: 'Iran–Iraq war', t: 'The Iran–Iraq war' },
    { y: 1986, m: 1, k: 'f', n: 'Price war', t: 'OPEC price war: everyone pumps' },
    { y: 1990, m: 8, k: 'b', n: 'Kuwait', t: 'Iraq invades Kuwait' },
    { y: 2003, m: 3, k: 'b', n: 'Iraq war', t: 'Venezuela strikes, the US invades Iraq' },
    { y: 2006, m: 7, k: 'b', n: 'Lebanon · Iran', t: 'Israel–Hezbollah war, sanctions on Iran' },
    { y: 2008, m: 6, k: 'b', n: 'Niger Delta', t: 'Insurgency in Nigeria’s oil delta' },
    { y: 2011, m: 2, k: 'b', n: 'Libya', t: 'The Libyan civil war' },
    { y: 2012, m: 7, k: 'b', n: 'Iran embargo', t: 'The EU embargo on Iranian oil' },
    { y: 2014, m: 11, k: 'f', n: 'Glut', t: 'OPEC refuses to cut: everyone pumps' },
    { y: 2019, m: 1, k: 'b', n: 'Venezuela', t: 'Sanctions on Venezuela' },
    { y: 2020, m: 4, k: 'f', n: 'Standstill', t: 'Saudi–Russia price war, and the world stops' },
    { y: 2022, m: 2, k: 'b', n: 'Ukraine', t: 'Russia invades Ukraine' },
    { y: 2026, m: 2, k: 'b', n: 'Hormuz', t: 'War on Iran. The Strait of Hormuz closes' }
  ];
  EV.forEach(function (e, k) {
    e.no = k + 1; e.i = idx(e.y, e.m); e.pk = e.i;
    var j, a = D.real.slice(Math.max(0, e.i - 4), e.i + 1);
    if (e.k === 'b') { for (j = e.i; j <= Math.min(N - 1, e.i + 13); j++) if (D.real[j] > D.real[e.pk]) e.pk = j; e.from = Math.min.apply(null, a); }
    else { for (j = e.i; j <= Math.min(N - 1, e.i + 14); j++) if (D.real[j] < D.real[e.pk]) e.pk = j; e.from = Math.max.apply(null, a); }
    e.to = D.real[e.pk]; e.pct = Math.round((e.to / e.from - 1) * 100);
  });
  var cv = document.getElementById('chart'), C, chartOn = false;
  function setup() { var R = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight, c = cv.getContext('2d'); cv.width = Math.round(w * R); cv.height = Math.round(h * R); c.setTransform(R, 0, 0, R, 0, 0); C = { c: c, w: w, h: h, narrow: w < 760 }; }
  setup();
  var card = document.getElementById('card'), cK = document.getElementById('cK'), cT = document.getElementById('cT'), cN = document.getElementById('cN');
  var chips = document.getElementById('chips'), playI = document.getElementById('playI'), playL = document.getElementById('playL');
  var view = { a: -2, b: N + 1, ymax: 230 }, tgt = { a: -2, b: N + 1 }, head = N - 1, playing = false, playT0 = 0, sel = null, hov = null, played = false, lastEv = null, hoverX = null;
  var val = function (i) { return D.real[clamp(Math.round(i), 0, N - 1)]; };
  EV.forEach(function (e) {
    var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<b>' + e.no + '</b>' + e.y + ' ' + e.n; if (e.k === 'f') b.className = 'is-f';
    b.addEventListener('click', function () { select(sel === e ? null : e); }); e.chip = b; chips.appendChild(b);
  });
  function press(e) { EV.forEach(function (x) { x.chip.setAttribute('aria-pressed', String(x === e)); }); }
  function select(e) {
    stopPlay(); sel = e; head = N - 1; press(e);
    if (!e) { tgt.a = -2; tgt.b = N + 1; card.hidden = true; return; }
    var span = C.narrow ? 60 : 84; tgt.a = clamp(e.pk - span * .58, -2, N - span); tgt.b = tgt.a + span; showCard(e);
    if (C.narrow) e.chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  function showCard(e) {
    card.hidden = false;
    cK.textContent = e.no + ' · ' + label(e.i) + (e.k === 'b' ? ' · The world breaks' : ' · The world flows');
    cT.textContent = e.t;
    cN.innerHTML = (e.k === 'b' ? 'Oil went from ' : 'Oil fell from ') + '<b>' + money(e.from) + '</b> to <b>' + money(e.to) + '</b> ' + (e.k === 'b' ? 'within a year' : 'within months') + ': <b>' + (e.pct > 0 ? '+' : '−') + Math.abs(e.pct) + '%</b>.<br>Norway’s margin: <b>' + signed(e.to - 30) + '</b> a barrel.';
  }
  document.getElementById('cX').addEventListener('click', function () { select(null); });
  function startPlay() { select(null); playing = true; played = true; playT0 = performance.now(); head = 0; lastEv = null; playI.textContent = '■'; playL.textContent = 'Stop'; }
  function stopPlay() { if (!playing) return; playing = false; head = N - 1; playI.textContent = '▶'; playL.textContent = 'Play 80 years'; if (!sel) card.hidden = true; }
  document.getElementById('play').addEventListener('click', function () { playing ? stopPlay() : startPlay(); });
  new IntersectionObserver(function (es) { chartOn = es[0].isIntersecting; if (chartOn && !played && !reduce) setTimeout(function () { if (!played && !sel) startPlay(); }, 300); }, { threshold: .5 }).observe(cv);
  function frameChart(now) {
    var c = C.c, w = C.w, h = C.h, k = reduce ? 1 : .12, i;
    view.a += (tgt.a - view.a) * k; view.b += (tgt.b - view.b) * k;
    if (playing) {
      var p = (now - playT0) / 11000; head = clamp(p, 0, 1) * (N - 1);
      var last = null; EV.forEach(function (e) { if (e.pk <= head) last = e; });
      if (last && last !== lastEv) { lastEv = last; showCard(last); press(last); }
      if (p >= 1) { playing = false; head = N - 1; playI.textContent = '▶'; playL.textContent = 'Play again'; setTimeout(function () { if (!playing && !sel) { card.hidden = true; press(null); } }, 2600); }
    }
    var a0 = clamp(Math.floor(view.a), 0, N - 1), a1 = clamp(Math.ceil(view.b), 0, N - 1), mx = 0;
    for (i = a0; i <= a1; i++) mx = Math.max(mx, val(i));
    view.ymax += (Math.max(60, Math.ceil(mx * 1.12 / 25) * 25) - view.ymax) * k;
    var L = C.narrow ? 40 : 76, R = C.narrow ? 14 : 64, T = (card.hidden ? 0 : card.offsetHeight + 24) + (C.narrow ? 34 : 44), B = h - 34;
    var X = function (q) { return L + (q - view.a) / (view.b - view.a) * (w - L - R); }, Y = function (v) { return B - v / view.ymax * (B - T); };
    var end = Math.min(a1, Math.floor(head));
    c.clearRect(0, 0, w, h);
    var step = view.ymax > 160 ? 50 : 25; font(c, C.narrow ? 9 : 10.5, 500); c.textBaseline = 'middle';
    for (var gv = step; gv < view.ymax; gv += step) { var gy = Y(gv); c.fillStyle = '#1c2125'; c.fillRect(L, Math.round(gy), w - L - R, 1); c.fillStyle = MIST; c.textAlign = 'right'; c.fillText('$' + gv, L - 10, gy); }
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    var pxy = (w - L - R) / ((view.b - view.a) / 12), ys = pxy > 70 ? 1 : pxy > 26 ? 5 : 10;
    for (var yr = Math.ceil((Y0 + view.a / 12) / ys) * ys; yr <= 2026; yr += ys) { var xx = X(idx(yr, 1)); if (xx < L || xx > w - R) continue; c.fillStyle = MIST; c.fillText(String(yr), xx, h - 10); c.fillRect(Math.round(xx), B, 1, 6); }
    if (end > a0) {
      c.beginPath(); c.moveTo(X(a0), B); for (i = a0; i <= end; i++) c.lineTo(X(i), Y(val(i))); c.lineTo(X(end), B); c.closePath(); c.fillStyle = GREY; c.fill();
      c.save(); c.beginPath(); c.rect(0, 0, w, Y(30)); c.clip();
      c.beginPath(); c.moveTo(X(a0), B); for (i = a0; i <= end; i++) c.lineTo(X(i), Y(val(i))); c.lineTo(X(end), B); c.closePath(); c.fillStyle = AMBER; c.fill(); c.restore();
      c.beginPath(); for (i = a0; i <= end; i++) { var px = X(i), py = Y(val(i)); i === a0 ? c.moveTo(px, py) : c.lineTo(px, py); }
      c.strokeStyle = SNOW; c.lineWidth = C.narrow ? 2 : 2.5; c.lineJoin = 'round'; c.stroke();
    }
    var y30 = Y(30); c.fillStyle = SNOW; c.fillRect(L, Math.round(y30) - 1, w - L - R, 2);
    font(c, C.narrow ? 9 : 10.5, 500); c.textAlign = 'left'; c.textBaseline = 'middle';
    var t30 = C.narrow ? "$30 NORWAY'S COST" : "$30 · NORWAY'S COST PER BARREL", tw = c.measureText(t30).width;
    c.fillStyle = SNOW; c.fillRect(L, y30 + 1, tw + 16, 22); c.fillStyle = INK; c.fillText(t30, L + 8, y30 + 12);
    var prevX = -99, prevMy = 0, prevK = '', R0 = C.narrow ? 11 : 13;
    EV.forEach(function (e) {
      if (e.pk > head + .5) return;
      var x = X(e.pk); if (x < L - 20 || x > w - R + 20) return;
      var py = Y(val(e.pk)), on = sel === e || hov === e || (playing && lastEv === e);
      var col = e.k === 'b' ? AMBER : FLOW, my = e.k === 'b' ? py - 26 : Math.min(B - 18, py + 26), rr = on ? R0 + 5 : R0;
      if (x - prevX < R0 * 2.3 && prevK === e.k) my = e.k === 'b' ? Math.min(my, prevMy - R0 * 2.3) : Math.max(my, prevMy + R0 * 2.3);
      prevX = x; prevMy = my; prevK = e.k;
      c.fillStyle = col; c.fillRect(Math.round(x) - 1, Math.min(py, my), 2, Math.abs(my - py));
      c.beginPath(); c.arc(x, my, rr, 0, 6.283); c.fillStyle = on ? SNOW : col; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
      font(c, on ? 13 : 11, 600); c.fillStyle = INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(e.no), x, my + .5);
      e._x = x; e._y = my;
      if (on && !C.narrow) { font(c, 12, 600); c.textAlign = 'left'; var nt = e.n.toUpperCase(), nw = c.measureText(nt).width, nx = clamp(x + rr + 8, L, w - R - nw - 14); c.fillStyle = SNOW; c.fillRect(nx, my - 12, nw + 14, 24); c.fillStyle = INK; c.fillText(nt, nx + 7, my + 1); }
    });
    if (playing && end > 0) { var hx = X(end), hy = Y(val(end)); c.fillStyle = SNOW; c.beginPath(); c.arc(hx, hy, 6, 0, 6.283); c.fill(); font(c, C.narrow ? 24 : 40, 900, '"Archivo", sans-serif'); c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText(label(end).split(' ')[1], w - R, T - (C.narrow ? 30 : 42)); }
    if (hoverX != null && !playing) {
      var hi = clamp(Math.round(view.a + (hoverX - L) / (w - L - R) * (view.b - view.a)), 0, N - 1), hX = X(hi), hv = val(hi), hY = Y(hv);
      if (hX >= L && hX <= w - R) {
        c.fillStyle = 'rgba(236,239,241,.6)'; c.fillRect(Math.round(hX), T, 1, B - T);
        c.beginPath(); c.arc(hX, hY, 6, 0, 6.283); c.fillStyle = SNOW; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
        var near = null; EV.forEach(function (e) { if (Math.abs(e.pk - hi) <= 10 || (hi >= e.i && hi <= e.pk)) near = e; });
        var lines = [label(hi).toUpperCase(), money(hv) + ' a barrel', 'Norway ' + signed(hv - 30)]; if (near) lines.push(near.no + ' · ' + near.n);
        var bw2 = Math.max.apply(null, lines.map(function (l, j) { font(c, j === 1 ? 14 : 12, j === 1 ? 600 : 500); return c.measureText(l).width; })) + 26, bh = lines.length * 19 + 14;
        var bx = hX + 16 + bw2 > w - R ? hX - 16 - bw2 : hX + 16, by = clamp(hY - bh - 14, T, B - bh);
        c.fillStyle = SNOW; c.fillRect(bx, by, bw2, bh); c.fillStyle = hv >= 30 ? AMBER : FLOW; c.fillRect(bx, by, 5, bh);
        c.textAlign = 'left'; c.textBaseline = 'top';
        lines.forEach(function (l, j) { font(c, j === 1 ? 14 : 12, j === 1 ? 600 : 500); c.fillStyle = INK; c.fillText(l, bx + 14, by + 9 + j * 19); });
      }
    }
  }
  function nearMarker(x, y) { var best = null, bd = 30; EV.forEach(function (e) { if (e._x == null || e.pk > head) return; var d = Math.hypot(e._x - x, e._y - y); if (d < bd) { bd = d; best = e; } }); return best; }
  cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); hoverX = e.clientX - r.left; hov = nearMarker(e.clientX - r.left, e.clientY - r.top); cv.style.cursor = hov ? 'pointer' : 'crosshair'; });
  cv.addEventListener('pointerleave', function () { hoverX = null; hov = null; });
  cv.addEventListener('click', function (e) { var r = cv.getBoundingClientRect(), m = nearMarker(e.clientX - r.left, e.clientY - r.top); if (m) select(sel === m ? null : m); });

  /* ---------- V. the impossible dilemma ---------- */
  var dPeace = document.getElementById('dPeace'), dWealth = document.getElementById('dWealth'), dilR = document.getElementById('dilR'), dil = document.querySelector('.dil');
  var st = { peace: false, wealth: true };
  function renderDil(fromSwitch) {
    dPeace.setAttribute('aria-pressed', String(st.peace)); dWealth.setAttribute('aria-pressed', String(st.wealth));
    dilR.textContent = st.peace ? 'Lasting peace. Sanctioned producers return, prices collapse, the Nordic region grows poorer.' : st.wealth ? 'A wealthy Nordic region, in a world at war.' : 'Neither peace nor wealth.';
    if (!fromSwitch) { dil.classList.remove('shake'); void dil.offsetWidth; dil.classList.add('shake'); }
  }
  dPeace.addEventListener('click', function () { st.peace = !st.peace; if (st.peace) st.wealth = false; renderDil(); touched = true; if (st.peace) setWorld('united', 'Peace switched the world to united.'); });
  dWealth.addEventListener('click', function () { st.wealth = !st.wealth; if (st.wealth) st.peace = false; renderDil(); touched = true; if (st.wealth) setWorld('broken', 'Nordic wealth needs a broken world.'); });
  listeners.push(function (w) { st.peace = w === 'united'; st.wealth = w === 'broken'; renderDil(true); });
  renderDil(true);

  /* ---------- flips, reveals, counters ---------- */
  document.querySelectorAll('.flip').forEach(function (f) { f.addEventListener('click', function () { f.classList.toggle('on'); }); });
  document.querySelectorAll('.h2, .lead, .note, .val, .facts, .lab, .punch, .gl, .dil, .ex, .flips, .quote, .qs, .end__g, .saw__cols, .law__q').forEach(function (n) { n.classList.add('rv'); });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    var v = e.target.querySelector && e.target.querySelector('[data-count]');
    if (v && !reduce) { var to = +v.dataset.count, dec = to % 1 ? 1 : 0, t0 = performance.now();
      (function go(n) { var kk = ease((n - t0) / 1600); v.textContent = v.dataset.pre + (to * kk).toFixed(dec) + v.dataset.suf; if (kk < 1) requestAnimationFrame(go); })(t0); }
  }); }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rv, #crust, #chain').forEach(function (n) { io.observe(n); });

  /* the title always fills the width, whatever font width the browser gets */
  var ht = document.querySelector('.hero__t');
  function fitTitle() { ht.style.fontSize = ''; var cs = parseFloat(getComputedStyle(ht).fontSize), avail = ht.parentNode.clientWidth - parseFloat(getComputedStyle(ht.parentNode).paddingLeft) * 2; ht.style.fontSize = Math.min(cs * avail / ht.scrollWidth, cs * 1.6) * .985 + 'px'; }
  fitTitle(); if (document.fonts) document.fonts.ready.then(fitTitle);
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { setup(); fitTitle(); }, 120); });
  (function loop(now) { if (chartOn) frameChart(now || performance.now()); requestAnimationFrame(loop); })();
})();
