// Attend que l'app soit prete, declenche l'impression demandee,
// puis laisse Chrome produire le PDF (--print-to-pdf).
(function () {
  var mode = (location.hash || '#une').slice(1);

  function attendreApp(n) {
    if (n > 400) { return; }
    var b = document.querySelector('.ariane-impression button');
    var ec = document.getElementById('ecran');
    if (!b || !ec || ec.children.length === 0) {
      return setTimeout(function () { attendreApp(n + 1); }, 100);
    }
    b.click();
    setTimeout(function () {
      var items = document.querySelectorAll('.menu-impression button');
      var cible = null;
      for (var i = 0; i < items.length; i++) {
        var t = (items[i].textContent || '').toLowerCase();
        if (mode === 'une' && t.indexOf('cette') >= 0) cible = items[i];
        if (mode === 'visibles' && t.indexOf('visible') >= 0) cible = items[i];
        if (mode === 'toutes' && t.indexOf('fiches') >= 0 && t.indexOf('cette') < 0) cible = items[i];
      }
      if (!cible) { return; }
      cible.click();
      var essais = 0;
      function attendreZone() {
        essais++;
        var z = document.getElementById('impression');
        var c = z ? z.querySelectorAll('.imp-const').length : 0;
        if (c === 0 && essais < 200) return setTimeout(attendreZone, 250);
        // zone construite : on laisse le temps aux figures de charger, puis pause.
        setTimeout(function () {
          // marqueur lisible dans le PDF lui-meme
          var d = document.createElement('div');
          d.id = 'test-resultat';
          d.textContent = 'MODE=' + mode + ' CONST=' + c +
            ' P1=' + (z ? z.querySelectorAll('.imp-p1').length : -1) +
            ' P2=' + (z ? z.querySelectorAll('.imp-p2').length : -1) +
            ' FIG=' + (z ? z.querySelectorAll('.imp-figure').length : -1) +
            ' IMG=' + (z ? z.querySelectorAll('img').length : -1);
          document.body.appendChild(d);
        }, 2000);
      }
      attendreZone();
    }, 800);
  }
  attendreApp(0);
})();