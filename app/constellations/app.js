(function () {
  'use strict';

  var CLE = 'constellations.progression';
  var W = 800, H = 600, MARGE = 60, TOTAL = 5;
  var DEG = Math.PI / 180;

  var ecran = document.getElementById('ecran');
  var ariane = document.getElementById('ariane');
  var erreur = document.getElementById('erreur');

  var etat = { index: null, data: null, id: null, etape: 1, reprise: 0, traits: [], reperes: true, couleur: '#1a4f8b', epaisseur: 3 };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  function lireProgression() {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
  }
  function sauver() {
    try {
      var p = lireProgression();
      p[etat.id] = etat.etape;
      localStorage.setItem(CLE, JSON.stringify(p));
    } catch (e) { /* stockage indisponible */ }
  }

  function aller(n) {
    etat.etape = n;
    if (etat.id) sauver();
    rendre();
  }

  function charger(id, fichier) {
    return fetch('data/' + fichier).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) { etat.data = d; etat.id = id; });
  }

  // Projection stéréographique centrée sur le barycentre (moyenne des vecteurs unitaires)
  function projeter(etoiles) {
    var sx = 0, sy = 0, sz = 0;
    etoiles.forEach(function (s) {
      var a = s.ra_deg * DEG, d = s.dec_deg * DEG;
      sx += Math.cos(d) * Math.cos(a); sy += Math.cos(d) * Math.sin(a); sz += Math.sin(d);
    });
    var l0 = Math.atan2(sy, sx), p0 = Math.atan2(sz, Math.hypot(sx, sy));
    var pts = etoiles.map(function (s) {
      var l = s.ra_deg * DEG, p = s.dec_deg * DEG;
      var k = 2 / (1 + Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0));
      // l'est (AD croissante) est à gauche sur le ciel
      return {
        x: -k * Math.cos(p) * Math.sin(l - l0),
        y: k * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0))
      };
    });
    var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    pts.forEach(function (q) {
      minx = Math.min(minx, q.x); maxx = Math.max(maxx, q.x);
      miny = Math.min(miny, q.y); maxy = Math.max(maxy, q.y);
    });
    var dx = (maxx - minx) || 1e-9, dy = (maxy - miny) || 1e-9;
    var ech = Math.min((W - 2 * MARGE) / dx, (H - 2 * MARGE) / dy);
    var ox = (W - dx * ech) / 2, oy = (H - dy * ech) / 2;
    return pts.map(function (q) {
      return { x: ox + (q.x - minx) * ech, y: oy + (maxy - q.y) * ech };
    });
  }

  function positions() {
    if (!etat.data._pos) etat.data._pos = projeter(etat.data.etoiles);
    return etat.data._pos;
  }

  function nouveauCanvas(classe) {
    var c = el('canvas', { width: W, height: H, class: classe || '' });
    return c;
  }

  function dessinerTraits(ctx) {
    etat.traits.forEach(function (t) {
      ctx.strokeStyle = t.couleur; ctx.lineWidth = t.epaisseur;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      t.pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      if (t.pts.length === 1) ctx.lineTo(t.pts[0].x + 0.01, t.pts[0].y);
      ctx.stroke();
    });
  }

  // Reperes de l'ecran de dessin : un point + LE NOM de l'etoile, pour que
  // l'eleve sache ou placer chaque etoile et laquelle est laquelle.
  // Anti-chevauchement : chaque etiquette est testee contre les boites deja posees.
  function dessinerReperes(ctx) {
    var pos = positions();
    var boites = [];
    var LARGE = function (t) { return ctx.measureText(t).width; };

    ctx.font = '13px system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    // 1) les points (toujours dessines)
    ctx.fillStyle = '#9a9a9a';
    pos.forEach(function (p) {
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI); ctx.fill();
    });

    // 2) les noms, avec recherche de la 1re position libre autour du point
    ctx.fillStyle = '#5b5b5b';
    ctx.font = '12px system-ui, sans-serif';
    etat.data.etoiles.forEach(function (s, i) {
      var p = pos[i];
      if (!p) return;
      var l = LARGE(s.nom), h = 12;
      var essais = [
        [10, -10, 'left'], [-10, -10, 'right'],
        [10, 14, 'left'],  [-10, 14, 'right'],
        [0, -20, 'center'], [0, 24, 'center'],
        [10, 0, 'left'],   [-10, 0, 'right']
      ];
      var choisi = null;
      for (var k = 0; k < essais.length; k++) {
        var dx = essais[k][0], dy = essais[k][1], al = essais[k][2];
        var x = p.x + dx, y = p.y + dy;
        var g = al === 'left' ? x : (al === 'right' ? x - l : x - l / 2);
        var b = { x1: g - 2, y1: y - h / 2 - 1, x2: g + l + 2, y2: y + h / 2 + 1 };
        // hors cadre ?
        if (b.x1 < 2 || b.x2 > W - 2) continue;
        // collision avec une etiquette deja posee ?
        var libre = boites.every(function (o) {
          return b.x2 < o.x1 || b.x1 > o.x2 || b.y2 < o.y1 || b.y1 > o.y2;
        });
        // collision avec un point-repere ?
        if (libre) {
          var tPoint = pos.every(function (q) {
            return q.x < b.x1 || q.x > b.x2 || q.y < b.y1 || q.y > b.y2;
          });
          if (tPoint) { choisi = { b: b, x: x, y: y, al: al }; break; }
        }
      }
      if (!choisi) { choisi = { b: null, x: p.x + 10, y: p.y - 10, al: 'left' }; }
      if (choisi.b) boites.push(choisi.b);
      ctx.textAlign = choisi.al;
      ctx.fillText(s.nom, choisi.x, choisi.y);
    });
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
  }

  function fond(ctx) {
    ctx.fillStyle = '#fbf9f3';
    ctx.fillRect(0, 0, W, H);
  }

  function redessiner(canvas) {
    var ctx = canvas.getContext('2d');
    fond(ctx);
    if (etat.reperes) dessinerReperes(ctx);
    dessinerTraits(ctx);
  }

  // ---------- Mise en page : mesure de l'espace REELLEMENT disponible ----------
  var LARGEUR_MIN = 820;   // en dessous : une colonne, defilement naturel
  var HAUTEUR_MIN = 300;   // en dessous : on ne ecrase pas l'ecran, on laisse defiler

  function ajuster() {
    var zones = ecran.querySelectorAll('.zone');
    var travail = etat.etape === 1 || etat.etape === 3 || etat.etape === 4;
    ecran.classList.remove('fixe');
    ecran.style.height = '';
    Array.prototype.forEach.call(zones, function (z) { z.style.height = ''; });

    var large = window.innerWidth >= LARGEUR_MIN;
    if (travail && large) {
      var pied = document.querySelector('.footer');
      var piedH = pied && pied.offsetParent !== null ? pied.offsetHeight : 0;
      var haut = ecran.getBoundingClientRect().top + window.pageYOffset;
      var dispo = Math.floor(window.innerHeight - haut - piedH - 8);
      if (dispo >= HAUTEUR_MIN) {
        ecran.style.height = dispo + 'px';
        ecran.classList.add('fixe');
      }
    }
    var fixe = ecran.classList.contains('fixe');

    Array.prototype.forEach.call(zones, function (z) {
      var c = z.querySelector('canvas');
      if (!c) return;
      var w = z.clientWidth, h;
      if (fixe) {
        h = z.clientHeight;
      } else {
        h = Math.min(w * 3 / 4, window.innerHeight * 0.8);
        z.style.height = Math.round(h) + 'px';
      }
      // ratio 4/3 conserve : la plus petite des deux contraintes decide
      var cw = Math.max(80, Math.min(w, h * 4 / 3));
      c.style.width = Math.round(cw) + 'px';
      c.style.height = Math.round(cw * 3 / 4) + 'px';
    });
  }

  // ---------- Écrans ----------
  function boutonEtape(texte, cible, classe) {
    return el('button', { class: 'btn ' + classe, text: texte, onclick: function () { aller(cible); } });
  }

  function ecran1() {
    var d = etat.data;
    var courant = etat.index.constellations.filter(function (x) { return x.id === etat.id; })[0] || {};
    var liste = el('ul', { class: 'liste-const', 'aria-label': 'Constellations disponibles' });
    etat.index.constellations.forEach(function (c) {
      var actif = (c.id === etat.id);
      var attrs = {
        class: 'btn-lien', 'aria-current': actif ? 'true' : 'false',
        onclick: function () {
          if (actif) return;
          charger(c.id, c.fichier).then(function () {
            var n = Number(lireProgression()[c.id]);
            etat.reprise = (n >= 2 && n <= TOTAL) ? n : 0;
            etat.etape = 1;
            etat.traits = [];
            rendre();
          });
        }
      };
      liste.appendChild(el('li', null, [el('button', attrs, [
        c.nom_fr, el('small', { text: c.nom_latin + ' · ' + c.abreviation })
      ])]));
    });

    var btns = [el('button', { class: 'btn btn--primary', text: 'Commencer', onclick: function () { aller(2); } })];
    if (etat.reprise && etat.reprise >= 2) {
      btns.push(el('button', {
        class: 'btn btn--outline', text: '↻ Reprendre (étape ' + etat.reprise + ')',
        onclick: function () { aller(etat.reprise); }
      }));
    }
    var meta = d.nom_latin + ' (' + d.abreviation_iau + ') · ' + d.saison +
      (d.voie_lactee ? ' · Voie lactée' : '');

    return el('section', null, [
      el('div', { class: 'accueil' }, [
        liste,
        el('div', { class: 'carte-const' }, [
          el('div', { class: 'entete-const' }, [
            el('h2', { text: d.nom_fr }),
            el('span', { class: 'meta', text: meta }),
            el('div', { class: 'btns' }, btns)
          ]),
          el('div', { class: 'fig' }, [
            el('img', { src: courant.figure_svg || '', alt: 'Figure de la constellation ' + d.nom_fr })
          ])
        ])
      ])
    ]);
  }

  function ecran2() {
    var d = etat.data;
    var tbody = el('tbody');
    d.etoiles.forEach(function (s) {
      var role = el('td', { text: s.role });
      if (s.alerte) role.appendChild(el('div', { class: 'alerte', text: s.alerte }));
      tbody.appendChild(el('tr', null, [
        el('td', { text: s.nom }), el('td', { text: s.bayer }),
        el('td', { text: String(s.mag) }), role, el('td', { text: s.visibilite })
      ]));
    });
    var thead = el('thead', null, [el('tr', null,
      ['Nom', 'Bayer', 'Magnitude', 'Rôle', 'Visibilité'].map(function (t) { return el('th', { text: t }); }))]);
    return el('section', null, [
      el('h1', { class: 'titre', text: 'Fiche élève — ' + d.nom_fr }),
      el('div', { class: 'table-wrap' }, [el('table', { class: 'fiche' }, [thead, tbody])]),
      el('div', { class: 'encart' }, [
        el('p', null, [el('strong', { text: 'Repère principal : ' }), d.repere_principal]),
        el('p', { text: d.message_animation }),
        el('p', null, [el('strong', { text: 'Constellations voisines : ' }), d.constellations_voisines.join(' · ')])
      ]),
      el('div', { class: 'nav-etapes' }, [
        boutonEtape('← Précédent', 1, 'btn--outline'),
        boutonEtape('Dessiner →', 3, 'btn--primary')
      ])
    ]);
  }

  function ecran3() {
    var canvas = nouveauCanvas();
    canvas.setAttribute('aria-label', 'Zone de dessin de la constellation');
    var btnRep = el('button', {
      class: 'btn btn--outline' + (etat.reperes ? ' actif' : ''),
      text: etat.reperes ? 'Masquer les repères' : 'Afficher les repères',
      onclick: function () {
        etat.reperes = !etat.reperes;
        btnRep.textContent = etat.reperes ? 'Masquer les repères' : 'Afficher les repères';
        btnRep.classList.toggle('actif', etat.reperes);
        redessiner(canvas);
      }
    });
    var selEp = el('select', { id: 'ep', onchange: function () { etat.epaisseur = Number(selEp.value); } },
      [[2, 'Fin'], [4, 'Moyen'], [8, 'Épais']].map(function (o) {
        var opt = el('option', { value: String(o[0]), text: o[1] });
        if (o[0] === etat.epaisseur || (o[0] === 4 && etat.epaisseur === 3)) opt.selected = true;
        return opt;
      }));
    etat.epaisseur = Number(selEp.value);
    var selCo = el('select', { id: 'co', onchange: function () { etat.couleur = selCo.value; } },
      [['#1a4f8b', 'Bleu'], ['#c0392b', 'Rouge'], ['#2e7d32', 'Vert'], ['#222222', 'Noir']].map(function (o) {
        var opt = el('option', { value: o[0], text: o[1] });
        if (o[0] === etat.couleur) opt.selected = true;
        return opt;
      }));
    etat.couleur = selCo.value;

    var barre = el('div', { class: 'barre' }, [
      el('strong', { class: 'petit', text: 'Dessine ' + etat.data.nom_fr }),
      el('button', { class: 'btn btn--outline', text: 'Effacer', onclick: function () { etat.traits = []; redessiner(canvas); } }),
      el('button', { class: 'btn btn--outline', text: 'Annuler', onclick: function () { etat.traits.pop(); redessiner(canvas); } }),
      el('label', { for: 'ep', text: 'Épaisseur' }), selEp,
      el('label', { for: 'co', text: 'Couleur' }), selCo,
      btnRep,
      el('span', { class: 'espace' }),
      boutonEtape('← Précédent', 2, 'btn--outline'),
      boutonEtape('Comparer au corrigé →', 4, 'btn--primary')
    ]);

    var courant = null;
    // coordonnees ecran -> coordonnees internes 800x600, quelle que soit la taille affichee
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
    }
    canvas.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignoré */ }
      courant = { couleur: etat.couleur, epaisseur: etat.epaisseur, pts: [pos(e)] };
      etat.traits.push(courant);
      redessiner(canvas);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!courant) return;
      courant.pts.push(pos(e));
      redessiner(canvas);
    });
    function fin() { courant = null; }
    canvas.addEventListener('pointerup', fin);
    canvas.addEventListener('pointercancel', fin);

    redessiner(canvas);
    return el('section', null, [barre, el('div', { class: 'zone' }, [canvas])]);
  }

  function ecran4() {
    var d = etat.data;
    var cu = nouveauCanvas('fige'), cc = nouveauCanvas('fige');
    cu.setAttribute('role', 'img'); cu.setAttribute('aria-label', 'Ton dessin');
    cc.setAttribute('role', 'img'); cc.setAttribute('aria-label', 'Corrigé de la constellation ' + d.nom_fr);
    var pos = positions();

    var ctx = cu.getContext('2d');
    fond(ctx); dessinerTraits(ctx);

    ctx = cc.getContext('2d');
    fond(ctx);
    ctx.strokeStyle = '#1a4f8b'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    d.figure.liaisons.forEach(function (l) {
      var a = pos[l[0]], b = pos[l[1]];
      if (!a || !b) return;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    ctx.font = '16px system-ui, sans-serif';
    d.etoiles.forEach(function (s, i) {
      var p = pos[i];
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI); ctx.fill();
      var droite = p.x < W - 160;
      ctx.textAlign = droite ? 'left' : 'right';
      ctx.fillText(s.nom, p.x + (droite ? 10 : -10), p.y - 8);
    });

    return el('section', null, [
      el('div', { class: 'barre' }, [
        el('strong', { class: 'petit', text: 'Comparaison — ' + d.nom_fr }),
        el('span', { class: 'espace' }),
        boutonEtape('← Précédent', 3, 'btn--outline'),
        boutonEtape('Questions →', 5, 'btn--primary')
      ]),
      el('div', { class: 'comparaison' }, [
        el('figure', null, [el('figcaption', { text: 'Ton dessin' }), el('div', { class: 'zone' }, [cu])]),
        el('figure', null, [el('figcaption', { text: 'Corrigé (une construction possible)' }), el('div', { class: 'zone' }, [cc])]),
        el('aside', { class: 'synthese', tabindex: '0', 'aria-label': 'Synthèse' }, [
          el('h2', { text: 'Pour comprendre' }),
          el('p', null, [el('strong', { text: 'Géométrie : ' }), d.figure.note_geometrie]),
          el('p', null, [el('strong', { text: 'Tracé retenu : ' }), d.figure.commentaire]),
          el('p', null, [el('em', { text: d.figure.mode_libre })])
        ])
      ])
    ]);
  }

  function ecran5() {
    var d = etat.data;
    function blocQuestion(qr) {
      var rep = el('p', { class: 'reponse', text: qr.r });
      rep.hidden = true;
      var btn = el('button', { class: 'btn btn--outline', text: 'Voir la réponse', onclick: function () {
        rep.hidden = !rep.hidden;
        btn.textContent = rep.hidden ? 'Voir la réponse' : 'Masquer la réponse';
      } });
      return el('div', { class: 'question' }, [el('p', null, [el('strong', { text: qr.q })]), btn, rep]);
    }
    var guide = (d.questions_guide || []).map(blocQuestion);
    var observation = (d.questions_observation || []).map(blocQuestion);
    return el('section', null, [
      el('h1', { class: 'titre', text: 'Questions — ' + d.nom_fr }),
      el('div', { class: 'questions' }, guide),
      el('h2', { class: 'sous', text: "Questions d'observation" }),
      el('div', { class: 'observation' }, observation),
      el('div', { class: 'nav-etapes' }, [
        boutonEtape('← Précédent', 4, 'btn--outline'),
        el('button', { class: 'btn btn--primary', text: 'Recommencer', onclick: function () { etat.traits = []; aller(1); } })
      ])
    ]);
  }

  var LIBELLES = ['', 'Catalogue', 'Fiche', 'Dessin', 'Comparaison', 'Questions'];

  function rendre() {
    ariane.textContent = '';
    erreur.hidden = true;
    /* Marque l'ecran courant sur <body> : le CSS masque le pied de page
       pendant l'exercice (ecrans 3 et 4). */
    document.body.setAttribute('data-ecran', String(etat.etape));
    for (var i = 1; i <= TOTAL; i++) {
      (function (n) {
        var b = el('button', { type: 'button', text: n + ' · ' + LIBELLES[n], onclick: function () { aller(n); } });
        if (n === etat.etape) b.setAttribute('aria-current', 'step');
        ariane.appendChild(b);
      })(i);
    }
    ecran.textContent = '';
    var section;
    try {
      section = [null, ecran1, ecran2, ecran3, ecran4, ecran5][etat.etape]();
    } catch (e) {
      // Un ecran qui plante ne doit JAMAIS laisser la page vide et muette.
      afficherErreur('L\'écran ' + etat.etape + ' n\'a pas pu s\'afficher : ' + e.message);
      return;
    }
    if (!section) {
      afficherErreur('L\'écran ' + etat.etape + ' n\'a rien renvoyé (données incomplètes).');
      return;
    }
    ecran.appendChild(section);
    window.scrollTo(0, 0);
    ajuster();
  }

  window.addEventListener('resize', ajuster);

  // Le menu du site ne connait pas cette page (sous-dossier) : on marque « Constellations »
  Array.prototype.forEach.call(document.querySelectorAll('.nav__link'), function (a) {
    if (a.href === window.location.href.split(/[?#]/)[0]) a.classList.add('nav__link--active');
  });

  function afficherErreur(msg) {
    erreur.textContent = msg + ' — reviens au début avec le bouton ci-dessous.';
    erreur.hidden = false;
    var barre = el('div', { class: 'carte' }, [
      el('button', { class: 'btn', text: '← Retour au début', onclick: function () { erreur.hidden = true; aller(1); } })
    ]);
    ecran.appendChild(barre);
  }

  fetch('data/index.json').then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (idx) {
    etat.index = idx;
    var prog = lireProgression();
    // On rouvre toujours sur l'ACCUEIL (etape 1) : un visiteur qui revient doit
    // voir le catalogue, jamais atterrir au milieu d'un parcours. On restaure
    // seulement la derniere constellation consultee, et l'etape memorisee sert
    // a proposer la reprise via le bouton « Reprendre » de l'ecran d'accueil.
    var cible = idx.constellations.filter(function (c) { return prog[c.id]; })[0] || idx.constellations[0];
    return charger(cible.id, cible.fichier).then(function () {
      var n = Number(prog[cible.id]);
      etat.reprise = (n >= 2 && n <= TOTAL) ? n : 0;
      etat.etape = 1;
      rendre();
    });
  }).catch(function (e) {
    erreur.hidden = false;
    erreur.textContent = 'Chargement impossible : ' + e.message + ' (ouvrir via un serveur web, pas en file://).';
  });
})();
