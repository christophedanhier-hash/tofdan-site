(function () {
  'use strict';

  var header = document.querySelector('.header');
  var nav = document.querySelector('.nav');
  var navToggle = document.querySelector('.nav__toggle');
  var navLinks = document.querySelectorAll('.nav__link');
  var backToTop = document.querySelector('.back-to-top');
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav--open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }

    link.addEventListener('click', function () {
      if (nav) {
        nav.classList.remove('nav--open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('back-to-top--visible');
      } else {
        backToTop.classList.remove('back-to-top--visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var name = document.getElementById('name');
      var email = document.getElementById('email');
      var message = document.getElementById('message');

      [name, email, message].forEach(function (field) {
        if (!field) return;
        field.classList.remove('form__input--error');
      });

      if (name && !name.value.trim()) {
        name.classList.add('form__input--error');
        valid = false;
      }

      if (email && (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))) {
        email.classList.add('form__input--error');
        valid = false;
      }

      if (message && !message.value.trim()) {
        message.classList.add('form__input--error');
        valid = false;
      }

      if (!valid) return;

      contactForm.style.display = 'none';
      var success = document.getElementById('form-success');
      if (success) {
        success.style.display = 'block';
      }
    });
  }

})();
