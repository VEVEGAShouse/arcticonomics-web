/* Arcticonomics v4 — weight.
   Solid bars, heavy type, charts you can touch. Amber is always the same thing: Norway making money. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AMBER = '#ffb21e', FLOW = '#6cc6ff', SNOW = '#eceff1', INK = '#0a0c0e', GREY = '#2a3036', MIST = '#8a949b';
  var D = window.OIL, N = D.real.length, Y0 = D.start[0];
  var NOM = D.nominal10.map(function (v) { return v / 10; });
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function idx(y, m) { return (y - Y0) * 12 + (m - D.start[1]); }
  function label(i) { i = clamp(Math.round(i), 0, N - 1); return MON[i % 12] + ' ' + (Y0 + Math.floor(i / 12)); }
  function money(v) { v = Math.round(v); return (v < 0 ? '−$' : '$') + Math.abs(v); }
  function signed(v) { v = Math.round(v); return (v < 0 ? '−$' : '+$') + Math.abs(v); }
  function setup(cv) {
    var R = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight, c = cv.getContext('2d');
    cv.width = Math.round(w * R); cv.height = Math.round(h * R); c.setTransform(R, 0, 0, R, 0, 0);
    return { c: c, w: w, h: h, narrow: w < 760 };
  }
  function font(c, px, w, fam) { c.font = (w || 500) + ' ' + px + 'px ' + (fam || '"IBM Plex Mono", monospace'); }

  /* ---------- events ---------- */
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
  var BREAK_YEARS = {}; EV.forEach(function (e) { if (e.k === 'b') { BREAK_YEARS[e.y] = e; BREAK_YEARS[Y0 + Math.floor(e.pk / 12)] = BREAK_YEARS[Y0 + Math.floor(e.pk / 12)] || e; } });

  /* ---------- ticker ---------- */
  var tk = EV.map(function (e) { return '<span><b>' + e.y + '</b> ' + e.n + ' ' + (e.pct > 0 ? '+' : '−') + Math.abs(e.pct) + '%</span>'; }).join('');
  document.getElementById('ticker').innerHTML = tk + tk;

  /* ---------- 0. hero: one bar per year ---------- */
  var years = []; for (var y = Y0; y <= 2026; y++) { var s = 0, n = 0; for (var m = 0; m < 12; m++) { var v = D.real[(y - Y0) * 12 + m]; if (v != null) { s += v; n++; } } years.push({ y: y, v: s / n }); }
  var bars = document.getElementById('bars'), B = setup(bars), tip = document.getElementById('tip'), hoverY = -1, born = performance.now(), heroOn = true;
  function drawBars(now) {
    var c = B.c, w = B.w, h = B.h, n = years.length, gap = B.narrow ? 1 : 3, bw = (w - gap * (n - 1)) / n, max = 175;
    c.clearRect(0, 0, w, h);
    var top = 34, base = h, Yp = function (v) { return base - v / max * (base - top); };
    years.forEach(function (d, k) {
      var r = reduce ? 1 : ease(((now - born) - 500 - k * 14) / 900), x = k * (bw + gap), yy = Yp(d.v * r);
      var br = BREAK_YEARS[d.y], on = k === hoverY;
      c.fillStyle = on ? '#ffffff' : br ? AMBER : d.v >= 30 ? '#d9dee1' : '#4a545c';
      if (hoverY >= 0 && !on) c.globalAlpha = .55;
      c.fillRect(x, yy, bw, base - yy); c.globalAlpha = 1;
    });
    var y30 = Yp(30);
    c.fillStyle = INK; c.fillRect(0, y30 - 1.5, w, 3);
    font(c, B.narrow ? 9 : 10.5, 500); c.fillStyle = INK; c.textBaseline = 'bottom';
    var lab = "$30 · WHAT NORWAY'S BARREL COSTS"; var lw = c.measureText(lab).width;
    c.fillStyle = SNOW; c.fillRect(w - lw - 28, y30 - 22, lw + 16, 20); c.fillStyle = INK; c.fillText(lab, w - lw - 20, y30 - 6);
    c.textBaseline = 'alphabetic';
    font(c, B.narrow ? 9 : 10, 500);
    [1950, 1970, 1990, 2010].forEach(function (yr) { var k = yr - Y0, x = k * (bw + gap); c.fillStyle = INK; c.fillText(String(yr), x + 3, h - 8); });
  }
  function heroPick(cx) {
    var r = bars.getBoundingClientRect(), k = clamp(Math.floor((cx - r.left) / r.width * years.length), 0, years.length - 1);
    hoverY = k; var d = years[k], br = BREAK_YEARS[d.y];
    tip.innerHTML = '<b>' + d.y + '</b> · ' + money(d.v) + ' a barrel · Norway ' + signed(d.v - 30) + (br ? ' · ' + br.n : '');
    var tw = tip.offsetWidth; tip.style.transform = 'translateX(' + clamp(cx - r.left - tw / 2 - parseFloat(getComputedStyle(tip).left), -10, r.width - tw - 40) + 'px)';
  }
  bars.addEventListener('pointermove', function (e) { heroPick(e.clientX); });
  bars.addEventListener('pointerdown', function (e) { heroPick(e.clientX); });
  bars.addEventListener('pointerleave', function () { hoverY = -1; });

  /* ---------- 1. the law: move the world ---------- */
  var range = document.getElementById('price'), pV = document.getElementById('pV'), bS = document.getElementById('bS'), bN = document.getElementById('bN');
  var vS = document.getElementById('vS'), vN = document.getElementById('vN'), verdict = document.getElementById('verdict');
  var LO = -20, HI = 210, Z = (0 - LO) / (HI - LO) * 100;
  range.max = 210;
  document.querySelectorAll('.pb__bar').forEach(function (b) { b.style.setProperty('--z', Z + '%'); });
  var style = document.createElement('style'); style.textContent = '.pb__bar::before{left:' + Z + '%}'; document.head.appendChild(style);
  function setBar(el, v) {
    var wv = Math.abs(v) / (HI - LO) * 100;
    el.style.left = (v >= 0 ? Z : Z - wv) + '%'; el.style.width = wv + '%'; el.classList.toggle('neg', v < 0);
  }
  var PRE = [
    { l: '1998 · Asian crisis', i: idx(1998, 12) }, { l: '2016 · Glut', i: idx(2016, 2) }, { l: '2020 · Standstill', i: idx(2020, 4) },
    { l: '1990 · Kuwait', i: EV[4].pk, b: 1 }, { l: '2022 · Ukraine', i: EV[13].pk, b: 1 }, { l: '2026 · Hormuz', i: EV[14].pk, b: 1 }, { l: '2008 · Peak', i: EV[7].pk, b: 1 }
  ];
  var pre = document.getElementById('presets');
  PRE.forEach(function (p) {
    p.v = D.real[p.i];
    var b = document.createElement('button'); b.type = 'button'; b.textContent = p.l + ' · $' + p.v; if (p.b) b.dataset.b = 1;
    b.addEventListener('click', function () { animateTo(p.v); pre.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
    pre.appendChild(b);
  });
  function setPrice(p) {
    p = Math.round(p); range.value = p;
    range.style.setProperty('--f', ((p - range.min) / (range.max - range.min) * 100) + '%');
    pV.textContent = '$' + p;
    setBar(bS, p - 2); setBar(bN, p - 30);
    vS.textContent = signed(p - 2); vN.textContent = signed(p - 30);
    verdict.textContent = p < 30 ? 'Nobody needs the Arctic.' : p < 55 ? 'The Arctic just gets by.' : p < 100 ? 'Everyone needs the Arctic.' : 'The Arctic prints money.';
    verdict.classList.toggle('is-hot', p >= 55);
  }
  var anim = null;
  function animateTo(to) {
    cancelAnimationFrame(anim); var from = +range.value, t0 = performance.now();
    (function go(n) { var k = reduce ? 1 : ease((n - t0) / 900); setPrice(from + (to - from) * k); if (k < 1) anim = requestAnimationFrame(go); })(t0);
  }
  range.addEventListener('input', function () { cancelAnimationFrame(anim); setPrice(+range.value); pre.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); });
  setPrice(20);
  var lawDemo = false;
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !lawDemo && !reduce) { lawDemo = true; setTimeout(function () { if (+range.value === 20) { animateTo(110); setTimeout(function () { animateTo(20); }, 1700); } }, 500); }
  }, { threshold: .5 }).observe(document.querySelector('.lab'));

  /* ---------- 2. the proof: the chart you can touch ---------- */
  var cv = document.getElementById('chart'), C = setup(cv), proofOn = false;
  var card = document.getElementById('card'), cK = document.getElementById('cK'), cT = document.getElementById('cT'), cN = document.getElementById('cN');
  var chips = document.getElementById('chips'), playB = document.getElementById('play'), playI = document.getElementById('playI'), playL = document.getElementById('playL');
  var view = { a: -2, b: N + 1, ymax: 220 }, tgt = { a: -2, b: N + 1 }, mix = 1, mode = 'real', head = N - 1, playing = false, playT0 = 0, sel = null, hov = null, played = false, lastCardEv = null;
  function series(i) { i = clamp(Math.round(i), 0, N - 1); return NOM[i] + (D.real[i] - NOM[i]) * mix; }
  document.querySelectorAll('.proof .seg button').forEach(function (b) {
    b.addEventListener('click', function () { mode = b.dataset.v; document.querySelectorAll('.proof .seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); if (sel) showCard(sel); });
  });
  EV.forEach(function (e) {
    var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<b>' + e.no + '</b>' + e.y + ' ' + e.n; if (e.k === 'f') b.className = 'is-f';
    b.addEventListener('click', function () { select(sel === e ? null : e); }); e.chip = b; chips.appendChild(b);
  });
  function select(e) {
    stopPlay(); sel = e; head = N - 1;
    EV.forEach(function (x) { x.chip.setAttribute('aria-pressed', String(x === e)); });
    if (!e) { tgt.a = -2; tgt.b = N + 1; card.hidden = true; return; }
    var span = C.narrow ? 60 : 84; tgt.a = clamp(e.pk - span * .58, -2, N - span); tgt.b = tgt.a + span;
    showCard(e);
    if (C.narrow) e.chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  function showCard(e) {
    card.hidden = false;
    var r = mode === 'real', from = r ? e.from : NOM[clamp(e.i - 2, 0, N - 1)], to = r ? e.to : NOM[e.pk];
    if (!r) { var a = NOM.slice(Math.max(0, e.i - 4), e.i + 1); from = e.k === 'b' ? Math.min.apply(null, a) : Math.max.apply(null, a); }
    var pct = Math.round((to / from - 1) * 100);
    cK.textContent = e.no + ' · ' + label(e.i) + (e.k === 'b' ? ' · The world breaks' : ' · The world flows');
    cT.textContent = e.t;
    cN.innerHTML = (e.k === 'b' ? 'Oil jumped from ' : 'Oil fell from ') + '<b>' + money(from) + '</b> to <b>' + money(to) + '</b> ' + (e.k === 'b' ? 'within a year' : 'within months') + ': <b>' + (pct > 0 ? '+' : '−') + Math.abs(pct) + '%</b>.<br>Norway’s margin: <b>' + signed(to - 30) + '</b> a barrel.';
  }
  document.getElementById('cX').addEventListener('click', function () { select(null); });
  function startPlay() { select(null); playing = true; played = true; playT0 = performance.now(); head = 0; lastCardEv = null; playI.textContent = '■'; playL.textContent = 'Stop'; }
  function stopPlay() { if (!playing) return; playing = false; head = N - 1; playI.textContent = '▶'; playL.textContent = 'Play history'; if (!sel) card.hidden = true; }
  playB.addEventListener('click', function () { playing ? stopPlay() : startPlay(); });
  new IntersectionObserver(function (es) { proofOn = es[0].isIntersecting; if (proofOn && !played && !reduce) setTimeout(function () { if (!played && !sel) startPlay(); }, 400); }, { threshold: .45 }).observe(cv);

  function geo() {
    var w = C.w, h = C.h, L = C.narrow ? 40 : 76, R = C.narrow ? 14 : 64;
    var T = (card.hidden ? 0 : card.offsetHeight + 16) + (C.narrow ? 34 : 40), Bm = h - 34;
    return { L: L, R: R, T: T, B: Bm, X: function (i) { return L + (i - view.a) / (view.b - view.a) * (w - L - R); }, Y: function (v) { return Bm - v / view.ymax * (Bm - T); } };
  }
  function frameChart(now) {
    var c = C.c, w = C.w, h = C.h, k = reduce ? 1 : .12;
    mix += ((mode === 'real' ? 1 : 0) - mix) * (reduce ? 1 : .1);
    view.a += (tgt.a - view.a) * k; view.b += (tgt.b - view.b) * k;
    if (playing) {
      var p = (now - playT0) / 11000; head = clamp(p, 0, 1) * (N - 1);
      var last = null; EV.forEach(function (e) { if (e.pk <= head) last = e; });
      if (last && last !== lastCardEv) { lastCardEv = last; showCard(last); EV.forEach(function (x) { x.chip.setAttribute('aria-pressed', String(x === last)); }); }
      if (p >= 1) { playing = false; head = N - 1; playI.textContent = '▶'; playL.textContent = 'Play again'; setTimeout(function () { if (!playing && !sel) { card.hidden = true; EV.forEach(function (x) { x.chip.setAttribute('aria-pressed', 'false'); }); } }, 2600); }
    }
    var a0 = clamp(Math.floor(view.a), 0, N - 1), a1 = clamp(Math.ceil(view.b), 0, N - 1), mx = 0;
    for (var i = a0; i <= a1; i++) mx = Math.max(mx, series(i));
    var ym = Math.max(60, Math.ceil(mx * 1.12 / 25) * 25); view.ymax += (ym - view.ymax) * k;
    var G = geo(), X = G.X, Y = G.Y, end = Math.min(a1, Math.floor(head));
    c.clearRect(0, 0, w, h);
    // grid
    var step = view.ymax > 160 ? 50 : 25; font(c, C.narrow ? 9 : 10.5, 500); c.textBaseline = 'middle';
    for (var gv = step; gv < view.ymax; gv += step) { var gy = Y(gv); c.fillStyle = '#1c2125'; c.fillRect(G.L, Math.round(gy), w - G.L - G.R, 1); c.fillStyle = MIST; c.textAlign = 'right'; c.fillText('$' + gv, G.L - 10, gy); }
    // years
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    var pxy = (w - G.L - G.R) / ((view.b - view.a) / 12), ys = pxy > 70 ? 1 : pxy > 26 ? 5 : 10;
    for (var yr = Math.ceil((Y0 + view.a / 12) / ys) * ys; yr <= 2026; yr += ys) { var xx = X(idx(yr, 1)); if (xx < G.L || xx > w - G.R) continue; c.fillStyle = MIST; c.fillText(String(yr), xx, h - 10); c.fillRect(Math.round(xx), G.B, 1, 6); }
    if (end > a0) {
      // grey: the whole price
      c.beginPath(); c.moveTo(X(a0), G.B); for (i = a0; i <= end; i++) c.lineTo(X(i), Y(series(i))); c.lineTo(X(end), G.B); c.closePath();
      c.fillStyle = GREY; c.fill();
      // amber: Norway's margin above $30
      c.save(); c.beginPath(); c.rect(0, 0, w, Y(30)); c.clip();
      c.beginPath(); c.moveTo(X(a0), G.B); for (i = a0; i <= end; i++) c.lineTo(X(i), Y(series(i))); c.lineTo(X(end), G.B); c.closePath();
      c.fillStyle = AMBER; c.fill(); c.restore();
      // the line
      c.beginPath(); for (i = a0; i <= end; i++) { var px = X(i), py = Y(series(i)); i === a0 ? c.moveTo(px, py) : c.lineTo(px, py); }
      c.strokeStyle = SNOW; c.lineWidth = C.narrow ? 2 : 2.5; c.lineJoin = 'round'; c.stroke();
    }
    // the $30 line
    var y30 = Y(30); c.fillStyle = SNOW; c.fillRect(G.L, Math.round(y30) - 1, w - G.L - G.R, 2);
    font(c, C.narrow ? 9 : 10.5, 500); c.textAlign = 'left'; c.textBaseline = 'middle';
    var t30 = C.narrow ? "$30 NORWAY'S COST" : "$30 · NORWAY'S COST PER BARREL", tw = c.measureText(t30).width;
    c.fillStyle = SNOW; c.fillRect(G.L, y30 + 1, tw + 16, 22); c.fillStyle = INK; c.fillText(t30, G.L + 8, y30 + 12);
    // markers
    var prevX = -99, prevMy = 0, prevK = '', R0 = C.narrow ? 11 : 13;
    EV.forEach(function (e) {
      if (e.pk > head + .5) return;
      var x = X(e.pk); if (x < G.L - 20 || x > w - G.R + 20) return;
      var py = Y(series(e.pk)), on = sel === e || hov === e || (playing && lastCardEv === e);
      var col = e.k === 'b' ? AMBER : FLOW, my = e.k === 'b' ? py - 26 : Math.min(G.B - 18, py + 26), rr = on ? R0 + 5 : R0;
      if (x - prevX < R0 * 2.3 && prevK === e.k) my = e.k === 'b' ? Math.min(my, prevMy - R0 * 2.3) : Math.max(my, prevMy + R0 * 2.3);
      prevX = x; prevMy = my; prevK = e.k;
      c.fillStyle = col; c.fillRect(Math.round(x) - 1, Math.min(py, my), 2, Math.abs(my - py));
      c.beginPath(); c.arc(x, my, rr, 0, 6.283); c.fillStyle = on ? SNOW : col; c.fill();
      c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
      font(c, on ? 13 : 11, 600); c.fillStyle = INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(e.no), x, my + .5);
      e._x = x; e._y = my;
      if (on && !C.narrow) { font(c, 12, 600); c.textAlign = 'left'; var nt = e.n.toUpperCase(), nw = c.measureText(nt).width, nx = clamp(x + rr + 8, G.L, w - G.R - nw - 14); c.fillStyle = SNOW; c.fillRect(nx, my - 12, nw + 14, 24); c.fillStyle = INK; c.fillText(nt, nx + 7, my + 1); }
    });
    // play head
    if (playing && end > 0) { var hx = X(end), hy = Y(series(end)); c.fillStyle = SNOW; c.beginPath(); c.arc(hx, hy, 6, 0, 6.283); c.fill(); font(c, C.narrow ? 22 : 34, 900, '"Archivo", sans-serif'); c.textAlign = 'right'; c.textBaseline = 'top'; c.fillStyle = SNOW; c.fillText(label(end).split(' ')[1], w - G.R, G.T - (C.narrow ? 30 : 40)); }
    // hover readout
    if (hoverX != null && !playing) {
      var hi = clamp(Math.round(view.a + (hoverX - G.L) / (w - G.L - G.R) * (view.b - view.a)), 0, N - 1), hX = X(hi), hYv = series(hi), hY = Y(hYv);
      if (hX >= G.L && hX <= w - G.R) {
        c.fillStyle = 'rgba(236,239,241,.6)'; c.fillRect(Math.round(hX), G.T, 1, G.B - G.T);
        c.beginPath(); c.arc(hX, hY, 6, 0, 6.283); c.fillStyle = SNOW; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
        var near = null; EV.forEach(function (e) { if (Math.abs(e.pk - hi) <= 10 || (hi >= e.i && hi <= e.pk)) near = e; });
        var lines = [label(hi).toUpperCase(), money(hYv) + ' a barrel', 'Norway ' + signed(hYv - 30)]; if (near) lines.push(near.no + ' · ' + near.n);
        var bw2 = Math.max.apply(null, lines.map(function (l, j) { font(c, j === 1 ? 14 : 12, j === 1 ? 600 : 500); return c.measureText(l).width; })) + 26, bh = lines.length * 19 + 14;
        var bx = hX + 16 + bw2 > w - G.R ? hX - 16 - bw2 : hX + 16, by = clamp(hY - bh - 14, G.T, G.B - bh);
        c.fillStyle = SNOW; c.fillRect(bx, by, bw2, bh); c.fillStyle = hYv >= 30 ? AMBER : FLOW; c.fillRect(bx, by, 5, bh);
        c.textAlign = 'left'; c.textBaseline = 'top';
        lines.forEach(function (l, j) { font(c, j === 1 ? 14 : 12, j === 1 ? 600 : 500); c.fillStyle = INK; c.fillText(l, bx + 14, by + 9 + j * 19); });
      }
    }
  }
  var hoverX = null;
  function nearMarker(x, y) { var best = null, bd = 30; EV.forEach(function (e) { if (e._x == null || e.pk > head) return; var d = Math.hypot(e._x - x, e._y - y); if (d < bd) { bd = d; best = e; } }); return best; }
  cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); hoverX = e.clientX - r.left; hov = nearMarker(e.clientX - r.left, e.clientY - r.top); cv.style.cursor = hov ? 'pointer' : 'crosshair'; });
  cv.addEventListener('pointerleave', function () { hoverX = null; hov = null; });
  cv.addEventListener('click', function (e) { var r = cv.getBoundingClientRect(), m = nearMarker(e.clientX - r.left, e.clientY - r.top); if (m) select(sel === m ? null : m); });

  /* ---------- 3. scoreboard ---------- */
  var rank = document.getElementById('rank'), metric = 'pct';
  function drawRank() {
    var list = EV.filter(function (e) { return e.k === 'b'; }).map(function (e) { return { e: e, v: metric === 'pct' ? e.pct : e.to - 30 }; });
    list.sort(function (a, b) { return b.v - a.v; });
    var max = list[0].v;
    rank.innerHTML = list.map(function (d) {
      var wv = (d.v / max * 78).toFixed(1) + '%';
      return '<li><span class="y">' + d.e.y + '</span><span class="n">' + d.e.n + '</span><div class="bw" style="--w:' + wv + '"><i></i><span>' + (metric === 'pct' ? '+' + d.v + '%' : '+$' + d.v) + '</span></div></li>';
    }).join('');
    if (rank.classList.contains('in')) { rank.classList.remove('in'); void rank.offsetWidth; requestAnimationFrame(function () { rank.classList.add('in'); }); }
  }
  document.querySelectorAll('.score .seg button').forEach(function (b) {
    b.addEventListener('click', function () { metric = b.dataset.m; document.querySelectorAll('.score .seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); drawRank(); });
  });
  drawRank();

  /* ---------- ice grid ---------- */
  var iceG = document.getElementById('iceG'), cells = '';
  for (var q = 0; q < 100; q++) cells += '<i class="' + (q >= 20 ? 'on' : '') + '" style="transition-delay:' + (reduce ? 0 : (q - 20) * 14) + 'ms"></i>';
  iceG.innerHTML = cells;

  /* ---------- flips ---------- */
  document.querySelectorAll('.flip').forEach(function (f) { f.addEventListener('click', function () { f.classList.toggle('on'); }); });

  /* ---------- reveals, counters ---------- */
  document.querySelectorAll('.h2, .lead, .blk, .flip, .lab, .gl__g').forEach(function (n) { n.classList.add('rv'); });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    var v = e.target.querySelector && e.target.querySelector('[data-count]');
    if (v && !reduce) { var to = +v.dataset.count, dec = to % 1 ? 1 : 0, t0 = performance.now();
      (function go(n) { var kk = ease((n - t0) / 1600); v.textContent = v.dataset.pre + (to * kk).toFixed(dec) + v.dataset.suf; if (kk < 1) requestAnimationFrame(go); })(t0); }
  }); }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rv, #crust, #rank, #iceG').forEach(function (n) { io.observe(n); });

  /* ---------- loop ---------- */
  new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; }).observe(bars);
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { B = setup(bars); C = setup(cv); }, 120); });
  (function loop(now) {
    now = now || performance.now();
    if (heroOn) drawBars(now);
    if (proofOn) frameChart(now);
    requestAnimationFrame(loop);
  })();
})();
