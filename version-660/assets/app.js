(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function getQueryValue(name) {
        return new URLSearchParams(window.location.search).get(name) || "";
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                var open = nav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
            });
        });

        var heroCards = Array.prototype.slice.call(document.querySelectorAll(".hero-card"));
        if (heroCards.length > 1) {
            var heroIndex = 0;
            setInterval(function () {
                heroCards[heroIndex].classList.remove("is-active");
                heroIndex = (heroIndex + 1) % heroCards.length;
                heroCards[heroIndex].classList.add("is-active");
            }, 4200);
        }

        var searchInput = document.getElementById("search-input");
        var resultArea = document.querySelector("[data-search-results]");
        var emptyState = document.querySelector("[data-search-empty]");
        var status = document.querySelector("[data-search-status]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var activeFilter = "";

        function applySearch() {
            if (!resultArea) {
                return;
            }
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var cards = Array.prototype.slice.call(resultArea.querySelectorAll(".movie-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var filter = card.getAttribute("data-filter") || "";
                var matchesText = !query || text.indexOf(query) !== -1;
                var matchesFilter = !activeFilter || filter === activeFilter;
                var show = matchesText && matchesFilter;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
            if (status) {
                status.textContent = query ? "搜索结果" : "输入关键词查找影片";
            }
        }

        if (searchInput && resultArea) {
            var initialQuery = getQueryValue("q");
            searchInput.value = initialQuery;
            searchInput.addEventListener("input", applySearch);
            filterButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    filterButtons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    activeFilter = button.getAttribute("data-filter-value") || "";
                    applySearch();
                });
            });
            if (filterButtons.length) {
                filterButtons[0].classList.add("is-active");
            }
            applySearch();
        }
    });
})();

function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var streamUrl = options.streamUrl;
    var started = false;

    if (!video || !overlay || !button || !streamUrl) {
        return;
    }

    function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function start() {
        if (started) {
            playVideo();
            return;
        }
        started = true;
        overlay.classList.add("is-hidden");
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true
            });
            video._hls = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            return;
        }

        video.src = streamUrl;
        playVideo();
    }

    overlay.addEventListener("click", start);
    button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
    });
    overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            start();
        }
    });
}
