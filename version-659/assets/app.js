(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = document.getElementById("menu-button");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
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
  }

  function initFilters() {
    var list = document.querySelector(".filter-list");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".filter-card"));
    var search = document.getElementById("page-search");
    var region = document.getElementById("region-filter");
    var type = document.getElementById("type-filter");
    var year = document.getElementById("year-filter");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function apply() {
      var q = normalize(search && search.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-keywords"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var visible = true;
        if (q && haystack.indexOf(q) === -1) {
          visible = false;
        }
        if (r && normalize(card.getAttribute("data-region")) !== r) {
          visible = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          visible = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          visible = false;
        }
        card.classList.toggle("hidden", !visible);
      });
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

function initPlayer(videoId, triggerId, videoUrl) {
  var video = document.getElementById(videoId);
  var trigger = document.getElementById(triggerId);
  if (!video || !trigger || !videoUrl) {
    return;
  }

  var started = false;
  var hls = null;

  function playVideo() {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function start() {
    if (started) {
      trigger.classList.add("hidden");
      playVideo();
      return;
    }

    started = true;
    trigger.classList.add("hidden");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = videoUrl;
    video.addEventListener("loadedmetadata", playVideo, { once: true });
    playVideo();
  }

  trigger.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });
  video.addEventListener("play", function () {
    trigger.classList.add("hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended && started) {
      trigger.classList.add("hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
