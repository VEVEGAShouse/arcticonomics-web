/* Arcticonomics v6 — one idea at a time. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AMBER = '#ffb21e', FLOW = '#6cc6ff', SNOW = '#eef1f2', GREY = '#2a3036', MIST = '#8a949b';
  var D = window.OIL, N = D.real.length, Y0 = D.start[0];
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };
  function idx(y, m) { return (y - Y0) * 12 + (m - 1); }

  /* ---------- progress, step counter, header colour ---------- */
  var steps = [].slice.call(document.querySelectorAll('main > section')), prog = document.getElementById('prog'), stepN = document.getElementById('stepN'), total = steps.length;
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight; prog.style.width = (scrollY / max * 100) + '%';
    var mid = innerHeight * .5, cur = 0;
    steps.forEach(function (s, k) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = k; });
    stepN.textContent = String(cur + 1).padStart(2, '0') + ' / ' + total;
    var tone = steps[cur].dataset.tone; document.body.classList.toggle('is-dark', tone === 'dark');
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* the title always fits the screen */
  var t1 = document.querySelector('.t1');
  function fit() { t1.style.fontSize = ''; var cs = parseFloat(getComputedStyle(t1).fontSize), avail = innerWidth * .9; if (t1.scrollWidth > avail) t1.style.fontSize = (cs * avail / t1.scrollWidth) + 'px'; }
  fit(); if (document.fonts) document.fonts.ready.then(fit); addEventListener('resize', fit);

  /* ---------- reveal each idea once ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    var v = e.target.querySelector('[data-count]');
    if (v && !reduce) { var to = +v.dataset.count, t0 = performance.now(); (function go(n) { var k = ease((n - t0) / 1800); v.textContent = v.dataset.pre + (to * k).toFixed(1) + v.dataset.suf; if (k < 1) requestAnimationFrame(go); })(t0); }
  }); }, { threshold: .35 });
  document.querySelectorAll('.s').forEach(function (s) { io.observe(s); });

  /* ---------- pick one ---------- */
  var pick = document.querySelector('.pick'), pickR = document.getElementById('pickR');
  pick.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      pick.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      pickR.textContent = b.dataset.p === 'peace' ? 'With global peace, cheap oil returns and Norway’s wealth collapses. Nobody buys Swedish weapons.' : 'With Nordic wealth, the world has to stay broken. That is the paradox.';
      pick.classList.remove('shake'); void pick.offsetWidth; pick.classList.add('shake');
    });
  });
  pickR.textContent = 'With Nordic wealth, the world has to stay broken. That is the paradox. Try the other one.';

  /* ---------- 80 years of proof ---------- */
  var EV = [
    { y: 1973, m: 10, k: 'b', t: 'Arab–Israeli war. The oil embargo.' },
    { y: 1979, m: 1, k: 'b', t: 'The Iranian revolution.' },
    { y: 1980, m: 9, k: 'b', t: 'The Iran–Iraq war.' },
    { y: 1986, m: 1, k: 'f', t: 'Price war. Everyone pumps. Oil collapses.' },
    { y: 1990, m: 8, k: 'b', t: 'Iraq invades Kuwait.' },
    { y: 2003, m: 3, k: 'b', t: 'The US invades Iraq.' },
    { y: 2006, m: 7, k: 'b', t: 'War in Lebanon. Sanctions on Iran.' },
    { y: 2008, m: 6, k: 'b', t: 'Insurgency in Nigeria’s oil delta.' },
    { y: 2011, m: 2, k: 'b', t: 'Civil war in Libya.' },
    { y: 2012, m: 7, k: 'b', t: 'Europe bans Iranian oil.' },
    { y: 2014, m: 11, k: 'f', t: 'OPEC refuses to cut. Everyone pumps.' },
    { y: 2019, m: 1, k: 'b', t: 'Sanctions on Venezuela.' },
    { y: 2020, m: 4, k: 'f', t: 'Price war, and the world stops.' },
    { y: 2022, m: 2, k: 'b', t: 'Russia invades Ukraine.' },
    { y: 2026, m: 2, k: 'b', t: 'War on Iran. Hormuz closes.' }
  ];
  EV.forEach(function (e) {
    e.i = idx(e.y, e.m); e.pk = e.i; var j;
    if (e.k === 'b') { for (j = e.i; j <= Math.min(N - 1, e.i + 13); j++) if (D.real[j] > D.real[e.pk]) e.pk = j; }
    else { for (j = e.i; j <= Math.min(N - 1, e.i + 14); j++) if (D.real[j] < D.real[e.pk]) e.pk = j; }
  });
  var proof = document.getElementById('proof'), cv = document.getElementById('chart'), C, on = false;
  var pY = document.getElementById('pY'), pEv = document.getElementById('pEv'), pEk = document.getElementById('pEk'), pEt = document.getElementById('pEt'), last = -2;
  function setup() { var R = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight, c = cv.getContext('2d'); cv.width = Math.round(w * R); cv.height = Math.round(h * R); c.setTransform(R, 0, 0, R, 0, 0); C = { c: c, w: w, h: h, narrow: w < 760 }; }
  setup(); addEventListener('resize', setup);
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(proof);
  function frame() {
    var r = proof.getBoundingClientRect(), p = clamp(-r.top / (proof.offsetHeight - innerHeight), 0, 1);
    var head = Math.max(1, Math.round(clamp(p / .92, 0, 1) * (N - 1)));
    var c = C.c, w = C.w, h = C.h, L = C.narrow ? 22 : 80, R = C.narrow ? 22 : 80;
    var T = C.narrow ? h * .3 : h * .3, B = h - (C.narrow ? 170 : 70), ymax = 215;
    var X = function (i) { return L + i / (N - 1) * (w - L - R); }, Y = function (v) { return B - v / ymax * (B - T); }, i;
    c.clearRect(0, 0, w, h);
    c.font = '500 11px "IBM Plex Mono", monospace'; c.fillStyle = MIST; c.textAlign = 'center';
    for (var y = 1950; y <= 2020; y += C.narrow ? 20 : 10) c.fillText(String(y), X(idx(y, 1)), B + 22);
    c.beginPath(); c.moveTo(X(0), B); for (i = 0; i <= head; i++) c.lineTo(X(i), Y(D.real[i])); c.lineTo(X(head), B); c.closePath(); c.fillStyle = GREY; c.fill();
    c.save(); c.beginPath(); c.rect(0, 0, w, Y(30)); c.clip();
    c.beginPath(); c.moveTo(X(0), B); for (i = 0; i <= head; i++) c.lineTo(X(i), Y(D.real[i])); c.lineTo(X(head), B); c.closePath(); c.fillStyle = AMBER; c.fill(); c.restore();
    c.beginPath(); for (i = 0; i <= head; i++) { var px = X(i), py = Y(D.real[i]); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.strokeStyle = SNOW; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke();
    var y30 = Y(30); c.fillStyle = SNOW; c.fillRect(L, Math.round(y30) - 1, w - L - R, 2);
    c.textAlign = 'left'; c.font = '500 ' + (C.narrow ? 10 : 12) + 'px "IBM Plex Mono", monospace'; c.fillStyle = SNOW; c.fillText("$30 · NORWAY'S COST", L, y30 - 10);
    c.fillStyle = AMBER; if (head > idx(1974, 1)) c.fillText('ABOVE THE LINE, NORWAY EARNS', L, y30 - 28);
    var cur = -1;
    EV.forEach(function (e, k) {
      if (e.pk > head) return; cur = k;
      var x = X(e.pk), y2 = Y(D.real[e.pk]) + (e.k === 'b' ? -14 : 14);
      c.beginPath(); c.arc(x, y2, k === cur ? 8 : 5, 0, 6.283); c.fillStyle = e.k === 'b' ? AMBER : FLOW; c.fill();
    });
    if (cur >= 0) { var e = EV[cur], ex = X(e.pk), ey = Y(D.real[e.pk]) + (e.k === 'b' ? -14 : 14); c.beginPath(); c.arc(ex, ey, 14 + Math.sin(performance.now() / 200) * 3, 0, 6.283); c.strokeStyle = e.k === 'b' ? AMBER : FLOW; c.lineWidth = 2; c.stroke(); }
    var hx = X(head), hy = Y(D.real[head]); c.beginPath(); c.arc(hx, hy, 6, 0, 6.283); c.fillStyle = SNOW; c.fill();
    pY.textContent = String(Y0 + Math.floor(head / 12));
    if (p > .96) cur = 99;
    if (cur !== last) {
      last = cur; pEv.classList.remove('pop'); void pEv.offsetWidth; pEv.classList.add('pop');
      if (cur === 99) { pEk.textContent = '80 years'; pEt.textContent = 'Every spike: a war, a revolution or a sanction.'; pEv.classList.remove('is-f'); }
      else if (cur < 0) { pEk.textContent = 'Calm'; pEt.textContent = 'Cheap oil everywhere. Norway barely matters.'; pEv.classList.remove('is-f'); }
      else { var ev = EV[cur]; pEv.classList.toggle('is-f', ev.k === 'f'); pEk.textContent = ev.y + (ev.k === 'b' ? ' · The world breaks → oil up' : ' · Everyone pumps → oil down'); pEt.textContent = ev.t; }
    }
  }
  (function loop() { if (on) frame(); requestAnimationFrame(loop); })();
})();
