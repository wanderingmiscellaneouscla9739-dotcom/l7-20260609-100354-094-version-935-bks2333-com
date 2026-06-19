document.addEventListener('DOMContentLoaded', function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var heroImage = hero.querySelector('[data-hero-image]');
        var heroTitle = hero.querySelector('[data-hero-title]');
        var heroLine = hero.querySelector('[data-hero-line]');
        var heroMeta = hero.querySelector('[data-hero-meta]');
        var heroUrl = hero.querySelector('[data-hero-url]');
        var picks = hero.querySelectorAll('[data-hero-pick]');

        picks.forEach(function (pick) {
            pick.addEventListener('click', function () {
                if (heroImage) {
                    heroImage.src = pick.dataset.cover || heroImage.src;
                    heroImage.alt = pick.dataset.title || heroImage.alt;
                }

                if (heroTitle) {
                    heroTitle.textContent = pick.dataset.title || heroTitle.textContent;
                }

                if (heroLine) {
                    heroLine.textContent = pick.dataset.line || heroLine.textContent;
                }

                if (heroMeta) {
                    var meta = (pick.dataset.meta || '').split(' · ');
                    heroMeta.innerHTML = meta.map(function (item) {
                        return '<span>' + escapeHtml(item) + '</span>';
                    }).join('');
                }

                if (heroUrl) {
                    heroUrl.href = pick.dataset.url || heroUrl.href;
                }
            });
        });
    }

    var filter = document.querySelector('[data-filter]');

    if (filter) {
        var queryInput = filter.querySelector('[data-filter-query]');
        var yearSelect = filter.querySelector('[data-filter-year]');
        var regionSelect = filter.querySelector('[data-filter-region]');
        var typeSelect = filter.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        var applyFilter = function () {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var matchesQuery = !query || (card.dataset.search || '').indexOf(query) !== -1;
                var matchesYear = !year || card.dataset.year === year;
                var matchesRegion = !region || card.dataset.region === region;
                var matchesType = !type || card.dataset.type === type;
                card.hidden = !(matchesQuery && matchesYear && matchesRegion && matchesType);
            });
        };

        [queryInput, yearSelect, regionSelect, typeSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', applyFilter);
                node.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        var sourceNode = video.querySelector('source');
        var streamUrl = sourceNode ? sourceNode.getAttribute('src') : '';
        var hlsInstance = null;

        var start = function () {
            if (!streamUrl) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', streamUrl);
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                }
            } else if (!video.getAttribute('src')) {
                video.setAttribute('src', streamUrl);
            }

            player.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        };

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!player.classList.contains('is-playing')) {
                start();
            }
        });
    });
});

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[char];
    });
}
