/* Will Training : navigation, actions, chrono, PWA */
(function () {
'use strict';
const W = window.WT, C = W.core, V = W.views;
const app = document.getElementById('app');
const navEl = document.getElementById('nav');
const toastEl = document.getElementById('toast');
let lastKey = null, audioCtx = null, wl = null, notified = 0, toastTimer = null;

/* ---------- Utilitaires ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/');
  return { name: parts[0] || 'home', param: parts[1] };
}
function go(hash) { if (location.hash === hash) { render(); } else { location.hash = hash; } }
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}
function unlockAudio() {
  try {
    if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { audioCtx = new AC(); } }
    if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
  } catch (e) { /* audio indisponible */ }
}
function beep() {
  if (!C.st().sound || !audioCtx) { return; }
  try {
    for (let k = 0; k < 3; k++) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t0 = audioCtx.currentTime + k * 0.28;
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t0); o.stop(t0 + 0.22);
    }
  } catch (e) { /* ignore */ }
}
async function requestWake() {
  try {
    if ('wakeLock' in navigator && C.st().session && !wl) {
      wl = await navigator.wakeLock.request('screen');
      wl.addEventListener('release', () => { wl = null; });
    }
  } catch (e) { /* ignore */ }
}
function releaseWake() { try { if (wl) { wl.release(); wl = null; } } catch (e) { /* ignore */ } }

/* ---------- Rendu ---------- */
const NAVMAP = { home: 'home', warmup: 'session', session: 'session', summary: 'session', progress: 'progress', body: 'body', nutrition: 'nutrition' };
function render() {
  const r = route(), S = C.st();
  let name = V.render[r.name] ? r.name : 'home';
  if (name === 'warmup' && S.session) { go('#/session'); return; }
  if (name === 'warmup' && !W.DAYS[r.param]) { go('#/home'); return; }
  const key = name + '/' + (r.param || '');
  const y = window.scrollY;
  try {
    app.innerHTML = V.render[name](r.param);
  } catch (err) {
    app.innerHTML = '<div class="screen"><div class="banner warn">Une erreur est survenue. Recharge la page.</div></div>';
    if (window.console) { console.error(err); }
  }
  const active = NAVMAP[name] || 'home';
  navEl.querySelectorAll('a').forEach((a) => {
    const on = a.dataset.r === active;
    a.classList.toggle('on', on);
    if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
  });
  window.scrollTo(0, key === lastKey ? y : 0);
  lastKey = key;
  if (name === 'body') { V.fillPhotos(); }
}

/* ---------- Chrono ---------- */
function tick() {
  const t = C.st().timer;
  const card = document.getElementById('rt-card');
  if (!t || !card) { return; }
  const left = C.timerLeft(), done = left === 0 && t.paused == null;
  const tm = document.getElementById('rt-time'), lb = document.getElementById('rt-label'), tg = document.getElementById('rt-toggle'), br = document.querySelector('#rt-bar i');
  if (tm) { tm.textContent = C.mmss(left); }
  if (br) { br.style.width = (t.total ? Math.round((t.total - left) / t.total * 100) : 0) + '%'; br.style.background = done ? 'var(--acc)' : 'var(--ice)'; }
  if (lb) { lb.textContent = done ? 'Repos terminé · série suivante' : (t.paused != null ? 'Repos en pause' : 'Repos en cours'); lb.className = 'kicker ' + (done ? 'orange' : 'ice'); }
  if (tg) { tg.textContent = t.paused != null ? 'Reprendre' : (done ? 'Relancer' : 'Pause'); }
  card.classList.toggle('end', done);
  if (done && notified !== t.endAt) {
    notified = t.endAt;
    if (Date.now() - t.endAt < 6000) { beep(); }
  }
}
setInterval(tick, 250);

