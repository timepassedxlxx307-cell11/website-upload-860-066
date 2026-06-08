(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-mobile-toggle]');
    if (toggle) {
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    qsa('[data-hero]').forEach(function (hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            });
        });

        show(0);
        start();
    });

    qsa('[data-search-input]').forEach(function (input) {
        var target = input.getAttribute('data-search-input') || document.body;
        var root = qs(target) || document;
        var items = qsa('[data-filter-item]', root);
        var empty = qs('[data-empty-state]', root);

        input.addEventListener('input', function () {
            var term = input.value.trim().toLowerCase();
            var visible = 0;

            items.forEach(function (item) {
                var haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                var matched = !term || haystack.indexOf(term) !== -1;
                item.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        });
    });

    qsa('[data-player-box]').forEach(function (box) {
        var video = qs('video', box);
        var button = qs('[data-play-button]', box);
        if (!video || !button) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var hls = null;
        var ready = false;

        function attach() {
            if (!stream || ready) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            box.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
            box.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
