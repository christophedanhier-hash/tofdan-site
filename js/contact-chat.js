/* Contact : adresse obfusquée et envoi par mailto (la validation est faite par main.js) */
(function () {
  'use strict';

  // Fragments de l'adresse, jamais écrits en clair
  var fragments = ['christophe', '.', 'danhier'];
  var domaine = ['gm', 'ail', '.', 'com'];

  function adresse() {
    return fragments.join('') + String.fromCharCode(64) + domaine.join('');
  }

  // Affichage en texte seul (pas de lien mailto)
  var cibles = document.querySelectorAll('#contact-adresse, .contact-obfusque');
  for (var i = 0; i < cibles.length; i++) {
    cibles[i].textContent = adresse();
  }

  var formulaire = document.getElementById('contact-form');
  if (!formulaire) return;

  formulaire.addEventListener('submit', function () {
    if (formulaire.querySelector('.form__input--error')) return;

    var nom = document.getElementById('name').value.trim();
    var courriel = document.getElementById('email').value.trim();
    var objetChamp = document.getElementById('subject');
    var objet = objetChamp && objetChamp.value.trim() ? objetChamp.value.trim() : 'Message depuis tofdan.be';
    var message = document.getElementById('message').value.trim();

    var corps = message + '\n\n--\n' + nom + '\n' + courriel;
    window.location.href = 'mailto:' + adresse() +
      '?subject=' + encodeURIComponent(objet) +
      '&body=' + encodeURIComponent(corps);
  });
})();