/* ---------- Sauvegarde ---------- */
function doExport() {
  const data = JSON.stringify(C.st(), null, 2), name = 'will-training-' + C.today() + '.json';
  try {
    const file = new File([data], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Sauvegarde Will Training' }).catch(() => {});
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  } catch (e) { toast('Export impossible sur ce navigateur'); }
}
function doImport(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const obj = JSON.parse(fr.result);
      if (!obj || !Array.isArray(obj.history)) { throw new Error('format'); }
      if (!window.confirm('Remplacer tes données actuelles par cette sauvegarde ?')) { return; }
      C.replaceState(obj); toast('Sauvegarde importée'); render();
    } catch (e) { toast('Fichier non reconnu'); }
  };
  fr.readAsText(file);
}

/* ---------- Actions ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]');
  unlockAudio();
  if (!el) { return; }
  const a = el.dataset.a, S = C.st(), i = +el.dataset.i, j = +el.dataset.j;
  const se = S.session;
  switch (a) {
    case 'warmToggle': S.warm.done[i] = !S.warm.done[i]; C.save(); render(); break;
    case 'startdirect': C.startSession(el.dataset.day); requestWake(); go('#/session'); break;
    case 'exSel': se.cur = i; C.save(); render(); window.scrollTo(0, 0); break;
    case 'exNext': se.cur = Math.min(se.cur + 1, C.dayDef(se.day).ex.length - 1); C.save(); render(); window.scrollTo(0, 0); break;
    case 'repAdj': { const s = se.ex[i]; s.reps[j] = Math.max(0, s.reps[j] + (+el.dataset.d)); C.save(); render(); break; }
    case 'loadAdj': {
      const e = C.dayDef(se.day).ex[i], s = se.ex[i], f = C.eff(e, s), k = s.sw === 'used' ? 'wa' : 'w';
      s[k] = Math.max(0, C.round1(s[k] + (+el.dataset.d) * f.step)); C.save(); render(); break;
    }
    case 'setToggle': { const rec = C.toggleSet(i, j); render(); if (rec) { toast('Nouveau record !'); } break; }
    case 'swapOpen': se.ex[i].sw = 'open'; C.save(); render(); break;
    case 'swapKeep': se.ex[i].sw = 'none'; C.save(); render(); break;
    case 'swapUse': case 'swapRevert': {
      const e = C.dayDef(se.day).ex[i], s = se.ex[i];
      s.sw = a === 'swapUse' ? 'used' : 'none';
      s.done = s.done.map(() => false); s.reps = s.reps.map(() => e.hi);
      C.save(); render(); break;
    }
    case 'tAdj': C.timerAdjust(+el.dataset.d); render(); break;
    case 'tToggle': C.timerToggle(); render(); break;
    case 'tSkip': C.timerClear(); render(); break;
    case 'finish': {
      let ds = 0, ts = 0; se.ex.forEach((x) => { ts += x.done.length; x.done.forEach((d) => { if (d) { ds++; } }); });
      if (ds < ts && !window.confirm('Il reste des séries non validées. Terminer la séance quand même ?')) { break; }
      C.finishSession(); releaseWake(); go('#/summary'); break;
    }
    case 'abandon':
      if (window.confirm('Abandonner la séance ? Rien ne sera enregistré.')) { C.abandonSession(); releaseWake(); go('#/home'); }
      break;
    case 'bodyDay': V.ui.bodyDay = el.dataset.day; render(); break;
    case 'delMeasure': if (window.confirm('Supprimer cette mesure ?')) { S.body.splice(i, 1); C.save(); render(); } break;
    case 'delPhoto': if (window.confirm('Supprimer cette photo ?')) { C.photoDelete(el.dataset.id).then(() => V.fillPhotos()); } break;
    case 'nutDay': {
      const d = C.addDays(V.ui.nutDate || C.today(), +el.dataset.d);
      if (d <= C.today()) { V.ui.nutDate = d; render(); }
      break;
    }
    case 'delMeal': { const r = C.dayRec(V.ui.nutDate || C.today()); r.meals = r.meals.filter((m) => m.id !== el.dataset.id); C.save(); render(); break; }
    case 'favUse': { const f = S.favs[i], r = C.dayRec(V.ui.nutDate || C.today()); r.meals.push({ id: C.uid(), n: f.n, k: f.k, p: f.p }); C.save(); render(); toast('Repas ajouté'); break; }
    case 'favDel': S.favs.splice(i, 1); C.save(); render(); break;
    case 'water': { const r = C.dayRec(V.ui.nutDate || C.today()); r.water = Math.max(0, Math.round(((r.water || 0) + (+el.dataset.d)) * 100) / 100); C.save(); render(); break; }
    case 'sleep': { const r = C.dayRec(V.ui.nutDate || C.today()); r.sleep = Math.max(0, Math.min(14, (r.sleep == null ? 7 : r.sleep) + (+el.dataset.d))); C.save(); render(); break; }
    case 'restToggle': { const r = C.dayRec(C.today()); r.checks = r.checks || {}; r.checks[el.dataset.k] = !r.checks[el.dataset.k]; C.save(); render(); break; }
    case 'delMma': S.mma = S.mma.filter((m) => m.id !== el.dataset.id); C.save(); render(); break;
    case 'export': doExport(); break;
    case 'reset':
      if (window.confirm('Tout effacer : séances, mesures, nutrition, photos ? Cette action est définitive.')) {
        C.photoList().then((l) => Promise.all(l.map((p) => C.photoDelete(p.id)))).then(() => { C.resetAll(); toast('Données effacées'); go('#/home'); });
      }
      break;
    default: break;
  }
});

document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('form[data-form]');
  if (!f) { return; }
  ev.preventDefault();
  const S = C.st(), fd = new FormData(f), kind = f.dataset.form;
  if (kind === 'measure') {
    const m = { date: C.today(), weight: C.num(fd.get('weight')), armR: C.num(fd.get('armR')), armF: C.num(fd.get('armF')) };
    if (m.weight == null && m.armR == null && m.armF == null) { toast('Remplis au moins un champ'); return; }
    S.body.push(m); S.body.sort((a, b) => (a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)));
    C.save(); render(); toast('Mesure enregistrée');
  }
  if (kind === 'meal') {
    const k = C.num(fd.get('k')), p = C.num(fd.get('p')) || 0;
    if (k == null || k <= 0) { toast('Indique les calories'); return; }
    const n = String(fd.get('n') || '').trim() || 'Repas';
    const r = C.dayRec(V.ui.nutDate || C.today());
    r.meals.push({ id: C.uid(), n: n, k: Math.round(k), p: Math.round(p) });
    if (fd.get('fav')) { S.favs.push({ n: n, k: Math.round(k), p: Math.round(p) }); }
    C.save(); render(); toast('Repas ajouté');
  }
  if (kind === 'mma') {
    const lvl = +fd.get('lvl') || 2;
    V.ui.mmaLvl = lvl;
    S.mma.push({ id: C.uid(), date: C.today(), cls: fd.get('cls'), lvl: lvl, note: String(fd.get('note') || '').trim() });
    C.save(); render(); toast('Cours enregistré');
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target, S = C.st();
  if (el.dataset.note) { S.notes[el.dataset.note] = el.value.trim(); C.save(); return; }
  switch (el.dataset.change) {
    case 'exsel': V.ui.exKey = el.value; render(); break;
    case 'name': S.name = el.value.trim() || 'William'; C.save(); toast('Prénom enregistré'); break;
    case 'sound': S.sound = el.checked; C.save(); break;
    case 'photo':
      if (el.files && el.files[0]) {
        C.photoAdd(el.files[0]).then(() => { toast('Photo ajoutée'); V.fillPhotos(); }).catch(() => toast('Photo impossible à enregistrer'));
        el.value = '';
      }
      break;
    case 'import': if (el.files && el.files[0]) { doImport(el.files[0]); el.value = ''; } break;
    default: break;
  }
});

document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (C.st().session) { requestWake(); } tick(); } });
window.addEventListener('hashchange', render);

/* ---------- Démarrage ---------- */
C.load();
if (navigator.storage && navigator.storage.persist) { navigator.storage.persist().catch(() => {}); }
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
if (C.st().session) { requestWake(); }
render();
})();
