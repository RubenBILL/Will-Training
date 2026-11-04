/* Will Training : écrans */
(function () {
'use strict';
const W = window.WT, C = W.core;
const V = {};
const ui = { exKey: null, nutDate: null, bodyDay: null, mmaLvl: 2 };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sv = (d, o) => { o = o || {}; const z = o.size || 22; return '<svg width="' + z + '" height="' + z + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (o.sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
const IC = {
  back: sv('<path d="M15 6l-6 6 6 6"/>'),
  arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  check: sv('<path d="M5 12.5l4.5 4.5L19 7"/>', { sw: 3 }),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  swap: sv('<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>'),
  trophy: sv('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8"/>', { size: 28 }),
  trash: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  camera: sv('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  flame: sv('<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>')
};
const ill = (id, size, label) => '<svg class="ill" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="' + esc(label || '') + '">' + W.SVGS[id] + '</svg>';
const bar = (pct, color) => '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%;background:' + (color || 'var(--acc)') + '"></i></div>';
const top = (kicker, title, sub, right) => '<header class="top"><div><div class="kicker">' + kicker + '</div><h1 class="title">' + title + '</h1>' + (sub ? '<div class="muted">' + sub + '</div>' : '') + '</div>' + (right || '') + '</header>';
const backLink = (href, label) => '<a class="back" href="' + href + '">' + IC.back + (label || 'Accueil') + '</a>';
const emptyMsg = (t) => '<div class="empty">' + t + '</div>';

function nextTrainingDay(from) {
  for (let i = 1; i <= 7; i++) {
    const d = C.addDays(from, i), dk = C.dayKeyOf(d);
    if (dk && dk !== 'sam') { return { date: d, dk: dk }; }
  }
  return null;
}
const lastBody = (field) => { const a = C.st().body.filter((b) => b[field] != null); return a.length ? a[a.length - 1] : null; };
const firstBody = (field) => { const a = C.st().body.filter((b) => b[field] != null); return a.length ? a[0] : null; };

/* ---------- Graphique ---------- */
function lineChart(pts, o) {
  o = o || {};
  if (!pts.length) { return emptyMsg(o.empty || 'Pas encore de données.'); }
  const Wd = 320, H = 170, pl = 38, pr = 14, pt = 14, pb = 28;
  let vals = pts.map((p) => p.v);
  if (o.target != null) { vals = vals.concat([o.target]); }
  let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
  const x = (i) => (pts.length === 1 ? pl + (Wd - pl - pr) / 2 : pl + (Wd - pl - pr) * i / (pts.length - 1));
  const y = (v) => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo));
  let g = '';
  for (let k = 0; k < 3; k++) {
    const v = lo + (hi - lo) * k / 2, yy = y(v);
    g += '<line x1="' + pl + '" x2="' + (Wd - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="#2A2F36" stroke-width="1"/><text x="' + (pl - 6) + '" y="' + (yy + 4) + '" text-anchor="end" fill="#A7ADB5" font-size="11">' + C.fmt(Math.round(v * 10) / 10) + '</text>';
  }
  let t = '';
  if (o.target != null) {
    const yy = y(o.target);
    t = '<line x1="' + pl + '" x2="' + (Wd - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="#7CC8FF" stroke-width="1.5" stroke-dasharray="5 4"/><text x="' + (Wd - pr) + '" y="' + (yy - 5) + '" text-anchor="end" fill="#7CC8FF" font-size="11">' + esc(o.targetLabel || 'Objectif') + '</text>';
  }
  const path = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ');
  const dots = pts.map((p, i) => '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="4" fill="#FF6B2C"/>').join('');
  const xl = '<text x="' + pl + '" y="' + (H - 6) + '" fill="#A7ADB5" font-size="11">' + esc(pts[0].l) + '</text>' + (pts.length > 1 ? '<text x="' + (Wd - pr) + '" y="' + (H - 6) + '" text-anchor="end" fill="#A7ADB5" font-size="11">' + esc(pts[pts.length - 1].l) + '</text>' : '');
  return '<svg class="chart" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="' + esc(o.label || 'Graphique') + '">' + g + t + (pts.length > 1 ? '<path d="' + path + '" fill="none" stroke="#FF6B2C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' : '') + dots + xl + '</svg>';
}

/* ---------- Accueil ---------- */
V.home = function () {
  const S = C.st(), t = C.today(), week = C.weekNum(t), dk = C.dayKeyOf(t), mon = C.mondayOf(t);
  const done = C.dayDone(t), minutes = { mar: 70, jeu: 75, ven: 80, sam: 25 };
  let main = '';
  if (S.session) {
    const d = C.dayDef(S.session.day);
    main = '<section class="card hero"><div class="kicker orange">Séance en cours</div><h2 class="h2">' + d.title + '</h2><div class="muted">Exercice ' + (S.session.cur + 1) + ' sur ' + d.ex.length + '</div><a class="btn primary" href="#/session">Reprendre la séance ' + IC.arrow + '</a></section>';
  } else if (dk && !done) {
    const d = C.dayDef(dk);
    main = '<section class="card hero"><div class="kicker orange">' + (dk === 'sam' ? 'Bonus facultatif' : 'Séance du jour') + '</div><h2 class="h2">' + d.title + '</h2><div class="muted">' + d.note + '</div><div class="muted">' + d.ex.length + ' exercices · environ ' + minutes[dk] + ' min</div><a class="btn primary" href="#/warmup/' + dk + '">Je suis à la salle ' + IC.arrow + '</a><button class="btn link" data-a="startdirect" data-day="' + dk + '">Aller directement à la séance</button></section>';
  } else if (dk && done) {
    const nx = nextTrainingDay(t);
    main = '<section class="card hero"><div class="kicker orange">Séance faite</div><h2 class="h2">Bien joué, ' + esc(S.name) + '</h2><div class="muted">' + (nx ? 'Prochaine séance : ' + C.dateFr(nx.date) + ' · ' + C.dayDef(nx.dk).title : 'Repos mérité.') + '</div></section>';
  } else {
    const nx = nextTrainingDay(t);
    main = '<section class="card hero"><div class="kicker ice">Jour de repos</div><h2 class="h2">Aucun sport aujourd’hui</h2><div class="muted">Mange, dors, étire-toi. C’est là que le muscle se construit.' + (nx ? ' Prochaine séance : ' + C.dateFr(nx.date) + '.' : '') + '</div><a class="btn light" href="#/rest">Ouvrir ma check-list</a></section>';
  }
  const letters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  let strip = '';
  for (let i = 0; i < 7; i++) {
    const date = C.addDays(mon, i), wd = C.parse(date).getDay(), dkk = C.dayKeyOf(date), dn = C.dayDone(date), isT = date === t;
    let cls = 'off';
    if (dn) { cls = 'done'; } else if (isT) { cls = 'today'; } else if (date < S.startDate) { cls = 'off'; } else if (dkk && dkk !== 'sam') { cls = date < t ? 'miss' : 'plan'; } else if (dkk === 'sam') { cls = 'opt'; }
    strip += '<div class="wd ' + cls + '"><span class="wl">' + letters[i] + '</span><span class="wc">' + (dn ? IC.check : (dkk ? '<b>' + C.dayDef(dkk).short.slice(0, 3) + '</b>' : '–')) + '</span><span class="wm">' + (W.MMA[wd] ? 'MMA' : '&nbsp;') + '</span></div>';
  }
  const w0 = firstBody('weight'), w1 = lastBody('weight'), a0 = firstBody('armF'), a1 = lastBody('armF');
  const wPct = w1 && w0 ? ((w1.weight - w0.weight) / (70 - w0.weight)) * 100 : 0;
  const end = C.addDays(S.startMonday, 8 * 7 - 1), left = C.diffDays(t, end);
  const dueW = [4, 8].map((n) => ({ n: n, date: C.addDays(S.startMonday, n * 7 - 1) })).find((x) => x.date >= t);
  const sc = C.weekSessionCount(mon), need = week === 1 ? 2 : 3, stk = C.streak();
  const nm = C.nextMma();
  let mmaCard = '';
  if (nm) {
    const gymDay = C.dayKeyOf(nm.date);
    mmaCard = '<section class="card"><div class="kicker ice">Prochain cours de MMA</div><div class="h3">' + C.cap(C.dateFr(nm.date)) + ' · ' + nm.c.label + '</div><div class="muted">' + nm.c.lieu + (gymDay && gymDay !== 'sam' ? ' · séance de salle à finir avant 18 h 30' : '') + '</div><a class="btn ghost" href="#/mma">Noter un cours</a></section>';
  }
  return '<div class="screen">' + top(C.cap(C.dateFr(t)) + ' · Semaine ' + week, 'Salut ' + esc(S.name), '', '<a class="iconbtn" href="#/settings" aria-label="Réglages">' + IC.gear + '</a>') +
    (C.isDeload(week) ? '<div class="banner ice">Semaine de décharge : une série de moins par exercice et des charges un peu plus légères. Tu récupères pour mieux repartir.</div>' : '') +
    main +
    '<section class="card"><div class="split"><span class="h3">Cette semaine</span><span class="muted">' + sc + ' / ' + need + ' séances</span></div><div class="strip">' + strip + '</div></section>' +
    '<section class="card"><div class="kicker">Tes objectifs</div>' +
    '<div class="goal"><div class="split"><span>Poids</span><span class="num">' + (w1 ? C.fmt(w1.weight) : '–') + ' <small>sur 70 kg</small></span></div>' + bar(wPct) + '</div>' +
    '<div class="goal"><div class="split"><span>Bras contracté</span><span class="num">' + (a1 ? C.fmt(a1.armF) : '–') + ' <small>cm' + (a0 ? ' · départ ' + C.fmt(a0.armF) : '') + '</small></span></div></div>' +
    '<div class="split"><span>Fin du programme (semaine 8)</span><span class="num">' + (left >= 0 ? 'J-' + left : 'terminé') + '</span></div>' +
    (dueW ? '<div class="muted">Prochaine mesure : semaine ' + dueW.n + ' (' + C.dateFr(dueW.date) + ')</div>' : '') +
    '<a class="btn ghost" href="#/body">Mesures et photos</a></section>' +
    '<section class="card streak"><div class="flame">' + IC.flame + '</div><div><div class="num big">' + stk + ' semaine' + (stk > 1 ? 's' : '') + '</div><div class="muted">de suite avec toutes tes séances. ' + (stk ? 'Ne casse pas la série.' : 'Commence la série cette semaine.') + '</div></div></section>' +
    mmaCard +
    '<a class="btn light" href="#/week">Bilan de la semaine</a></div>';
};

/* ---------- Échauffement ---------- */
V.warmup = function (dk) {
  const S = C.st(), d = C.dayDef(dk), steps = C.warmupSteps(dk);
  if (!S.warm || S.warm.day !== dk || S.warm.done.length !== steps.length) { S.warm = { day: dk, done: steps.map(() => false) }; C.save(); }
  const dn = S.warm.done, cnt = dn.filter(Boolean).length, all = cnt === steps.length;
  const list = steps.map((s, i) => '<div class="step ' + (dn[i] ? 'on' : '') + '"><div class="stepill">' + ill(s.ill, 72, s.name) + '</div><div class="stepbody"><div class="kicker ice">' + s.amount + '</div><div class="h4">' + s.name + '</div><div class="muted sm">' + s.detail + '</div></div><button class="round ' + (dn[i] ? 'on' : '') + '" data-a="warmToggle" data-i="' + i + '" aria-pressed="' + dn[i] + '" aria-label="' + (dn[i] ? 'Étape faite : ' : 'Valider : ') + esc(s.name) + '">' + IC.check + '</button></div>').join('');
  return '<div class="screen">' + backLink('#/home') + top('Tu es à la salle · ' + d.name, 'Échauffement', 'Environ 10 min. Valide chaque étape quand elle est faite.') +
    '<div class="progress"><div class="split"><b>' + cnt + ' / ' + steps.length + ' étapes</b><span class="muted">' + d.title + '</span></div>' + bar(cnt / steps.length * 100) + '</div>' +
    list +
    '<div class="tip">' + '<span class="chev">›</span><span>Poignet gauche : fais les cercles et l’étirement lentement, sans forcer, et mets ta protection de poignet pour les tirages.</span></div>' +
    (all ? '<button class="btn primary" data-a="startdirect" data-day="' + dk + '">Lancer la séance ' + IC.arrow + '</button>' : '<button class="btn dashed" disabled>Encore ' + (steps.length - cnt) + ' à valider pour lancer la séance</button><button class="btn link" data-a="startdirect" data-day="' + dk + '">Passer l’échauffement</button>') +
    '</div>';
};

/* ---------- Séance : aperçu ---------- */
function sessionOverview(dk) {
  const S = C.st(), t = C.today(), week = C.weekNum(t), d = C.dayDef(dk);
  const tabs = ['mar', 'jeu', 'ven', 'sam'].map((k) => '<a class="tab ' + (k === dk ? 'on' : '') + '" href="#/session/' + k + '" aria-current="' + (k === dk ? 'true' : 'false') + '">' + C.dayDef(k).short + '</a>').join('');
  const rows = d.ex.map((e) => {
    const n = C.setsFor(e, week, dk), l = e.bw ? 'Poids du corps' : e.pre + C.fmt(C.plannedLoad(e, week)) + ' kg' + (e.hand ? ' par main' : '');
    return '<div class="ovrow">' + ill(e.ill, 52, e.n) + '<div class="ovtxt"><div class="h4">' + e.n + '</div><div class="muted sm">' + n + ' × ' + C.rangeText(e) + ' · ' + l + '</div>' + (e.tag ? '<div class="pill">' + e.tag + '</div>' : '') + '</div></div>';
  }).join('');
  const fat = C.fatigueNote();
  return '<div class="screen">' + top(d.name + ' · Semaine ' + week, d.title, d.note) +
    '<nav class="tabs" aria-label="Choisir la séance">' + tabs + '</nav>' +
    (C.isDeload(week) ? '<div class="banner ice">Semaine de décharge : moins de séries, charges allégées, pas de montée.</div>' : '') +
    (fat ? '<div class="banner warn">' + fat + '</div>' : '') +
    '<section class="card">' + rows + '</section>' +
    '<a class="btn primary" href="#/warmup/' + dk + '">Je suis à la salle ' + IC.arrow + '</a>' +
    '<button class="btn link" data-a="startdirect" data-day="' + dk + '">Démarrer sans échauffement</button></div>';
}

/* ---------- Séance : guidée ---------- */
function timerHtml() {
  const t = C.st().timer;
  if (!t) { return ''; }
  const left = C.timerLeft(), done = left === 0 && t.paused == null;
  const pct = t.total ? Math.round((t.total - left) / t.total * 100) : 0;
  return '<div id="rt-card" class="rest ' + (done ? 'end' : '') + '"><div class="split"><span id="rt-label" class="kicker ' + (done ? 'orange' : 'ice') + '">' + (done ? 'Repos terminé · série suivante' : (t.paused != null ? 'Repos en pause' : 'Repos en cours')) + '</span><span id="rt-time" class="rtime">' + C.mmss(left) + '</span></div><div id="rt-bar">' + bar(pct, done ? 'var(--acc)' : 'var(--ice)') + '</div><div class="grid4"><button class="btn mini" data-a="tAdj" data-d="-15">−15 s</button><button class="btn mini" data-a="tAdj" data-d="15">+15 s</button><button id="rt-toggle" class="btn mini" data-a="tToggle">' + (t.paused != null ? 'Reprendre' : (done ? 'Relancer' : 'Pause')) + '</button><button class="btn mini light" data-a="tSkip">Passer</button></div></div>';
}
V.timerHtml = timerHtml;

function sessionActive() {
  const S = C.st(), se = S.session, def = C.dayDef(se.day), list = def.ex, i = se.cur, e = list[i], s = se.ex[i], f = C.eff(e, s);
  const used = s.sw === 'used', allDone = s.done.every(Boolean), allTop = s.reps.every((r) => r >= e.hi), deload = C.isDeload(se.week);
  let missing = 0; s.reps.forEach((r) => { if (r < e.hi) { missing += e.hi - r; } });
  const hiText = e.ru === 'm' ? e.hi + ' m' : e.hi + ' rép.';
  const hiLong = e.ru === 'm' ? e.hi + ' m' : e.hi + ' répétitions';
  const nextLoad = e.bw ? '' : f.pre + C.fmt(C.round1(f.w + f.step)) + ' kg';
  let ds = 0, ts = 0; se.ex.forEach((x) => { ts += x.done.length; x.done.forEach((d) => { if (d) { ds++; } }); });
  const noteKey = e.key + (used ? ':alt' : '');
  const fat = C.fatigueNote();
  const goal = e.bw ? 'Aujourd’hui : même hauteur, ' + e.hi + ' sauts propres par série.' : 'Aujourd’hui : ' + C.loadText(e, f) + ', vise ' + hiLong + ' sur chaque série, puis on monte.';
  const tips = used ? ['Même muscle, autre matériel.', 'Pas d’historique : commence plus léger et ajuste.'] : e.tips;

  const sets = s.reps.map((r, j) => '<div class="setrow ' + (s.done[j] ? 'on' : '') + '"><span class="sn">S' + (j + 1) + '</span><button class="sq" data-a="repAdj" data-i="' + i + '" data-j="' + j + '" data-d="-' + e.rs + '" aria-label="Une répétition de moins, série ' + (j + 1) + '">−</button><div class="sv"><span class="svn ' + (r >= e.hi ? 'hit' : '') + '">' + r + '</span><span class="sunit">' + e.ru + '</span></div><button class="sq" data-a="repAdj" data-i="' + i + '" data-j="' + j + '" data-d="' + e.rs + '" aria-label="Une répétition de plus, série ' + (j + 1) + '">+</button><button class="sc ' + (s.done[j] ? 'on' : '') + '" data-a="setToggle" data-i="' + i + '" data-j="' + j + '" aria-pressed="' + s.done[j] + '" aria-label="Série ' + (j + 1) + (s.done[j] ? ' validée' : ' à valider') + '">' + IC.check + '</button></div>').join('');

  let swap = '';
  if (s.sw === 'none') { swap = '<button class="btn dashed" data-a="swapOpen" data-i="' + i + '">' + IC.swap + 'Machine prise ? Voir un équivalent</button>'; }
  if (s.sw === 'open') { swap = '<div class="swap"><div class="kicker ice">Équivalent proche</div><div class="h3">' + e.alt.n + '</div><div class="muted sm">Même muscle, autre matériel. Charge de départ conseillée : ' + (e.bw ? 'poids du corps' : C.fmt(s.wa) + ' kg') + '. C’est un nouvel exercice, reste léger sur la première série.</div><div class="grid2"><button class="btn primary mini" data-a="swapUse" data-i="' + i + '">Utiliser</button><button class="btn ghost mini" data-a="swapKeep" data-i="' + i + '">Garder l’original</button></div></div>'; }
  if (used) { swap = '<div class="swapused"><span>Remplace : <b>' + e.n + '</b></span><button class="btn ghost mini" data-a="swapRevert" data-i="' + i + '">Revenir</button></div>'; }

  let result = '';
  if (allDone && !e.bw) {
    if (deload) { result = '<div class="res stay">Semaine de décharge : on garde <b>' + C.loadText(e, f) + '</b>, sans monter. Fais les répétitions proprement.</div>'; }
    else if (allTop) { result = '<div class="res bravo"><div class="rtrophy">' + IC.trophy + '</div><div><div class="rtitle">Bravo !</div><div class="rtext">Tu as atteint ' + hiLong + ' sur toutes les séries. Prochaine séance : passe à ' + nextLoad + '.</div></div></div>'; }
    else { result = '<div class="res stay">On reste à <b>' + C.loadText(e, f) + '</b>. Il t’a manqué ' + missing + (missing > 1 ? ' répétitions' : ' répétition') + ' pour atteindre ' + hiLong + ' partout. Vise-les la prochaine fois, puis on monte.</div>'; }
  } else if (allDone && e.bw) {
    result = '<div class="res stay">Exercice terminé. Garde la même hauteur de caisse et cherche des réceptions propres et silencieuses.</div>';
  }

  const rows = list.map((x, k) => {
    const sx = se.ex[k], fx = C.eff(x, sx), dn = sx.done.every(Boolean);
    return '<button class="lrow ' + (k === i ? 'cur' : '') + '" data-a="exSel" data-i="' + k + '" aria-label="Aller à : ' + esc(fx.name) + '"><span class="dot ' + (dn ? 'on' : '') + '">' + (dn ? IC.check : '') + '</span><span class="lname">' + fx.name + '</span><span class="lsub">' + sx.done.length + ' × ' + C.rangeText(x) + ' · ' + C.loadText(x, fx) + '</span></button>';
  }).join('');

  const last = i === list.length - 1;
  return '<div class="screen">' + backLink('#/home') +
    top(def.name + ' · Semaine ' + se.week, def.title, '') +
    '<div class="progress"><div class="split"><b>Exercice ' + (i + 1) + ' sur ' + list.length + '</b><span class="muted">' + ds + ' / ' + ts + ' séries</span></div>' + bar(ds / ts * 100) + '</div>' +
    (fat ? '<div class="banner warn">' + fat + '</div>' : '') +
    '<section class="card ex">' +
    '<div class="illbox">' + ill(f.ill, 210, f.name) + '</div>' +
    '<div class="exhead">' + (e.tag ? '<span class="pill">' + e.tag + '</span>' : '') + '<h2 class="exname">' + f.name + '</h2><div class="muscle"><i></i>' + e.mu + '</div><div class="h4">' + e.sets + ' × ' + C.rangeText(e) + ' · ' + (e.rest > 0 ? 'repos ' + C.humanSec(e.rest) : 'enchaîne tout de suite') + '</div></div>' +
    '<div class="last"><span class="lclock">' + IC.clock + '</span><div><div class="kicker ice">Dernière fois</div><div class="lt">' + C.lastText(e, f) + '</div><div class="muted sm">' + goal + '</div></div></div>' +
    '<div class="tips">' + tips.map((x) => '<div class="tipline"><span class="chev">›</span><span>' + x + '</span></div>').join('') + '</div>' +
    '<div class="notebox"><label for="note" class="muted sm">Notes (réglage de machine, siège, hauteur…)</label><textarea id="note" data-note="' + noteKey + '" rows="2" placeholder="Ex. siège 4, pupitre en haut">' + esc(S.notes[noteKey] || '') + '</textarea></div>' +
    swap +
    (e.bw ? '' : '<div class="loadrow"><div><div class="muted sm">' + (f.hand ? 'Charge par main' : 'Charge') + '</div><div class="muted xs">Plan, semaine ' + se.week + '</div></div><div class="stepper"><button class="sq big" data-a="loadAdj" data-i="' + i + '" data-d="-1" aria-label="Diminuer la charge">−</button><span class="lv">' + C.loadText(e, f) + '</span><button class="sq big" data-a="loadAdj" data-i="' + i + '" data-d="1" aria-label="Augmenter la charge">+</button></div></div>') +
    '<div class="sets"><div class="split"><span class="muted sm">Répétitions faites</span><span class="muted xs">Objectif : ' + hiText + '</span></div>' + sets + '</div>' +
    timerHtml() + result +
    (last ? '<button class="btn light" data-a="finish">Terminer la séance</button>' : '<button class="btn light" data-a="exNext">Exercice suivant ' + IC.arrow + '</button>') +
    '</section>' +
    '<section class="list"><h3 class="h3">Toute la séance</h3>' + rows + '</section>' +
    '<button class="btn light" data-a="finish">Terminer la séance</button>' +
    '<button class="btn link danger" data-a="abandon">Abandonner la séance</button></div>';
}

V.session = function (param) {
  const S = C.st();
  if (S.session) { return sessionActive(); }
  const dk = (param && W.DAYS[param]) ? param : (C.dayKeyOf(C.today()) || nextTrainingDay(C.today()).dk);
  return sessionOverview(dk);
};

/* ---------- Bilan de séance ---------- */
V.summary = function () {
  const sm = C.st().lastSummary;
  if (!sm) { return '<div class="screen">' + backLink('#/home') + emptyMsg('Aucune séance terminée.') + '</div>'; }
  const nx = nextTrainingDay(C.today());
  const recs = sm.recs.map((r) => '<li><b>' + esc(r.name) + '</b> : ' + r.pre + C.fmt(r.w) + ' kg × ' + r.reps + (r.ru === 'm' ? ' m' : '') + '</li>').join('');
  const ups = sm.ups.map((u) => '<li><b>' + esc(u.name) + '</b> : ' + u.pre + C.fmt(u.from) + ' → ' + u.pre + C.fmt(u.to) + ' kg</li>').join('');
  return '<div class="screen">' + top('Séance terminée', sm.saved ? 'Bien joué, ' + esc(C.st().name) : 'Séance non enregistrée', C.cap(C.dateFr(sm.date)) + ' · Semaine ' + sm.week) +
    (sm.saved ? '<section class="card"><div class="stats"><div><div class="num big">' + sm.setsDone + '</div><div class="muted sm">séries sur ' + sm.setsTotal + '</div></div><div><div class="num big">' + sm.minutes + '</div><div class="muted sm">minutes</div></div><div><div class="num big">' + sm.recs.length + '</div><div class="muted sm">record' + (sm.recs.length > 1 ? 's' : '') + '</div></div></div></section>' : '<div class="banner ice">Aucune série n’était validée, donc rien n’a été enregistré.</div>') +
    (sm.recs.length ? '<section class="card"><div class="kicker orange">Nouveaux records</div><ul class="ul">' + recs + '</ul></section>' : '') +
    (sm.ups.length ? '<section class="card"><div class="kicker orange">À la prochaine séance, tu montes</div><ul class="ul">' + ups + '</ul></section>' : '') +
    (nx ? '<section class="card"><div class="kicker ice">Prochaine séance</div><div class="h3">' + C.cap(C.dateFr(nx.date)) + '</div><div class="muted">' + C.dayDef(nx.dk).title + '</div></section>' : '') +
    '<a class="btn primary" href="#/home">Retour à l’accueil</a></div>';
};

/* ---------- Progrès ---------- */
V.progress = function () {
  const S = C.st(), t = C.today(), week = C.weekNum(t), mon = C.mondayOf(t);
  const exs = [];
  ['mar', 'jeu', 'ven', 'sam'].forEach((dk) => { C.dayDef(dk).ex.forEach((e) => { if (!e.bw) { exs.push({ dk: dk, e: e }); } }); });
  if (!ui.exKey) { ui.exKey = 'ven_pullup'; }
  const opts = ['mar', 'jeu', 'ven', 'sam'].map((dk) => '<optgroup label="' + C.dayDef(dk).name + '">' + exs.filter((x) => x.dk === dk).map((x) => '<option value="' + x.e.key + '"' + (x.e.key === ui.exKey ? ' selected' : '') + '>' + esc(x.e.n) + '</option>').join('') + '</optgroup>').join('');
  const sel = exs.find((x) => x.e.key === ui.exKey) || exs[0];
  const pts = [];
  S.history.forEach((h) => { h.items.forEach((it) => { if (it.key === sel.e.key) { pts.push({ v: it.w, l: C.dateShort(h.date) }); } }); });
  const wpts = S.body.filter((b) => b.weight != null).map((b) => ({ v: b.weight, l: C.dateShort(b.date) }));
  const apts = S.body.filter((b) => b.armF != null).map((b) => ({ v: b.armF, l: C.dateShort(b.date) }));
  const best = {};
  S.history.forEach((h) => { h.items.forEach((it) => { if (it.bw) { return; } const k = it.key + (it.alt ? ':alt' : ''); it.reps.forEach((r) => { const sc = it.w * (1 + r / 30); if (!best[k] || sc > best[k].sc) { best[k] = { sc: sc, name: it.name, w: it.w, pre: it.pre || '', r: r, date: h.date, ru: it.key === 'ven_farmer' }; } }); }); });
  const recList = Object.keys(best).map((k) => best[k]).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8).map((b) => '<div class="split recrow"><span>' + esc(b.name) + '</span><span class="num">' + b.pre + C.fmt(b.w) + ' kg × ' + b.r + (b.ru ? ' m' : '') + '</span></div>').join('');
  const hist = S.history.slice(-6).reverse().map((h) => '<div class="split recrow"><span>' + C.cap(C.dateFr(h.date)) + '</span><span class="muted">' + h.setsDone + ' séries</span></div>').join('');
  const stk = C.streak(), sc = C.weekSessionCount(mon), need = week === 1 ? 2 : 3;
  const last = pts.length ? pts[pts.length - 1].v : null;
  return '<div class="screen">' + top('Semaine ' + week + ' sur 8', 'Progrès', '') +
    '<section class="card"><div class="split"><div><div class="num big">' + stk + '</div><div class="muted sm">semaine' + (stk > 1 ? 's' : '') + ' de suite</div></div><div class="ralign"><div class="num big">' + sc + ' / ' + need + '</div><div class="muted sm">séances cette semaine</div></div></div></section>' +
    '<section class="card"><div class="split"><span class="h3">Charge par exercice</span></div><label class="sr" for="exsel">Choisir un exercice</label><select id="exsel" class="select" data-change="exsel">' + opts + '</select>' + lineChart(pts, { label: 'Évolution de la charge : ' + sel.e.n, empty: 'Aucune séance enregistrée pour cet exercice.' }) + (last != null ? '<div class="muted sm">Dernière charge : ' + (sel.e.pre || '') + C.fmt(last) + ' kg' + (sel.e.hand ? ' par main' : '') + '</div>' : '') + '</section>' +
    '<section class="card"><span class="h3">Poids</span>' + lineChart(wpts, { target: 70, targetLabel: 'Objectif 70 kg', label: 'Évolution du poids' }) + '<div class="muted sm">Pèse-toi le matin à jeun, regarde la moyenne de la semaine.</div></section>' +
    '<section class="card"><span class="h3">Bras contracté (cm)</span>' + lineChart(apts, { label: 'Évolution du tour de bras contracté' }) + '</section>' +
    '<section class="card"><span class="h3">Records</span>' + (recList || emptyMsg('Tes records apparaîtront après ta première séance.')) + '</section>' +
    '<section class="card"><span class="h3">Dernières séances</span>' + (hist || emptyMsg('Aucune séance enregistrée.')) + '</section></div>';
};

/* ---------- Corps ---------- */
function mannequin(lv) {
  const F = (m) => (lv[m] === 2 ? '#FF6B2C' : (lv[m] === 1 ? '#A04A22' : '#2C3239'));
  const S = ' stroke="#171A1F" stroke-width="1.5"';
  const base = '<ellipse cx="100" cy="30" rx="16" ry="19" fill="#2C3239"/><rect x="92" y="46" width="16" height="18" rx="4" fill="#2C3239"/><path d="M70 72 Q100 62 130 72 L138 92 Q134 130 126 152 L122 196 Q100 204 78 196 L74 152 Q66 130 62 92 Z" fill="#2C3239"/>';
  const arms = (m) => '<path d="M44 118 Q40 138 42 158 L58 160 Q62 140 60 120 Z" fill="' + F(m) + '"' + S + '/><path d="M156 118 Q160 138 158 158 L142 160 Q138 140 140 120 Z" fill="' + F(m) + '"' + S + '/>';
  const fore = '<path d="M42 162 L58 164 Q58 190 54 214 L44 214 Q40 190 42 162 Z" fill="' + F('forearms') + '"' + S + '/><path d="M158 162 L142 164 Q142 190 146 214 L156 214 Q160 190 158 162 Z" fill="' + F('forearms') + '"' + S + '/><circle cx="49" cy="224" r="6" fill="#2C3239"/><circle cx="151" cy="224" r="6" fill="#2C3239"/>';
  const delts = '<path d="M62 80 Q50 82 44 96 Q42 112 50 122 L62 118 Q68 100 70 84 Z" fill="' + F('delts') + '"' + S + '/><path d="M138 80 Q150 82 156 96 Q158 112 150 122 L138 118 Q132 100 130 84 Z" fill="' + F('delts') + '"' + S + '/>';
  const feet = '<ellipse cx="86" cy="368" rx="10" ry="5" fill="#2C3239"/><ellipse cx="114" cy="368" rx="10" ry="5" fill="#2C3239"/>';
  let absr = '';
  [126, 141, 156, 171].forEach((yy) => { absr += '<rect x="88" y="' + yy + '" width="10" height="12" rx="3" fill="' + F('abs') + '"/><rect x="102" y="' + yy + '" width="10" height="12" rx="3" fill="' + F('abs') + '"/>'; });
  const front = '<g>' + base + arms('biceps') + fore +
    '<path d="M99 86 L72 88 Q68 104 76 118 Q90 126 99 118 Z" fill="' + F('pecs') + '"' + S + '/><path d="M101 86 L128 88 Q132 104 124 118 Q110 126 101 118 Z" fill="' + F('pecs') + '"' + S + '/>' +
    '<path d="M74 126 Q70 160 78 192 L86 190 L86 128 Z" fill="' + F('abs') + '"' + S + '/><path d="M126 126 Q130 160 122 192 L114 190 L114 128 Z" fill="' + F('abs') + '"' + S + '/>' + absr + delts +
    '<path d="M76 204 L98 208 L98 298 Q86 304 76 296 Q70 250 76 204 Z" fill="' + F('quads') + '"' + S + '/><path d="M124 204 L102 208 L102 298 Q114 304 124 296 Q130 250 124 204 Z" fill="' + F('quads') + '"' + S + '/>' +
    '<path d="M78 304 Q88 308 96 304 L92 356 Q86 360 80 356 Z" fill="' + F('calves') + '"' + S + '/><path d="M122 304 Q112 308 104 304 L108 356 Q114 360 120 356 Z" fill="' + F('calves') + '"' + S + '/>' + feet + '</g>';
  const back = '<g transform="translate(210 0)">' + base +
    '<path d="M100 66 L100 100 L82 96 L70 74 Q86 66 100 66 Z" fill="' + F('traps') + '"' + S + '/><path d="M100 66 L100 100 L118 96 L130 74 Q114 66 100 66 Z" fill="' + F('traps') + '"' + S + '/>' +
    '<path d="M78 98 L98 104 L98 150 Q92 178 80 188 Q72 160 72 124 Z" fill="' + F('lats') + '"' + S + '/><path d="M122 98 L102 104 L102 150 Q108 178 120 188 Q128 160 128 124 Z" fill="' + F('lats') + '"' + S + '/>' +
    '<path d="M92 150 L108 150 L108 194 L92 194 Z" fill="' + F('erectors') + '"' + S + '/>' + arms('triceps') + fore + delts +
    '<path d="M76 198 Q100 196 99 226 Q86 238 76 226 Z" fill="' + F('glutes') + '"' + S + '/><path d="M124 198 Q100 196 101 226 Q114 238 124 226 Z" fill="' + F('glutes') + '"' + S + '/>' +
    '<path d="M76 230 L98 232 L98 296 Q86 302 76 294 Q72 262 76 230 Z" fill="' + F('hamstrings') + '"' + S + '/><path d="M124 230 L102 232 L102 296 Q114 302 124 294 Q128 262 124 230 Z" fill="' + F('hamstrings') + '"' + S + '/>' +
    '<path d="M78 302 Q88 306 96 302 L92 354 Q86 358 80 354 Q74 330 78 302 Z" fill="' + F('calves') + '"' + S + '/><path d="M122 302 Q112 306 104 302 L108 354 Q114 358 120 354 Q126 330 122 302 Z" fill="' + F('calves') + '"' + S + '/>' + feet + '</g>';
  return '<svg class="man" viewBox="0 0 410 380" role="img" aria-label="Silhouette de face et de dos : les muscles travaillés ce jour-là sont en orange">' + front + back + '</svg>';
}

V.body = function () {
  const S = C.st(), t = C.today(), mon = C.mondayOf(t);
  if (!ui.bodyDay) { ui.bodyDay = C.dayKeyOf(t) || 'ven'; }
  const dk = ui.bodyDay, d = C.dayDef(dk);
  const tabs = ['mar', 'jeu', 'ven', 'sam'].map((k) => '<button class="tab ' + (k === dk ? 'on' : '') + '" data-a="bodyDay" data-day="' + k + '" aria-pressed="' + (k === dk) + '">' + C.dayDef(k).short + '</button>').join('');
  const sets = C.daySetsByGroup(dk);
  const rows = Object.keys(sets).map((g) => '<div class="split recrow"><span>' + g + '</span><span class="num">' + sets[g] + ' séries</span></div>').join('');
  const wk = C.weekSetsByGroup(mon);
  const bars = W.WEEK_TARGETS.map((x) => '<div class="wrow"><span>' + x.g + '</span>' + bar((wk[x.g] || 0) / x.t * 100, x.pri ? 'var(--acc)' : 'var(--ice)') + '<span class="num">' + (wk[x.g] || 0) + '<small>/' + x.t + '</small></span></div>').join('');
  const a0 = firstBody('armF'), r0 = firstBody('armR');
  const proj = a0 ? '<div class="banner ice">Projection prudente à la fin de la semaine 8 : bras contracté entre <b>' + C.fmt(a0.armF + 1) + '</b> et <b>' + C.fmt(a0.armF + 2) + ' cm</b>' + (r0 ? ', relâché entre <b>' + C.fmt(r0.armR + 0.5) + '</b> et <b>' + C.fmt(r0.armR + 1.5) + ' cm</b>' : '') + '. Mesures à prendre aux semaines 4 et 8.</div>' : '';
  const ms = S.body.map((b, i) => ({ b: b, i: i })).slice(-6).reverse().map((o) => '<div class="split recrow"><span>' + C.dateShort(o.b.date) + '</span><span class="muted sm">' + (o.b.weight != null ? C.fmt(o.b.weight) + ' kg' : '') + (o.b.armR != null ? ' · relâché ' + C.fmt(o.b.armR) : '') + (o.b.armF != null ? ' · contracté ' + C.fmt(o.b.armF) : '') + '</span><button class="iconbtn sm" data-a="delMeasure" data-i="' + o.i + '" aria-label="Supprimer cette mesure">' + IC.trash + '</button></div>').join('');
  return '<div class="screen">' + top('Muscles travaillés', 'Corps', '') +
    '<nav class="tabs" aria-label="Choisir le jour">' + tabs + '</nav>' +
    '<section class="card"><div class="h3">' + d.name + ' : ' + d.title.toLowerCase() + '</div>' + mannequin(C.dayLevels(dk)) +
    '<div class="faces"><span>Face</span><span>Dos</span></div><div class="legend"><span><i style="background:#FF6B2C"></i>Travail principal</span><span><i style="background:#A04A22"></i>Travail secondaire</span></div></section>' +
    '<section class="card"><div class="h3">Séries du jour</div>' + rows + '</section>' +
    '<section class="card"><div class="split"><span class="h3">Séries cette semaine</span><span class="muted xs">séances faites</span></div>' + bars + '<div class="muted xs">Orange : tes priorités, bras et épaules.</div></section>' +
    '<section class="card"><div class="h3">Mesures</div>' + proj +
    '<form class="form" data-form="measure"><div class="grid3"><label>Poids (kg)<input name="weight" inputmode="decimal" autocomplete="off" placeholder="63,5"></label><label>Relâché (cm)<input name="armR" inputmode="decimal" autocomplete="off" placeholder="30"></label><label>Contracté (cm)<input name="armF" inputmode="decimal" autocomplete="off" placeholder="35"></label></div><button class="btn primary" type="submit">Enregistrer la mesure</button></form>' +
    '<div class="muted xs">Bras : au point le plus large du biceps, le matin, un jour sans séance, sans pompe.</div>' + ms + '</section>' +
    '<section class="card"><div class="h3">Photos avant / après</div><div id="photos">' + emptyMsg('Chargement…') + '</div>' +
    '<label class="btn ghost filebtn">' + IC.camera + 'Ajouter une photo<input type="file" accept="image/*" data-change="photo" hidden></label><div class="muted xs">Même lumière, même pose, une fois par mois. Les photos restent sur ton iPhone.</div></section></div>';
};

V.fillPhotos = function () {
  const box = document.getElementById('photos');
  if (!box) { return; }
  C.photoList().then((list) => {
    const b = document.getElementById('photos');
    if (!b) { return; }
    if (!list.length) { b.innerHTML = emptyMsg('Ajoute ta photo de départ pour comparer plus tard.'); return; }
    const url = (p) => URL.createObjectURL(p.blob);
    let cmp = '';
    if (list.length > 1) {
      const a = list[0], z = list[list.length - 1];
      cmp = '<div class="cmp"><figure><img alt="Photo de départ" src="' + url(a) + '"><figcaption>Départ · ' + C.dateShort(a.date) + '</figcaption></figure><figure><img alt="Photo la plus récente" src="' + url(z) + '"><figcaption>Maintenant · ' + C.dateShort(z.date) + '</figcaption></figure></div>';
    }
    const grid = list.slice().reverse().map((p) => '<figure class="ph"><img alt="Photo du ' + C.dateShort(p.date) + '" src="' + url(p) + '"><figcaption>' + C.dateShort(p.date) + '<button class="iconbtn sm" data-a="delPhoto" data-id="' + p.id + '" aria-label="Supprimer la photo">' + IC.trash + '</button></figcaption></figure>').join('');
    b.innerHTML = cmp + '<div class="phgrid">' + grid + '</div>';
  });
};

/* ---------- Nutrition ---------- */
V.nutrition = function () {
  const S = C.st(), t = C.today();
  if (!ui.nutDate) { ui.nutDate = t; }
  const date = ui.nutDate, r = S.days[date] || { meals: [], water: 0, sleep: null }, tot = C.dayTotals(date);
  const K = 3000, P = 115, Wt = 3;
  const pct = Math.min(100, tot.k / K * 100), R = 52, circ = 2 * Math.PI * R;
  const ring = '<svg viewBox="0 0 130 130" class="ring" role="img" aria-label="' + tot.k + ' kcal sur ' + K + '"><circle cx="65" cy="65" r="' + R + '" fill="none" stroke="#2A2F36" stroke-width="12"/>' + (pct > 0 ? '<circle cx="65" cy="65" r="' + R + '" fill="none" stroke="#FF6B2C" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (circ * pct / 100).toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 65 65)"/>' : '') + '<text x="65" y="64" text-anchor="middle" fill="#F3F0EA" font-size="26" font-weight="700" font-family="Barlow Condensed">' + tot.k + '</text><text x="65" y="84" text-anchor="middle" fill="#A7ADB5" font-size="12">sur ' + K + ' kcal</text></svg>';
  const meals = r.meals.map((m) => '<div class="split recrow"><span>' + esc(m.n) + '</span><span class="muted sm">' + m.k + ' kcal · ' + m.p + ' g</span><button class="iconbtn sm" data-a="delMeal" data-id="' + m.id + '" aria-label="Supprimer ' + esc(m.n) + '">' + IC.trash + '</button></div>').join('');
  const favs = S.favs.map((f, i) => '<span class="chipwrap"><button class="chip" data-a="favUse" data-i="' + i + '">' + esc(f.n) + '<small>' + f.k + ' kcal · ' + f.p + ' g</small></button><button class="chipx" data-a="favDel" data-i="' + i + '" aria-label="Supprimer le favori ' + esc(f.n) + '">×</button></span>').join('');
  const remK = Math.max(0, K - tot.k), remP = Math.max(0, P - tot.p);
  return '<div class="screen">' + top(date === t ? 'Aujourd’hui' : C.cap(C.dateFr(date)), 'Nutrition', '') +
    '<div class="daynav"><button class="iconbtn" data-a="nutDay" data-d="-1" aria-label="Jour précédent">' + IC.back + '</button><span>' + C.cap(C.dateFr(date)) + '</span><button class="iconbtn rot" data-a="nutDay" data-d="1" aria-label="Jour suivant"' + (date >= t ? ' disabled' : '') + '>' + IC.back + '</button></div>' +
    '<section class="card"><div class="ringrow">' + ring + '<div class="ringtxt"><div class="split"><span>Protéines</span><span class="num">' + tot.p + ' <small>/ ' + P + ' g</small></span></div>' + bar(tot.p / P * 100) + '<div class="split"><span>Eau</span><span class="num">' + C.fmt(r.water || 0) + ' <small>/ ' + Wt + ' L</small></span></div>' + bar((r.water || 0) / Wt * 100, 'var(--ice)') + '</div></div>' +
    '<div class="muted sm">' + (tot.k === 0 ? 'Rien d’enregistré pour ce jour.' : 'Il te reste environ ' + remK + ' kcal et ' + remP + ' g de protéines pour atteindre ton objectif.') + '</div></section>' +
    '<section class="card"><div class="h3">Repas</div>' + (meals || emptyMsg('Envoie la photo de ton repas à Claude, puis recopie le total ici.')) +
    '<form class="form" data-form="meal"><label>Repas<input name="n" autocomplete="off" placeholder="Ex. Pâtes et poulet"></label><div class="grid2"><label>Calories (kcal)<input name="k" inputmode="numeric" autocomplete="off" placeholder="650"></label><label>Protéines (g)<input name="p" inputmode="numeric" autocomplete="off" placeholder="55"></label></div><label class="check"><input type="checkbox" name="fav"> Enregistrer en favori</label><button class="btn primary" type="submit">Ajouter le repas</button></form>' +
    (favs ? '<div class="muted xs">Favoris : un tap ajoute le repas à ce jour.</div><div class="chips">' + favs + '</div>' : '') + '</section>' +
    '<section class="card"><div class="split"><span class="h3">Eau</span><span class="num">' + C.fmt(r.water || 0) + ' L</span></div><div class="grid2"><button class="btn ghost mini" data-a="water" data-d="-0.25">−0,25 L</button><button class="btn primary mini" data-a="water" data-d="0.25">+0,25 L</button></div></section>' +
    '<section class="card"><div class="split"><span class="h3">Sommeil cette nuit</span><span class="num">' + (r.sleep != null ? C.fmt(r.sleep) + ' h' : '–') + '</span></div><div class="grid2"><button class="btn ghost mini" data-a="sleep" data-d="-0.5">−0,5 h</button><button class="btn primary mini" data-a="sleep" data-d="0.5">+0,5 h</button></div><div class="muted sm">Objectif : 7 à 8 h. Sous 6 h, l’appli te conseille de garder tes charges.</div></section></div>';
};

/* ---------- MMA ---------- */
V.mma = function () {
  const S = C.st(), t = C.today();
  const cls = C.dayKeyOf(t), def = cls === 'mar' ? 'mar' : (cls === 'jeu' ? 'jeu' : (cls === 'sam' ? 'sam' : 'autre'));
  const lv = [['1', 'Léger'], ['2', 'Moyen'], ['3', 'Sparring dur']].map((a) => '<label class="radio"><input type="radio" name="lvl" value="' + a[0] + '"' + (String(ui.mmaLvl) === a[0] ? ' checked' : '') + '><span>' + a[1] + '</span></label>').join('');
  const hist = S.mma.slice(-8).reverse().map((m) => '<div class="split recrow"><span>' + C.cap(C.dateFr(m.date)) + '</span><span class="muted sm">' + ['', 'Léger', 'Moyen', 'Sparring dur'][m.lvl] + (m.note ? ' · ' + esc(m.note) : '') + '</span><button class="iconbtn sm" data-a="delMma" data-id="' + m.id + '" aria-label="Supprimer ce cours">' + IC.trash + '</button></div>').join('');
  return '<div class="screen">' + backLink('#/home') + top('Suivi du MMA', 'Mes cours', 'Le MMA compte dans ta fatigue. Note-le pour que l’appli adapte ses conseils.') +
    '<section class="card"><form class="form" data-form="mma"><label>Cours<select name="cls" class="select"><option value="mar"' + (def === 'mar' ? ' selected' : '') + '>Mardi 19 h 45 · Vitry</option><option value="jeu"' + (def === 'jeu' ? ' selected' : '') + '>Jeudi 21 h · Vitry</option><option value="sam"' + (def === 'sam' ? ' selected' : '') + '>Samedi 10 h 30 · Paris 13e</option><option value="autre"' + (def === 'autre' ? ' selected' : '') + '>Autre</option></select></label>' +
    '<fieldset class="fs"><legend>Intensité</legend><div class="radios">' + lv + '</div></fieldset><label>Note (facultatif)<input name="note" autocomplete="off" placeholder="Ex. sparring au sol, épaule un peu raide"></label><button class="btn primary" type="submit">Enregistrer le cours</button></form></section>' +
    '<section class="card"><div class="h3">Derniers cours</div>' + (hist || emptyMsg('Aucun cours enregistré.')) + '</section></div>';
};

/* ---------- Repos ---------- */
V.rest = function () {
  const S = C.st(), t = C.today(), r = C.dayRec(t), ck = r.checks || {};
  const items = [['meals', 'Repas complets', '5 prises de repas, avec des protéines à chaque fois'], ['sleep', 'Sommeil de 7 à 8 h', 'Couche-toi à l’heure, c’est là que tu progresses'], ['stretch', 'Étirements', '10 minutes : épaules, poignets, hanches'], ['water', 'Eau', '2,5 à 3 litres dans la journée']];
  const list = items.map((x) => '<button class="chk ' + (ck[x[0]] ? 'on' : '') + '" data-a="restToggle" data-k="' + x[0] + '" aria-pressed="' + !!ck[x[0]] + '"><span class="dot ' + (ck[x[0]] ? 'on' : '') + '">' + (ck[x[0]] ? IC.check : '') + '</span><span class="chkt"><b>' + x[1] + '</b><small>' + x[2] + '</small></span></button>').join('');
  const n = items.filter((x) => ck[x[0]]).length;
  return '<div class="screen">' + backLink('#/home') + top('Jour de repos', 'Récupération', 'Aucun sport aujourd’hui. Voici ce qui fait la différence.') +
    '<div class="progress"><div class="split"><b>' + n + ' / 4</b><span class="muted">à cocher</span></div>' + bar(n / 4 * 100) + '</div>' + list +
    '<a class="btn ghost" href="#/nutrition">Ouvrir la nutrition</a></div>';
};

/* ---------- Bilan de semaine ---------- */
V.week = function () {
  const t = C.today(), mon = C.mondayOf(t), r = C.weekReport(mon);
  const tips = [];
  if (r.sess < r.need) { tips.push('Il te manque ' + (r.need - r.sess) + ' séance' + (r.need - r.sess > 1 ? 's' : '') + ' pour compléter la semaine. Si tu en rates une, ne la rattrape pas : reprends au programme suivant sans monter les charges.'); }
  else { tips.push('Semaine complète, bravo. C’est ça qui fait grossir les bras.'); }
  if (r.protDays && r.prot < 100) { tips.push('Protéines : ' + Math.round(r.prot) + ' g en moyenne. Vise 105 à 125 g (skyr, œufs, poulet, lait).'); }
  if (r.sleep != null && r.sleep < 7) { tips.push('Sommeil : ' + C.fmt(Math.round(r.sleep * 10) / 10) + ' h en moyenne. Vise 7 à 8 h, c’est le levier le plus rentable.'); }
  if (r.weight != null && r.prevWeight != null) {
    const dlt = r.weight - r.prevWeight;
    if (r.week >= 3 && dlt < 0.1) { tips.push('Ton poids n’avance pas. Ajoute environ 250 kcal par jour, par exemple un verre de lait avec deux cuillères de beurre de cacahuète.'); }
    if (dlt > 0.6) { tips.push('Tu montes vite (+' + C.fmt(Math.round(dlt * 10) / 10) + ' kg). Si le ventre grossit plus que les bras, retire une collation.'); }
  }
  if (r.mmaHard >= 2) { tips.push('Deux sparrings durs cette semaine : garde tes charges si tu te sens entamé.'); }
  const line = (a, b) => '<div class="split recrow"><span>' + a + '</span><span class="num">' + b + '</span></div>';
  return '<div class="screen">' + backLink('#/home') + top('Semaine ' + r.week + (C.isDeload(r.week) ? ' · décharge' : ''), 'Bilan', 'Du ' + C.dateFr(mon) + ' au ' + C.dateFr(C.addDays(mon, 6))) +
    '<section class="card">' + line('Séances de salle', r.sess + ' / ' + r.need) + line('Bonus du samedi', r.bonus) + line('Cours de MMA', r.mma) + line('Séries validées', r.sets) + line('Records battus', r.recs) + line('Charges à monter', r.ups) +
    line('Poids moyen', r.weight != null ? C.fmt(Math.round(r.weight * 10) / 10) + ' kg' : '–') + line('Protéines moyennes', r.protDays ? Math.round(r.prot) + ' g' : '–') + line('Sommeil moyen', r.sleep != null ? C.fmt(Math.round(r.sleep * 10) / 10) + ' h' : '–') + '</section>' +
    '<section class="card"><div class="kicker orange">À retenir</div><ul class="ul">' + tips.map((x) => '<li>' + x + '</li>').join('') + '</ul></section></div>';
};

/* ---------- Réglages ---------- */
V.settings = function () {
  const S = C.st();
  return '<div class="screen">' + backLink('#/home') + top('Réglages', 'Will Training', '') +
    '<section class="card"><label>Ton prénom<input data-change="name" value="' + esc(S.name) + '" autocomplete="off"></label>' +
    '<label class="check"><input type="checkbox" data-change="sound"' + (S.sound ? ' checked' : '') + '> Son à la fin du repos</label>' +
    '<div class="muted sm">Semaine 1 : lundi ' + C.dateFr(S.startMonday) + '. L’iPhone ne vibre pas depuis une appli web : le chrono utilise un son et un flash à l’écran.</div></section>' +
    '<section class="card"><div class="h3">Tes données</div><div class="muted sm">Tout reste sur ton iPhone. Fais une sauvegarde de temps en temps, surtout avant de changer de téléphone. Les photos ne sont pas incluses.</div>' +
    '<button class="btn primary" data-a="export">Exporter une sauvegarde</button><label class="btn ghost filebtn">Importer une sauvegarde<input type="file" accept="application/json,.json" data-change="import" hidden></label><button class="btn link danger" data-a="reset">Tout effacer</button></section>' +
    '<section class="card"><div class="h3">Installer sur l’écran d’accueil</div><div class="muted sm">Dans Safari : touche le bouton Partager (le carré avec une flèche), puis « Sur l’écran d’accueil ». L’appli s’ouvre ensuite en plein écran et fonctionne sans connexion.</div></section></div>';
};

V.ui = ui;
V.esc = esc;
V.render = {
  home: () => V.home(), warmup: (p) => V.warmup(p), session: (p) => V.session(p), summary: () => V.summary(),
  progress: () => V.progress(), body: () => V.body(), nutrition: () => V.nutrition(), mma: () => V.mma(),
  rest: () => V.rest(), week: () => V.week(), settings: () => V.settings()
};
W.views = V;
})();
