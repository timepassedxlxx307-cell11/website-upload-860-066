(function () {
    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function updateEmptyState(cards) {
        var emptyState = document.querySelector("[data-empty-state]");
        if (!emptyState) {
            return;
        }
        var visible = Array.prototype.some.call(cards, function (card) {
            return !card.classList.contains("is-hidden");
        });
        emptyState.hidden = visible;
    }

    function applyFilters() {
        var cards = document.querySelectorAll(".movie-card");
        if (!cards.length) {
            return;
        }
        var inputs = document.querySelectorAll("[data-search-input]");
        var typeFilter = document.querySelector("[data-filter-type]");
        var yearFilter = document.querySelector("[data-filter-year]");
        var keyword = "";
        Array.prototype.some.call(inputs, function (input) {
            if (input.value.trim()) {
                keyword = normalizeText(input.value);
                return true;
            }
            return false;
        });
        var typeValue = typeFilter ? typeFilter.value : "";
        var yearValue = yearFilter ? yearFilter.value : "";

        Array.prototype.forEach.call(cards, function (card) {
            var searchText = normalizeText(card.getAttribute("data-search"));
            var typeText = card.getAttribute("data-type") || "";
            var yearText = card.getAttribute("data-year") || "";
            var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
            var matchedType = !typeValue || typeText === typeValue;
            var matchedYear = !yearValue || yearText === yearValue;
            card.classList.toggle("is-hidden", !(matchedKeyword && matchedType && matchedYear));
        });

        updateEmptyState(cards);
    }

    function setupSearch() {
        var inputs = document.querySelectorAll("[data-search-input]");
        var typeFilter = document.querySelector("[data-filter-type]");
        var yearFilter = document.querySelector("[data-filter-year]");
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("q");

        Array.prototype.forEach.call(inputs, function (input) {
            if (initialKeyword) {
                input.value = initialKeyword;
            }
            input.addEventListener("input", applyFilters);
            input.addEventListener("keydown", function (event) {
                var cards = document.querySelectorAll(".movie-card");
                if (event.key === "Enter" && !cards.length && input.value.trim()) {
                    window.location.href = "category-movies.html?q=" + encodeURIComponent(input.value.trim());
                }
            });
        });

        if (typeFilter) {
            typeFilter.addEventListener("change", applyFilters);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilters);
        }
        applyFilters();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = document.querySelectorAll("[data-hero-slide]");
        var dots = document.querySelectorAll("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;

        function showSlide(index) {
            current = index;
            Array.prototype.forEach.call(slides, function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            Array.prototype.forEach.call(dots, function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        Array.prototype.forEach.call(dots, function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5200);
    }

    window.setupMoviePlayer = function (videoId, layerId, url) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var hls = null;
        var prepared = false;

        if (!video || !url) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            prepare();
            video.controls = true;
            if (layer) {
                layer.classList.add("hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupSearch();
        setupHero();
    });
})();
