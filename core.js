/* Will Training : état, règles de progression, chrono, stockage */
(function () {
'use strict';
const W = window.WT;
const KEY = 'wt.state.v1';

const DEF = () => ({
  v: 1, name: 'William', startMonday: '2026-11-02', startDate: '2026-11-05', sound: true,
  loads: {}, altLoads: {}, notes: {}, history: [], mma: [],
  body: [{ date: '2026-11-04', weight: 63.5, armR: 30, armF: 35 }],
  days: {},
  favs: [{ n: 'Pâtes + poulet', k: 650, p: 55 }, { n: 'Skyr 300 g, banane, flocons', k: 600, p: 40 }],
  session: null, warm: null, timer: null, lastSummary: null
});
let S = DEF();
function load() {
  try {
    const r = localStorage.getItem(KEY);
    S = r ? Object.assign(DEF(), JSON.parse(r)) : DEF();
  } catch (e) { S = DEF(); }
  return S;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
function st() { return S; }
function replaceState(obj) { S = Object.assign(DEF(), obj); save(); }
function resetAll() { S = DEF(); save(); }

/* ---------- Dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = (s) => { const a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
const today = () => ymd(new Date());
function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
const dow = (s) => parse(s).getDay();
function mondayOf(s) { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); }
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
function weekNum(s) { return Math.max(1, Math.floor(diffDays(S.startMonday, mondayOf(s)) / 7) + 1); }
const isDeload = (w) => w % 4 === 0;
const DK = { 2: 'mar', 4: 'jeu', 5: 'ven', 6: 'sam' };
const dayKeyOf = (s) => DK[dow(s)] || null;
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function dateFr(s) { const d = parse(s); return DAYS_FR[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS_FR[d.getMonth()]; }
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function dateShort(s) { const d = parse(s); return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()]; }
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Format ---------- */
const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
const round1 = (n) => Math.round(n * 10) / 10;
const r5 = (n) => Math.round(n * 2) / 2;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function num(str) {
  if (typeof str === 'number') { return str; }
  const v = parseFloat(String(str).replace(',', '.').replace(/[^0-9.\-]/g, ''));
  return isNaN(v) ? null : v;
}

/* ---------- Programme ---------- */
const dayDef = (k) => W.DAYS[k];
function setsFor(ex, week, dk) {
  let s = ex.sets;
  if (isDeload(week)) { s = Math.max(2, s - 1); }
  else if (ex.ramp && week <= 2 && (dk === 'mar' || dk === 'jeu')) { s = Math.max(2, s - 1); }
  return s;
}
function plannedLoad(ex, week) {
  if (ex.bw) { return 0; }
  const base = S.loads[ex.key] != null ? S.loads[ex.key] : ex.w;
  return isDeload(week) ? Math.max(ex.step, r5(base * 0.9)) : base;
}
function plannedAlt(ex) { return S.altLoads[ex.key] != null ? S.altLoads[ex.key] : ex.alt.w; }
function eff(e, s) {
  const u = s.sw === 'used';
  return {
    name: u ? e.alt.n : e.n,
    w: u ? s.wa : s.w,
    hand: u ? !!e.alt.hand : !!e.hand,
    step: u ? e.alt.step : e.step,
    ill: u ? e.alt.ill : e.ill,
    pre: u ? (e.alt.pre || '') : (e.pre || ''),
    alt: u
  };
}
function loadText(e, f) { return e.bw ? 'Poids du corps' : f.pre + fmt(f.w) + ' kg'; }
function rangeText(e) {
  const r = e.lo === e.hi ? String(e.lo) : (e.lo + '-' + e.hi);
  return e.ru === 'm' ? r + ' m' : r;
}
function repsText(e, reps) { return e.ru === 'm' ? reps.map((r) => r + ' m').join(', ') : reps.join(', '); }
function humanSec(s) { const m = Math.floor(s / 60), r = s % 60; return r ? (m ? m + ' min ' + r : r + ' s') : m + ' min'; }
const mmss = (s) => Math.floor(s / 60) + ':' + pad(s % 60);

/* ---------- Historique, records ---------- */
function lastEntry(key, alt) {
  for (let i = S.history.length - 1; i >= 0; i--) {
    const it = S.history[i].items.find((x) => x.key === key && !!x.alt === !!alt);
    if (it && it.reps.length) { return { item: it, date: S.history[i].date }; }
  }
  return null;
}
function bestBefore(key, alt) {
  let best = null;
  S.history.forEach((h) => {
    h.items.forEach((it) => {
      if (it.key === key && !!it.alt === !!alt && !it.bw) {
        it.reps.forEach((r) => { const sc = it.w * (1 + r / 30); if (best === null || sc > best) { best = sc; } });
      }
    });
  });
  return best;
}
function lastText(e, f) {
  const le = lastEntry(e.key, f.alt);
  if (!le) { return f.alt ? 'Nouvel exercice, pas encore d’historique' : 'Première fois : charge de départ du plan'; }
  const it = le.item;
  const base = e.bw ? 'Poids du corps' : (it.pre || '') + fmt(it.w) + ' kg' + (it.hand ? ' par main' : '');
  return base + ' · ' + repsText(e, it.reps);
}

/* ---------- Séance ---------- */
function startSession(dk) {
  const date = today(), week = weekNum(date), def = dayDef(dk);
  const ex = def.ex.map((e) => {
    const n = setsFor(e, week, dk);
    return { w: plannedLoad(e, week), wa: plannedAlt(e), reps: new Array(n).fill(e.hi), done: new Array(n).fill(false), sw: 'none' };
  });
  S.session = { day: dk, started: Date.now(), cur: 0, ex: ex, week: week, date: date };
  S.warm = null;
  save();
}
function toggleSet(i, j) {
  const se = S.session, e = dayDef(se.day).ex[i], s = se.ex[i];
  const was = s.done[j];
  s.done[j] = !was;
  let rec = false;
  if (!was) {
    const f = eff(e, s);
    if (!e.bw) {
      const sc = f.w * (1 + s.reps[j] / 30);
      const prior = bestBefore(e.key, f.alt);
      let sess = 0;
      s.done.forEach((d, k) => { if (d && k !== j) { sess = Math.max(sess, f.w * (1 + s.reps[k] / 30)); } });
      if (prior !== null && sc > Math.max(prior, sess) + 0.001) { rec = true; }
    }
    if (e.rest > 0) { startTimer(e.rest); }
  }
  save();
  return rec;
}
function finishSession() {
  const se = S.session;
  if (!se) { return null; }
  const def = dayDef(se.day), items = [], recs = [], ups = [];
  let setsDone = 0, setsTotal = 0;
  def.ex.forEach((e, i) => {
    const s = se.ex[i], f = eff(e, s), reps = [];
    setsTotal += s.done.length;
    s.done.forEach((d, j) => { if (d) { reps.push(s.reps[j]); setsDone++; } });
    if (!reps.length) { return; }
    items.push({ key: e.key, name: f.name, w: f.w, pre: f.pre, hand: f.hand, reps: reps, alt: f.alt, bw: !!e.bw });
    if (!e.bw) {
      const prior = bestBefore(e.key, f.alt);
      if (prior !== null) {
        let bestR = 0, bestSc = 0;
        reps.forEach((r) => { const sc = f.w * (1 + r / 30); if (sc > bestSc) { bestSc = sc; bestR = r; } });
        if (bestSc > prior + 0.001) { recs.push({ name: f.name, w: f.w, pre: f.pre, reps: bestR, ru: e.ru }); }
      }
      if (!isDeload(se.week)) {
        const full = s.done.every((x) => x), top = full && s.reps.every((r) => r >= e.hi);
        const next = top ? round1(f.w + f.step) : f.w;
        if (f.alt) { S.altLoads[e.key] = next; } else { S.loads[e.key] = next; }
        if (top) { ups.push({ name: f.name, from: f.w, to: next, pre: f.pre }); }
      }
    }
  });
  const ended = Date.now();
  const summary = { date: se.date, day: se.day, week: se.week, minutes: Math.max(1, Math.round((ended - se.started) / 60000)), setsDone: setsDone, setsTotal: setsTotal, recs: recs, ups: ups, saved: setsDone > 0 };
  if (setsDone > 0) {
    S.history.push({ id: uid(), date: se.date, day: se.day, week: se.week, started: se.started, ended: ended, setsDone: setsDone, setsTotal: setsTotal, recs: recs.length, ups: ups.length, items: items });
  }
  S.lastSummary = summary;
  S.session = null; S.warm = null; S.timer = null;
  save();
  return summary;
}
function abandonSession() { S.session = null; S.warm = null; S.timer = null; save(); }

/* ---------- Chrono ---------- */
function startTimer(sec) { S.timer = { endAt: Date.now() + sec * 1000, total: sec, paused: null }; save(); }
function timerLeft() {
  const t = S.timer;
  if (!t) { return 0; }
  if (t.paused != null) { return t.paused; }
  return Math.max(0, Math.ceil((t.endAt - Date.now()) / 1000));
}
function timerAdjust(delta) {
  const t = S.timer;
  if (!t) { return; }
  const left = Math.max(0, timerLeft() + delta);
  if (t.paused != null) { t.paused = left; } else { t.endAt = Date.now() + left * 1000; }
  t.total = Math.max(t.total, left);
  save();
}
function timerToggle() {
  const t = S.timer;
  if (!t) { return; }
  if (t.paused != null) { t.endAt = Date.now() + (t.paused === 0 ? t.total : t.paused) * 1000; t.paused = null; }
  else if (timerLeft() === 0) { t.endAt = Date.now() + t.total * 1000; }
  else { t.paused = timerLeft(); }
  save();
}
function timerClear() { S.timer = null; save(); }

/* ---------- Semaines, série ---------- */
function weekSessionCount(mon) {
  return S.history.filter((h) => h.day !== 'sam' && mondayOf(h.date) === mon).length;
}
function weekDone(mon) { return weekSessionCount(mon) >= (weekNum(mon) === 1 ? 2 : 3); }
function streak() {
  let mon = mondayOf(today()), n = 0;
  if (weekDone(mon)) { n++; }
  mon = addDays(mon, -7);
  while (diffDays(S.startMonday, mon) >= 0 && weekDone(mon)) { n++; mon = addDays(mon, -7); }
  return n;
}
function dayDone(date) { return S.history.some((h) => h.date === date); }

/* ---------- Muscles ---------- */
function dayLevels(dk) {
  const lv = {};
  dayDef(dk).ex.forEach((e) => {
    e.m2.forEach((m) => { if (!lv[m]) { lv[m] = 1; } });
    e.m1.forEach((m) => { lv[m] = 2; });
  });
  return lv;
}
function daySetsByGroup(dk) {
  const g = {};
  dayDef(dk).ex.forEach((e) => {
    const grp = {};
    e.m1.forEach((m) => { grp[W.M2G[m]] = true; });
    Object.keys(grp).forEach((k) => { g[k] = (g[k] || 0) + e.sets; });
  });
  return g;
}
function weekSetsByGroup(mon) {
  const g = {};
  S.history.filter((h) => mondayOf(h.date) === mon).forEach((h) => {
    const def = dayDef(h.day);
    h.items.forEach((it) => {
      const e = def.ex.find((x) => x.key === it.key);
      if (!e) { return; }
      const grp = {};
      e.m1.forEach((m) => { grp[W.M2G[m]] = true; });
      Object.keys(grp).forEach((k) => { g[k] = (g[k] || 0) + it.reps.length; });
    });
  });
  return g;
}

/* ---------- Échauffement ---------- */
function warmupSteps(dk) {
  const week = weekNum(today()), def = dayDef(dk), steps = [];
  if (dk !== 'sam') { steps.push({ ill: 'bike', amount: '5 min', name: 'Vélo ou rameur léger', detail: 'Allure facile : tu dois pouvoir parler sans effort.' }); }
  steps.push({ ill: 'wrist', amount: '2 × 10 par sens', name: 'Cercles de poignets', detail: 'Chaque poignet, lentement, sans forcer sur le gauche.' });
  if (dk !== 'sam') { steps.push({ ill: 'wriststretch', amount: '30 s par côté', name: 'Étirement des fléchisseurs du poignet', detail: 'Bras tendu, paume vers l’avant, tire doucement les doigts vers toi.' }); }
  steps.push({ ill: 'shoulderrot', amount: '2 × 10', name: 'Rotations d’épaules', detail: 'Bras tendus, grands cercles en avant puis en arrière.' });
  if (dk === 'mar') { steps.push({ ill: 'pushup', amount: '1 × 8', name: 'Pompes lentes', detail: 'Descente en 3 secondes, corps gainé. Elles préparent les épaules et les triceps.' }); }
  if (dk === 'jeu') { steps.push({ ill: 'bwsquat', amount: '2 × 10', name: 'Squats au poids du corps', detail: 'Talons au sol, descends aussi bas que c’est confortable.' }); }
  if (dk === 'ven') { steps.push({ ill: 'hang', amount: '2 × 20 s', name: 'Suspension à la barre', detail: 'Bras tendus, épaules actives, relâche le bas du dos.' }); }
  const e = def.ex.find((x) => !x.bw);
  if (e) {
    const w = plannedLoad(e, week), per = e.hand ? ' par main' : '';
    let detail;
    if (e.key === 'ven_pullup') {
      const a = r5(w * 0.5), b = r5(w * 0.75);
      detail = 'Poids du corps × 6, puis +' + fmt(a) + ' kg × 4, puis +' + fmt(b) + ' kg × 2. Ensuite ta première série de travail à +' + fmt(w) + ' kg.';
    } else {
      detail = fmt(r5(w * 0.5)) + ' kg × 8, puis ' + fmt(r5(w * 0.7)) + ' kg × 5, puis ' + fmt(r5(w * 0.85)) + ' kg × 3' + per + '. Ensuite ta première série de travail à ' + fmt(w) + ' kg' + per + '.';
    }
    steps.push({ ill: 'plates', amount: '3 séries', name: 'Séries montantes : ' + e.n.toLowerCase(), detail: detail });
  }
  return steps;
}

/* ---------- MMA, fatigue ---------- */
function nextMma() {
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const c = W.MMA[d.getDay()];
    if (!c) { continue; }
    const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), c.h, c.m);
    if (at > now) { return { date: ymd(d), dow: d.getDay(), c: c }; }
  }
  return null;
}
function fatigueNote() {
  const t = today(), y = addDays(t, -1);
  const hard = S.mma.some((m) => (m.date === t || m.date === y) && m.lvl === 3);
  const dr = S.days[t];
  const short = dr && dr.sleep != null && dr.sleep < 6;
  if (hard && short) { return 'Sparring dur récent et nuit courte : garde tes charges, ne cherche pas le record aujourd’hui.'; }
  if (hard) { return 'Sparring dur récemment : si les premières séries sont lourdes, garde la même charge.'; }
  if (short) { return 'Nuit courte (moins de 6 h) : garde tes charges si ça ne passe pas.'; }
  return null;
}

