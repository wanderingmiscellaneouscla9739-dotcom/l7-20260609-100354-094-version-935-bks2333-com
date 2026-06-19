(function () {
  var mobileToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

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

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(panel) {
    var list = document.querySelector('[data-search-list]');
    var countBox = document.querySelector('[data-search-count]');

    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector('[data-search-input]');
    var category = panel.querySelector('[data-category-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var reset = panel.querySelector('[data-reset-filter]');
    var items = Array.prototype.slice.call(list.querySelectorAll('.search-item'));

    function runFilter() {
      var keyword = normalize(input ? input.value : '');
      var selectedCategory = category ? category.value : 'all';
      var selectedYear = year ? year.value : 'all';
      var visible = 0;

      items.forEach(function (item) {
        var text = normalize(item.textContent + ' ' + item.getAttribute('data-title') + ' ' + item.getAttribute('data-type'));
        var itemCategory = item.getAttribute('data-category') || '';
        var itemYear = item.getAttribute('data-year') || '';
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = selectedCategory === 'all' || itemCategory === selectedCategory;
        var okYear = selectedYear === 'all' || itemYear === selectedYear;
        var show = okKeyword && okCategory && okYear;

        item.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', runFilter);

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        input.value = q;
      }
    }

    if (category) {
      category.addEventListener('change', runFilter);
    }

    if (year) {
      year.addEventListener('change', runFilter);
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        if (category) {
          category.value = category.querySelector('option[selected]') ? category.querySelector('option[selected]').value : 'all';
        }

        if (year) {
          year.value = 'all';
        }

        runFilter();
      });
    }

    runFilter();
  }

  setupFilter(document.querySelector('[data-filter-panel]'));

  var hlsLoadPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadPromise) {
      return hlsLoadPromise;
    }

    hlsLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoadPromise;
  }

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-play');
    var source = video ? video.getAttribute('data-video-url') : '';
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachAndPlay() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      player.classList.add('is-playing');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }).catch(function () {
        video.src = source;
        video.play().catch(function () {});
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        attachAndPlay();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && started) {
        return;
      }

      attachAndPlay();
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
})();
