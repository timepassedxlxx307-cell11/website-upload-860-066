(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-index")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scope = form.parentElement;
      var grid = scope ? scope.querySelector("[data-filter-grid]") : null;
      var cards = grid ? Array.prototype.slice.call(grid.children) : [];

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var q = normalize(form.elements.q && form.elements.q.value);
        var region = normalize(form.elements.region && form.elements.region.value);
        var type = normalize(form.elements.type && form.elements.type.value);
        var genre = normalize(form.elements.genre && form.elements.genre.value);

        cards.forEach(function (card) {
          var content = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = true;

          if (q && content.indexOf(q) === -1) {
            ok = false;
          }

          if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
            ok = false;
          }

          if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
            ok = false;
          }

          if (genre && normalize(card.getAttribute("data-genre")).indexOf(genre) === -1) {
            ok = false;
          }

          card.classList.toggle("hidden-by-filter", !ok);
        });
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);

      var query = new URLSearchParams(window.location.search).get("q");
      if (query && form.elements.q) {
        form.elements.q.value = query;
        apply();
      }
    });
  });

  window.initMoviePlayer = function (streamUrl, playerId) {
    var wrap = document.getElementById(playerId);
    if (!wrap) {
      return;
    }

    var video = wrap.querySelector("video");
    var button = wrap.querySelector("button");
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded || !video) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      load();
      wrap.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      wrap.classList.add("is-playing");
    });

    video.addEventListener("ended", function () {
      wrap.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
