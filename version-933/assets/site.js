(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                form.action = form.getAttribute('action') || 'search.html';
            }
        });
    });

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-list]').forEach(function (scope) {
        var searchInput = scope.querySelector('[data-card-search]');
        var sortSelect = scope.querySelector('[data-sort-select]');
        var categorySelect = scope.querySelector('[data-category-filter]');
        var container = scope.querySelector('[data-card-container]');
        var emptyState = scope.querySelector('[data-empty-state]');

        if (!container) {
            return;
        }

        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));

        if (scope.hasAttribute('data-read-query') && searchInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query) {
                searchInput.value = query;
            }
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-region') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchedKeyword = !keyword || cardText(card).indexOf(keyword) > -1;
                var matchedCategory = !category || card.getAttribute('data-category') === category;
                var show = matchedKeyword && matchedCategory;
                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        function applySort() {
            var value = sortSelect ? sortSelect.value : 'default';
            var sorted = cards.slice();

            if (value === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                });
            }

            if (value === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
                });
            }

            if (value === 'title-asc') {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
                });
            }

            if (value !== 'default') {
                sorted.forEach(function (card) {
                    container.appendChild(card);
                });
            }

            applyFilter();
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilter);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', applySort);
        }

        applySort();
    });
})();
