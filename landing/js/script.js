/**
 * Landing page: FAQ accordion (single open) and any page-specific behaviour.
 */
(function () {
  var toggles = document.querySelectorAll('[data-faq-toggle]');
  var list = document.querySelector('.landing-faq-list');
  var allItems = list ? list.querySelectorAll('.landing-faq-item') : [];

  function closeAll() {
    allItems.forEach(function (item) {
      item.removeAttribute('data-open');
      var ans = item.querySelector('.landing-faq-answer');
      var btn = item.querySelector('[data-faq-toggle]');
      if (ans) ans.hidden = true;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.landing-faq-item');
      var answer = item.querySelector('.landing-faq-answer');
      var isOpen = item.hasAttribute('data-open');
      closeAll();
      if (!isOpen) {
        item.setAttribute('data-open', '');
        if (answer) answer.hidden = false;
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
