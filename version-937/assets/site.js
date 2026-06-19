(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-index]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide-index')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .rank-item'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var selectedYear = '';

        filterSelects.forEach(function (select) {
            if (select.getAttribute('data-filter') === 'year') {
                selectedYear = select.value;
            }
        });

        var visibleCount = 0;

        cards.forEach(function (card) {
            var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
            var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
            var visible = matchesQuery && matchesYear;
            card.classList.toggle('hidden-card', !visible);

            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visibleCount === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterSelects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var streamUrl = player.getAttribute('data-stream-url');
        var started = false;
        var hlsInstance = null;

        function beginPlayback() {
            if (!video || !streamUrl) {
                return;
            }

            if (button) {
                button.classList.add('is-hidden');
            }

            video.setAttribute('controls', 'controls');

            if (!started) {
                started = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }

                video.src = streamUrl;
            }

            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener('click', beginPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    beginPlayback();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