/* ---------- Journée (nutrition, repos) ---------- */
function dayRec(date) {
  if (!S.days[date]) { S.days[date] = { meals: [], water: 0, sleep: null, checks: {} }; }
  return S.days[date];
}
function dayTotals(date) {
  const d = S.days[date];
  let k = 0, p = 0;
  if (d) { d.meals.forEach((m) => { k += m.k; p += m.p; }); }
  return { k: k, p: p };
}

/* ---------- Bilan de semaine ---------- */
function avg(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }
function weekReport(mon) {
  const sun = addDays(mon, 6), inW = (d) => d >= mon && d <= sun;
  const hs = S.history.filter((h) => inW(h.date));
  const sess = hs.filter((h) => h.day !== 'sam').length;
  const bonus = hs.filter((h) => h.day === 'sam').length;
  const mm = S.mma.filter((m) => inW(m.date));
  const wk = S.body.filter((b) => inW(b.date) && b.weight != null).map((b) => b.weight);
  const pm = S.body.filter((b) => b.date >= addDays(mon, -7) && b.date < mon && b.weight != null).map((b) => b.weight);
  const prot = [], kc = [], sl = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), r = S.days[d];
    if (!r) { continue; }
    if (r.meals.length) { const t = dayTotals(d); prot.push(t.p); kc.push(t.k); }
    if (r.sleep != null) { sl.push(r.sleep); }
  }
  return {
    mon: mon, week: weekNum(mon), need: weekNum(mon) === 1 ? 2 : 3, sess: sess, bonus: bonus,
    mma: mm.length, mmaHard: mm.filter((m) => m.lvl === 3).length,
    sets: hs.reduce((a, h) => a + h.setsDone, 0), recs: hs.reduce((a, h) => a + (h.recs || 0), 0), ups: hs.reduce((a, h) => a + (h.ups || 0), 0),
    weight: avg(wk), prevWeight: avg(pm), prot: avg(prot), kcal: avg(kc), sleep: avg(sl), protDays: prot.length
  };
}

