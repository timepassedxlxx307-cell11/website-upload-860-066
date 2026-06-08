/*
    Static movie site interactions.
    This file intentionally stays readable: mobile navigation, page filtering,
    URL query hydration, and HLS player initialization are kept separate.
*/

function setupMobileNavigation() {
    const button = document.querySelector('[data-mobile-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function setupCardFilters() {
    const searchInputs = document.querySelectorAll('[data-search-input]');
    const typeFilters = document.querySelectorAll('[data-type-filter]');
    const yearFilters = document.querySelectorAll('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const countLabel = document.querySelector('[data-result-count]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (!cards.length) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
        searchInputs.forEach((input) => {
            input.value = query;
        });
    }

    function getCurrentValue(elements) {
        const element = elements[0];
        return element ? normalizeText(element.value) : '';
    }

    function applyFilters() {
        const keyword = getCurrentValue(searchInputs);
        const typeValue = getCurrentValue(typeFilters);
        const yearValue = getCurrentValue(yearFilters);
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = normalizeText([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(' '));
            const cardType = normalizeText(card.dataset.type);
            const cardYear = normalizeText(card.dataset.year);

            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesType = !typeValue || cardType.includes(typeValue);
            const matchesYear = !yearValue || cardYear === yearValue;
            const shouldShow = matchesKeyword && matchesType && matchesYear;

            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (countLabel) {
            countLabel.textContent = `当前显示 ${visibleCount} 部`;
        }

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    searchInputs.forEach((input) => {
        input.addEventListener('input', applyFilters);
    });

    typeFilters.forEach((select) => {
        select.addEventListener('change', applyFilters);
    });

    yearFilters.forEach((select) => {
        select.addEventListener('change', applyFilters);
    });

    applyFilters();
}

async function loadHlsModule() {
    const moduleUrl = new URL('./hls.esm.js', import.meta.url).href;
    return import(moduleUrl);
}

function bindNativeHls(video, sourceUrl) {
    video.src = sourceUrl;
    video.load();
}

async function bindHlsPlayer(video, sourceUrl) {
    if (!sourceUrl || video.dataset.hlsBound === 'true') {
        return;
    }

    video.dataset.hlsBound = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        bindNativeHls(video, sourceUrl);
        return;
    }

    try {
        const hlsModule = await loadHlsModule();
        const Hls = hlsModule.H || hlsModule.default || window.Hls;

        if (Hls && Hls.isSupported && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }
    } catch (error) {
        console.warn('HLS module could not be initialized:', error);
    }

    bindNativeHls(video, sourceUrl);
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll('[data-hls-player]'));

    players.forEach((video) => {
        const sourceUrl = video.dataset.videoUrl;
        const shell = video.closest('[data-video-shell]');
        const playButton = shell ? shell.querySelector('[data-play-button]') : null;

        const beginPlayback = async () => {
            await bindHlsPlayer(video, sourceUrl);

            try {
                await video.play();
            } catch (error) {
                console.warn('Playback requires a user gesture or the source is unavailable:', error);
            }
        };

        video.addEventListener('play', () => {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', () => {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('is-playing');
            }
        });

        video.addEventListener('click', () => {
            if (video.paused) {
                beginPlayback();
            } else {
                video.pause();
            }
        });

        if (playButton) {
            playButton.addEventListener('click', beginPlayback);
        }
    });
}

setupMobileNavigation();
setupCardFilters();
setupPlayers();
