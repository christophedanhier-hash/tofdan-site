// Page-pilote pour la generation serveur des fiches PDF.
// Usage : test2.html#fiche:<nom_fr>   (le nom_fr doit etre exact)
// Elle selectionne la constellation AVANT d'imprimer, puis laisse Chrome capturer.
(function () {
  var h = (location.hash || '').slice(1);
  if (h.indexOf('fiche:') !== 0) { return; }   // les autres modes restent au banc d'origine
  var cible = decodeURIComponent(h.slice(6));

  // 1. mode 'toutes' : sinon le catalogue masque les constellations non observables ce soir
  try {
    var k = 'constellations.observation';
    var o = JSON.parse(localStorage.getItem(k)) || {};
    o.mode = 'toutes';
    localStorage.setItem(k, JSON.stringify(o));
  } catch (e) { /* ignore */ }

  function attendreIndex(n) {
    if (n > 600) { return; }
    var btns = document.querySelectorAll('.carte-btn');
    if (!btns.length) { return setTimeout(function () { attendreIndex(n + 1); }, 100); }
    // 2. trouver la vignette dont l'aria-label commence par le nom demande
    var c = null;
    for (var i = 0; i < btns.length; i++) {
      var a = btns[i].getAttribute('aria-label') || '';
      if (a.indexOf(cible) === 0) { c = btns[i]; break; }
    }
    if (!c) { marquer('INTROUVABLE:' + cible); return; }
    c.click();
    // 3. attendre que la fiche soit chargee (le bouton d'impression apparait)
    attendreFiche(0, cible);
  }

  function attendreFiche(n, nom) {
    if (n > 400) { return marquer('FICHE_NON_CHARGEE:' + nom); }
    var b = document.querySelector('.ariane-impression button');
    if (!b) { return setTimeout(function () { attendreFiche(n + 1, nom); }, 100); }
    b.click();
    setTimeout(function () {
      var items = document.querySelectorAll('.menu-impression button');
      var une = null;
      for (var i = 0; i < items.length; i++) {
        if ((items[i].textContent || '').toLowerCase().indexOf('cette') >= 0) { une = items[i]; }
      }
      if (!une) { return marquer('MENU_ABSENT'); }
      une.click();
      attendreZone(0, nom);
    }, 600);
  }

  function attendreZone(n, nom) {
    n++;
    var z = document.getElementById('impression');
    var k = z ? z.querySelectorAll('.imp-const').length : 0;
    if (k === 0 && n < 300) { return setTimeout(function () { attendreZone(n, nom); }, 250); }
    setTimeout(function () {
      var zz = document.getElementById('impression');
      marquer('FICHE=' + nom + ' CONST=' + (zz ? zz.querySelectorAll('.imp-const').length : -1) +
        ' IMG=' + (zz ? zz.querySelectorAll('img').length : -1) +
        ' CANVAS=' + (zz ? zz.querySelectorAll('canvas').length : -1));
    }, 2500);
  }

  function marquer(t) {
    var d = document.createElement('div');
    d.id = 'test-resultat';
    d.textContent = t;
    document.body.appendChild(d);
  }

  window.addEventListener('load', function () { attendreIndex(0); });
})();