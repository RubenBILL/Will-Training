/* Will Training : données du programme (séances, pictogrammes, échauffements) */
(function () {
'use strict';

/* ---------- Pictogrammes (viewBox 0 0 100 100) ---------- */
const B = '#F3F0EA', O = '#FF6B2C', G = '#8A929B';
const p = (d, c, w) => '<path d="' + d + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
const c = (x, y, r, f) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (f || B) + '"/>';
const co = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + G + '" stroke-width="3"/>';
const rect = (x, y, w, h, col) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + col + '"/>';

const SVGS = {
  pullup: p('M16 12 H84', G, 4) + c(50, 26, 7) + p('M50 38 V66 M50 66 L43 90 M50 66 L58 88', B, 5) + p('M34 12 L38 30 L47 40 M66 12 L62 30 L53 40', O, 5) + p('M86 44 V24 M80 30 L86 24 L92 30', O, 3),
  row: p('M26 86 L70 46', G, 7) + c(76, 38, 7) + p('M38 68 L66 44 M38 68 L32 84 L24 90', B, 5) + p('M62 48 L50 58 L50 76', O, 5) + p('M43 78 H57', G, 6) + p('M86 76 V58 M80 64 L86 58 L92 64', O, 3),
  preacher: p('M52 34 L74 58', G, 7) + c(40, 20, 7) + p('M40 32 V62 H66 V90', B, 5) + p('M42 40 L62 52 L68 34', O, 5) + p('M86 54 V34 M80 40 L86 34 L92 40', O, 3),
  hammer: c(46, 16, 7) + p('M46 28 V60 M46 60 L40 90 M46 60 L54 90', B, 5) + p('M46 34 L48 52 L60 38', O, 5) + p('M64 28 V46', G, 7) + p('M82 56 V36 M76 42 L82 36 L88 42', O, 3),
  lowcurl: p('M12 18 V92', G, 4) + co(12, 86, 5) + p('M12 86 L60 40', G, 2.5) + c(50, 16, 7) + p('M50 28 V60 M50 60 L44 90 M50 60 L58 90', B, 5) + p('M50 34 L52 52 L62 40', O, 5) + p('M84 56 V36 M78 42 L84 36 L90 42', O, 3),
  pushdown: p('M90 8 V92', G, 4) + co(90, 12, 5) + p('M90 12 L62 64', G, 2.5) + c(44, 18, 7) + p('M44 30 V62 M44 62 L38 90 M44 62 L52 90', B, 5) + p('M44 36 L44 54 L60 66', O, 5) + p('M20 44 V64 M14 58 L20 64 L26 58', O, 3),
  overhead: p('M12 18 V92', G, 4) + co(12, 88, 5) + p('M12 88 L40 16', G, 2.5) + c(60, 24, 7) + p('M56 34 V62 M56 62 L50 90 M56 62 L64 90', B, 5) + p('M56 38 L58 10 L42 16', O, 5) + p('M86 44 V22 M80 28 L86 22 L92 28', O, 3),
  lateral: c(50, 18, 7) + p('M50 30 V62 M50 62 L42 90 M50 62 L58 90', B, 5) + p('M50 36 L22 40 M50 36 L78 40', O, 5) + p('M20 33 V47 M80 33 V47', G, 7) + p('M10 64 V48 M5 54 L10 48 L15 54 M90 64 V48 M85 54 L90 48 L95 54', O, 3),
  facepull: p('M12 8 V60', G, 4) + co(12, 16, 5) + p('M12 16 L52 30', G, 2.5) + c(62, 18, 7) + p('M66 30 V62 M66 62 L60 90 M66 62 L74 90', B, 5) + p('M66 36 L54 32 L52 26', O, 5) + p('M30 54 H14 M20 48 L14 54 L20 60', O, 3),
  farmer: c(50, 16, 7) + p('M50 28 V60 M50 60 L40 90 M50 60 L60 88', B, 5) + p('M50 34 L36 60 M50 34 L64 60', O, 5) + p('M28 62 H44 M56 62 H72', G, 8),
  inclinepress: p('M18 88 L62 46', G, 6) + c(70, 40, 7) + p('M62 50 L38 74 L52 80 L52 92', B, 5) + p('M60 52 V24', O, 5) + p('M52 24 H68', G, 7) + p('M86 46 V26 M80 32 L86 26 L92 32', O, 3),
  shoulderpress: p('M38 28 V68', G, 5) + p('M30 68 H64', G, 5) + c(48, 22, 7) + p('M48 34 V64 H62 V90', B, 5) + p('M48 38 L34 26 L38 10 M48 38 L62 26 L58 10', O, 5) + p('M30 10 H46 M50 10 H66', G, 7) + p('M86 42 V22 M80 28 L86 22 L92 28', O, 3),
  inclinecurl: p('M20 90 L58 40', G, 6) + c(66, 31, 7) + p('M62 42 L40 72 L54 78 L54 92', B, 5) + p('M60 44 L62 66 L76 54', O, 5) + p('M72 46 L82 62', G, 7) + p('M88 72 V52 M82 58 L88 52 L94 58', O, 3),
  boxjump: '<rect x="58" y="64" width="32" height="26" rx="3" fill="none" stroke="' + G + '" stroke-width="4"/>' + c(38, 16, 7) + p('M38 28 V52 M38 34 L20 24 M38 34 L56 24', B, 5) + p('M38 52 L28 64 L36 76 M38 52 L50 60 L46 72', O, 5) + p('M14 80 V54 M8 60 L14 54 L20 60', O, 3),
  legpress: p('M16 90 L88 28', G, 3) + c(17, 83, 6) + p('M24 76 L42 60', B, 5) + p('M42 60 L58 44 L70 58', O, 5) + p('M65 52 L75 64', G, 6),
  rdl: c(68, 36, 7) + p('M36 52 L62 42', B, 5) + p('M36 52 L34 72 L32 92', O, 5) + p('M62 44 L60 68', B, 5) + p('M44 68 H76', G, 5) + p('M46 58 V78 M74 58 V78', G, 6) + p('M14 48 V72 M8 66 L14 72 L20 66', O, 3),
  /* échauffement */
  bike: '<circle cx="26" cy="68" r="14" fill="none" stroke="' + B + '" stroke-width="4"/><circle cx="74" cy="68" r="14" fill="none" stroke="' + B + '" stroke-width="4"/>' + p('M26 68 L44 40 L66 40 L74 68 M44 40 L52 68 L26 68 M66 40 L62 26 M40 40 H50', O, 4),
  wrist: p('M12 84 L44 62', B, 8) + p('M44 62 L60 50', B, 13) + p('M42 34 A22 22 0 1 1 26 50', O, 4) + p('M22 42 L26 51 L36 48', O, 4),
  wriststretch: p('M10 60 H56', B, 8) + p('M56 60 L64 38', B, 8) + p('M88 20 L68 40', O, 5) + c(88, 18, 6, O),
  shoulderrot: c(50, 18, 7) + p('M50 30 V64 M50 64 L42 92 M50 64 L58 92 M50 36 L30 62 M50 36 L70 62', B, 5) + p('M22 30 A12 12 0 1 1 26 44', O, 4) + p('M78 30 A12 12 0 1 0 74 44', O, 4),
  hang: p('M16 10 H84', G, 4) + c(50, 26, 7) + p('M50 38 V68 M50 68 L46 94 M50 68 L54 94', B, 5) + p('M36 10 L46 38 M64 10 L54 38', O, 5),
  plates: p('M8 60 H92', G, 4) + rect(16, 53, 6, 14, G) + rect(24, 48, 6, 24, G) + rect(32, 40, 8, 40, O) + rect(60, 40, 8, 40, O) + rect(70, 48, 6, 24, G) + rect(78, 53, 6, 14, G),
  pushup: p('M8 88 H92', G, 3) + c(78, 40, 7) + p('M70 46 L24 74 L18 86', B, 5) + p('M66 48 L66 86', O, 5) + p('M88 66 V50 M82 56 L88 50 L94 56', O, 3),
  bwsquat: c(46, 18, 7) + p('M46 30 L36 60', B, 5) + p('M46 36 L68 40', B, 5) + p('M36 60 L60 64 L56 90', O, 5) + p('M50 90 H66', G, 3) + p('M16 50 V72 M10 66 L16 72 L22 66', O, 3)
};

/* ---------- Exercices ---------- */
const X = (o) => Object.assign({ sets: 3, rest: 90, step: 2, pre: '', hand: false, bw: false, tag: '', ru: 'rép.', rs: 1, tips: [], m1: [], m2: [], ramp: false }, o);

const DAYS = {
  mar: {
    name: 'Mardi', short: 'Mar.', title: 'Poussée + triceps + épaules',
    note: 'À finir avant 18 h 30 · MMA à 19 h 45',
    ex: [
      X({ key: 'mar_incline', n: 'Développé incliné haltères', mu: 'Pectoraux et épaules', w: 24, lo: 6, hi: 8, rest: 150, step: 2, hand: true, ill: 'inclinepress', m1: ['pecs'], m2: ['delts', 'triceps'], tips: ['Banc incliné à 30 degrés, omoplates serrées.', 'Descends en 2 secondes, poignets droits.'], alt: { n: 'Développé incliné à la machine convergente', w: 40, hand: false, step: 5, ill: 'inclinepress' } }),
      X({ key: 'mar_shoulder', n: 'Développé épaules haltères', mu: 'Épaules', w: 16, lo: 8, hi: 10, rest: 120, step: 2, hand: true, ill: 'shoulderpress', m1: ['delts'], m2: ['triceps', 'traps'], tips: ['Dos calé contre le dossier.', 'Pousse sans cambrer, coudes un peu en avant.'], alt: { n: 'Développé épaules à la machine', w: 35, hand: false, step: 5, ill: 'shoulderpress' } }),
      X({ key: 'mar_lateral', n: 'Élévations latérales', mu: 'Épaules, largeur', w: 6, sets: 4, lo: 12, hi: 15, rest: 60, step: 1, hand: true, ill: 'lateral', m1: ['delts'], tips: ['Sans élan, monte jusqu’à l’horizontale.', 'Petit coude fléchi, le petit doigt vers le haut.'], alt: { n: 'Élévations latérales à la poulie basse', w: 4, hand: false, step: 1, ill: 'lateral' } }),
      X({ key: 'mar_overhead', n: 'Extension triceps poulie, au-dessus de la tête', mu: 'Triceps, longue portion', w: 17, sets: 4, lo: 10, hi: 12, rest: 90, step: 2, ill: 'overhead', m1: ['triceps'], tips: ['Coudes serrés près des oreilles.', 'Étire complètement derrière la tête.'], alt: { n: 'Extension triceps haltère au-dessus de la tête', w: 16, hand: false, step: 2, ill: 'overhead' } }),
      X({ key: 'mar_pushdown', n: 'Pushdown corde', mu: 'Triceps', w: 25, lo: 10, hi: 12, rest: 0, step: 2.5, tag: 'Superset A · 1 sur 2', ill: 'pushdown', m1: ['triceps'], tips: ['Coudes collés, écarte la corde en bas.', 'Enchaîne tout de suite avec le curl incliné.'], alt: { n: 'Pushdown à la barre droite', w: 25, hand: false, step: 2.5, ill: 'pushdown' } }),
      X({ key: 'mar_inclinecurl', n: 'Curl incliné haltères', mu: 'Biceps, chef long', w: 8, lo: 8, hi: 12, rest: 60, step: 1, hand: true, tag: 'Superset A · 2 sur 2', ill: 'inclinecurl', ramp: true, m1: ['biceps'], m2: ['forearms'], tips: ['Bras qui pendent derrière le buste, étirement complet.', 'Descente en 3 secondes, sans élan.'], alt: { n: 'Curl pupitre à la machine', w: 20, hand: false, step: 5, ill: 'preacher' } })
    ]
  },
  jeu: {
    name: 'Jeudi', short: 'Jeu.', title: 'Jambes + bras',
    note: 'À finir avant 18 h 30 · MMA à 21 h',
    ex: [
      X({ key: 'jeu_box', n: 'Sauts sur caisse', mu: 'Jambes, explosivité', w: 0, lo: 4, hi: 4, rest: 90, bw: true, ill: 'boxjump', m1: ['quads', 'glutes', 'calves'], tips: ['Saute fort, redescends en marchant.', 'Réception silencieuse, genoux dans l’axe.'], alt: { n: 'Sauts verticaux sur place', w: 0, hand: false, step: 0, ill: 'boxjump' } }),
      X({ key: 'jeu_legpress', n: 'Presse à cuisses', mu: 'Quadriceps et fessiers', w: 80, lo: 10, hi: 12, rest: 120, step: 5, ill: 'legpress', m1: ['quads', 'glutes'], m2: ['hamstrings'], tips: ['Pieds à largeur d’épaules, bas du dos plaqué.', 'Descends jusque sous 90 degrés, sans verrouiller les genoux.'], alt: { n: 'Presse à cuisses à une jambe', w: 40, hand: false, step: 5, ill: 'legpress' } }),
      X({ key: 'jeu_rdl', n: 'Soulevé de terre roumain', mu: 'Ischios et fessiers', w: 30, lo: 8, hi: 10, rest: 120, step: 2.5, ill: 'rdl', m1: ['hamstrings', 'glutes'], m2: ['erectors'], tips: ['Pousse les hanches en arrière, dos plat.', 'La barre frôle les cuisses.'], alt: { n: 'Soulevé de terre roumain aux haltères', w: 14, hand: true, step: 1, ill: 'rdl' } }),
      X({ key: 'jeu_lowcurl', n: 'Curl poulie basse, une main', mu: 'Biceps', w: 7, lo: 10, hi: 12, rest: 60, step: 1, ill: 'lowcurl', ramp: true, m1: ['biceps'], m2: ['forearms'], tips: ['Bras légèrement derrière le corps pour étirer.', 'Un bras après l’autre, mêmes répétitions.'], alt: { n: 'Curl incliné haltères', w: 7, hand: true, step: 1, ill: 'inclinecurl' } }),
      X({ key: 'jeu_pushdown', n: 'Pushdown triceps', mu: 'Triceps', w: 20, lo: 10, hi: 12, rest: 60, step: 2.5, ill: 'pushdown', m1: ['triceps'], tips: ['Coudes collés au corps.', 'Extension complète en bas.'], alt: { n: 'Extension poulie haute au-dessus de la tête', w: 17, hand: false, step: 2.5, ill: 'overhead' } }),
      X({ key: 'jeu_lateral', n: 'Élévations latérales', mu: 'Épaules, largeur', w: 5, lo: 12, hi: 15, rest: 60, step: 1, hand: true, ill: 'lateral', m1: ['delts'], tips: ['Sans élan, monte jusqu’à l’horizontale.', 'Contrôle la descente.'], alt: { n: 'Élévations latérales à la poulie basse', w: 4, hand: false, step: 1, ill: 'lateral' } })
    ]
  },
  ven: {
    name: 'Vendredi', short: 'Ven.', title: 'Tirage + bras + épaules',
    note: 'Pas de MMA · environ 80 min',
    ex: [
      X({ key: 'ven_pullup', n: 'Tractions prise neutre, lestées', mu: 'Dos et biceps', w: 5, lo: 6, hi: 8, rest: 150, step: 2.5, pre: '+', ill: 'pullup', m1: ['lats'], m2: ['biceps', 'traps'], tips: ['Pars bras tendus, menton au-dessus de la barre.', 'Descends en 2 secondes.'], alt: { n: 'Tirage vertical poulie, prise neutre', w: 45, hand: false, step: 2.5, ill: 'pullup' } }),
      X({ key: 'ven_row', n: 'Rowing poitrine appuyée', mu: 'Dos', w: 20, lo: 8, hi: 10, rest: 120, step: 2, hand: true, ill: 'row', m1: ['lats', 'traps'], m2: ['biceps', 'delts'], tips: ['Rapproche les omoplates en haut du mouvement.', 'Ne tire pas avec le bas du dos.'], alt: { n: 'Rowing haltère un bras, appui sur banc', w: 22, hand: true, step: 2, ill: 'row' } }),
      X({ key: 'ven_preacher', n: 'Curl pupitre à la machine', mu: 'Biceps, chef court', w: 20, lo: 8, hi: 10, rest: 90, step: 5, ill: 'preacher', m1: ['biceps'], tips: ['Aisselles calées sur le coussin.', 'Descente en 3 secondes, étirement complet en bas.'], alt: { n: 'Curl incliné haltères', w: 8, hand: true, step: 1, ill: 'inclinecurl' } }),
      X({ key: 'ven_hammer', n: 'Curl marteau haltères', mu: 'Biceps et brachial', w: 10, lo: 8, hi: 10, rest: 90, step: 1, hand: true, ill: 'hammer', m1: ['biceps'], m2: ['forearms'], tips: ['Coudes fixes le long du corps.', 'Descente en 3 secondes, sans élan.'], alt: { n: 'Curl marteau à la poulie corde', w: 15, hand: false, step: 2.5, ill: 'lowcurl' } }),
      X({ key: 'ven_ropecurl', n: 'Curl poulie corde', mu: 'Biceps', w: 10, lo: 12, hi: 15, rest: 0, step: 2, tag: 'Superset A · 1 sur 2', ill: 'lowcurl', m1: ['biceps'], tips: ['Poignets neutres, 1 seconde de contraction en haut.', 'Enchaîne tout de suite avec le pushdown.'], alt: { n: 'Curl marteau haltères', w: 10, hand: true, step: 1, ill: 'hammer' } }),
      X({ key: 'ven_pushdown1', n: 'Pushdown à une main', mu: 'Triceps', w: 10, lo: 12, hi: 15, rest: 60, step: 2, tag: 'Superset A · 2 sur 2', ill: 'pushdown', m1: ['triceps'], tips: ['Coude collé au corps, un bras après l’autre.', 'Extension complète en bas.'], alt: { n: 'Pushdown à la barre droite, deux mains', w: 20, hand: false, step: 2.5, ill: 'pushdown' } }),
      X({ key: 'ven_overhead', n: 'Extension triceps au-dessus de la tête', mu: 'Triceps, longue portion', w: 16, lo: 10, hi: 12, rest: 90, step: 2, ill: 'overhead', m1: ['triceps'], tips: ['Coudes serrés près des oreilles.', 'Étire complètement derrière la tête.'], alt: { n: 'Extension triceps haltère au-dessus de la tête', w: 16, hand: false, step: 2, ill: 'overhead' } }),
      X({ key: 'ven_lateral', n: 'Élévations latérales', mu: 'Épaules, largeur', w: 5, lo: 15, hi: 20, rest: 0, step: 1, hand: true, tag: 'Superset B · 1 sur 2', ill: 'lateral', m1: ['delts'], tips: ['Sans élan, monte jusqu’à l’horizontale.', 'Enchaîne tout de suite avec le face pull.'], alt: { n: 'Élévations latérales à la poulie basse', w: 4, hand: false, step: 1, ill: 'lateral' } }),
      X({ key: 'ven_facepull', n: 'Face pull', mu: 'Arrière de l’épaule', w: 15, lo: 12, hi: 15, rest: 60, step: 2, tag: 'Superset B · 2 sur 2', ill: 'facepull', m1: ['delts', 'traps'], tips: ['Corde tirée vers le visage, coudes hauts.', 'Garde les épaules basses.'], alt: { n: 'Face pull à genoux, poulie haute', w: 15, hand: false, step: 2.5, ill: 'facepull' } }),
      X({ key: 'ven_farmer', n: 'Farmer’s carry', mu: 'Avant-bras et prise', w: 20, lo: 30, hi: 30, rest: 90, step: 2, hand: true, ru: 'm', rs: 5, ill: 'farmer', m1: ['forearms'], m2: ['traps', 'erectors'], tips: ['Épaules basses, dos droit.', 'Pas courts et rapides.'], alt: { n: 'Farmer’s carry aux kettlebells', w: 22, hand: true, step: 2, ill: 'farmer' } })
    ]
  },
  sam: {
    name: 'Samedi', short: 'Sam.', title: 'Bonus bras (facultatif)',
    note: '20 à 25 min après le MMA · seulement si tu es en forme',
    ex: [
      X({ key: 'sam_altcurl', n: 'Curl haltères assis, en alternance', mu: 'Biceps', w: 8, lo: 12, hi: 15, rest: 0, step: 1, hand: true, tag: 'Superset · 1 sur 2', ill: 'hammer', m1: ['biceps'], m2: ['forearms'], tips: ['Assis, dos calé, un bras après l’autre.', 'Monte en tournant la paume, descente en 3 secondes.'], alt: { n: 'Curl poulie corde', w: 10, hand: false, step: 2, ill: 'lowcurl' } }),
      X({ key: 'sam_pushdown', n: 'Pushdown triceps', mu: 'Triceps', w: 20, lo: 12, hi: 15, rest: 60, step: 2.5, tag: 'Superset · 2 sur 2', ill: 'pushdown', m1: ['triceps'], tips: ['Coudes collés au corps.', 'Extension complète en bas.'], alt: { n: 'Extension poulie haute au-dessus de la tête', w: 17, hand: false, step: 2.5, ill: 'overhead' } }),
      X({ key: 'sam_lateral', n: 'Élévations latérales', mu: 'Épaules, largeur', w: 5, lo: 15, hi: 20, rest: 60, step: 1, hand: true, ill: 'lateral', m1: ['delts'], tips: ['Sans élan, monte jusqu’à l’horizontale.', 'Si le poignet ou le coude tire, saute le curl.'], alt: { n: 'Élévations latérales à la poulie basse', w: 4, hand: false, step: 1, ill: 'lateral' } })
    ]
  }
};

/* ---------- Muscles ---------- */
const M2G = {
  delts: 'Épaules', triceps: 'Triceps', biceps: 'Biceps',
  lats: 'Dos', traps: 'Dos', erectors: 'Dos',
  quads: 'Jambes', hamstrings: 'Jambes', glutes: 'Jambes', calves: 'Jambes',
  pecs: 'Pectoraux', forearms: 'Avant-bras', abs: 'Abdos'
};
const WEEK_TARGETS = [
  { g: 'Triceps', t: 16, pri: true },
  { g: 'Épaules', t: 16, pri: true },
  { g: 'Biceps', t: 15, pri: true },
  { g: 'Dos', t: 6, pri: false },
  { g: 'Jambes', t: 9, pri: false },
  { g: 'Pectoraux', t: 3, pri: false }
];

/* ---------- Cours de MMA ---------- */
const MMA = {
  2: { day: 'Mardi', h: 19, m: 45, label: '19 h 45', lieu: 'Vitry' },
  4: { day: 'Jeudi', h: 21, m: 0, label: '21 h', lieu: 'Vitry' },
  6: { day: 'Samedi', h: 10, m: 30, label: '10 h 30', lieu: 'Paris 13e' }
};

window.WT = { SVGS: SVGS, DAYS: DAYS, M2G: M2G, WEEK_TARGETS: WEEK_TARGETS, MMA: MMA };
})();
