(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-target') || 'search.html';
      if (query) {
        window.location.href = target + '?q=' + encodeURIComponent(query);
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function setSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        setSlide(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        setSlide(index + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function filterCards(value) {
    var query = (value || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function(card) {
      var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      var matched = !query || haystack.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        shown += 1;
      }
    });
    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  if (filterInput && cards.length) {
    var queryName = filterInput.getAttribute('data-query-param');
    if (queryName) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get(queryName) || '';
      filterInput.value = query;
      filterCards(query);
    }
    filterInput.addEventListener('input', function() {
      filterCards(filterInput.value);
    });
  }
})();
