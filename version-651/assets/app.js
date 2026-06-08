(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setHiddenBySearch(card, hidden) {
    card.classList.toggle("hidden-by-search", hidden);
  }

  function setHiddenByFilter(card, hidden) {
    card.classList.toggle("hidden-by-filter", hidden);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var activeIndex = 0;
    var timer = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-search-target") || ".movie-card";
      var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search") || card.textContent);
          setHiddenBySearch(card, query.length > 0 && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function setupFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    if (!buttons.length) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".library-grid .movie-card"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-value");
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        cards.forEach(function (card) {
          var cardValue = card.getAttribute("data-filter");
          setHiddenByFilter(card, value !== "all" && cardValue !== value);
        });
      });
    });
  }

  function setupScrollButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-to]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-scroll-to");
        var target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var toggle = player.querySelector("[data-player-toggle]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      if (source) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          player._hls = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (toggle) {
        toggle.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });

      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupFilters();
    setupScrollButtons();
    setupPlayers();
  });
})();
