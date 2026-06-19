(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

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
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function setupFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]"));

    sections.forEach(function (section) {
      var search = section.querySelector("[data-filter-search]");
      var year = section.querySelector("[data-filter-year]");
      var type = section.querySelector("[data-filter-type]");
      var reset = section.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var empty = section.querySelector("[data-empty-state]");

      function apply() {
        var query = normalize(search ? search.value : "");
        var selectedYear = year ? year.value : "all";
        var selectedType = type ? type.value : "all";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = selectedYear === "all" || cardYear === selectedYear;
          var matchesType = selectedType === "all" || cardType === selectedType;
          var isVisible = matchesQuery && matchesYear && matchesType;

          card.hidden = !isVisible;

          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }

      if (year) {
        year.addEventListener("change", apply);
      }

      if (type) {
        type.addEventListener("change", apply);
      }

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }

          if (year) {
            year.value = "all";
          }

          if (type) {
            type.value = "all";
          }

          apply();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && search) {
        search.value = query;
      }

      apply();
    });
  }

  window.setupMoviePlayer = function (videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var initialized = false;
    var player = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (initialized) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      initialized = true;
    }

    function play() {
      attach();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.controls = true;
      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!initialized) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