/* ---------- Photos (IndexedDB) ---------- */
function idb() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('wt-photos', 1);
    rq.onupgradeneeded = () => { rq.result.createObjectStore('photos', { keyPath: 'id' }); };
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
function photoList() {
  return idb().then((db) => new Promise((res) => {
    const rq = db.transaction('photos').objectStore('photos').getAll();
    rq.onsuccess = () => res((rq.result || []).sort((a, b) => (a.date < b.date ? -1 : (a.date > b.date ? 1 : a.ts - b.ts))));
    rq.onerror = () => res([]);
  })).catch(() => []);
}
function resizeImage(file, maxSide) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, maxSide / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
    img.src = url;
  });
}
function photoAdd(file) {
  return resizeImage(file, 900).then((blob) => idb().then((db) => new Promise((res, rej) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').put({ id: uid(), date: today(), ts: Date.now(), blob: blob });
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  })));
}
function photoDelete(id) {
  return idb().then((db) => new Promise((res) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').delete(id);
    tx.oncomplete = () => res(true);
    tx.onerror = () => res(false);
  })).catch(() => false);
}

window.WT.core = {
  load: load, save: save, st: st, replaceState: replaceState, resetAll: resetAll,
  today: today, addDays: addDays, dow: dow, mondayOf: mondayOf, diffDays: diffDays, weekNum: weekNum, isDeload: isDeload,
  dayKeyOf: dayKeyOf, dateFr: dateFr, dateShort: dateShort, cap: cap, parse: parse, ymd: ymd, DAYS_FR: DAYS_FR,
  fmt: fmt, round1: round1, r5: r5, uid: uid, num: num, humanSec: humanSec, mmss: mmss,
  dayDef: dayDef, setsFor: setsFor, plannedLoad: plannedLoad, plannedAlt: plannedAlt, eff: eff, loadText: loadText,
  rangeText: rangeText, repsText: repsText, lastEntry: lastEntry, bestBefore: bestBefore, lastText: lastText,
  startSession: startSession, toggleSet: toggleSet, finishSession: finishSession, abandonSession: abandonSession,
  startTimer: startTimer, timerLeft: timerLeft, timerAdjust: timerAdjust, timerToggle: timerToggle, timerClear: timerClear,
  weekSessionCount: weekSessionCount, weekDone: weekDone, streak: streak, dayDone: dayDone,
  dayLevels: dayLevels, daySetsByGroup: daySetsByGroup, weekSetsByGroup: weekSetsByGroup,
  warmupSteps: warmupSteps, nextMma: nextMma, fatigueNote: fatigueNote,
  dayRec: dayRec, dayTotals: dayTotals, weekReport: weekReport, avg: avg,
  photoList: photoList, photoAdd: photoAdd, photoDelete: photoDelete
};
})();
