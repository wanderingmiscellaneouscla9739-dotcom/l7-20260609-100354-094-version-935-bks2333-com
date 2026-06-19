(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterCards(form) {
        var input = form.querySelector('[data-search-input]');
        var scope = document.querySelector('[data-search-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var keyword = normalize(input ? input.value : '');

        cards.forEach(function (card) {
            var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent);
            card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });

        if (keyword && scope.scrollIntoView) {
            scope.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards(form);
        });
        if (input) {
            input.addEventListener('input', function () {
                filterCards(form);
            });
        }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var source = video ? video.getAttribute('data-src') : '';
        var hls = null;
        var ready = false;

        function startPlayer() {
            if (!video || !source) {
                return;
            }

            if (!ready) {
                ready = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayer);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    startPlayer();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
