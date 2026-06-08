(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initMovieFilters() {
        var list = document.querySelector("[data-movie-list]");
        if (!list) {
            return;
        }
        var searchInput = document.querySelector("[data-movie-search]");
        var regionFilter = document.querySelector("[data-region-filter]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var sortFilter = document.querySelector("[data-sort-filter]");
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && searchInput) {
            searchInput.value = query;
        }

        function apply() {
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var term = normalize(searchInput ? searchInput.value : "");
            var region = normalize(regionFilter ? regionFilter.value : "");
            var type = normalize(typeFilter ? typeFilter.value : "");
            var shown = 0;

            if (sortFilter) {
                var sortValue = sortFilter.value;
                cards.sort(function (a, b) {
                    if (sortValue === "title") {
                        return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
                    }
                    if (sortValue === "oldest") {
                        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                    }
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
                cards.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-keywords") + " " + card.textContent);
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;
                if (term && text.indexOf(term) === -1) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = shown !== 0;
            }
        }

        [searchInput, regionFilter, typeFilter, sortFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function bindPlayer(frame) {
        var video = frame.querySelector("video[data-stream]");
        var overlay = frame.querySelector("[data-play-trigger]");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream");

        function prepare() {
            if (video.getAttribute("data-ready") === "true") {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            }
            video.setAttribute("data-ready", "true");
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        prepare();
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            prepare();
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
    }

    ready(function () {
        initMenu();
        initHero();
        initMovieFilters();
        initPlayers();
    });
})();
