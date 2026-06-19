(function () {
    function startPlayer(player) {
        if (!player) {
            return;
        }

        var video = player.querySelector('video');
        var cover = player.querySelector('[data-play-trigger]');

        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-src');

        if (!stream) {
            return;
        }

        if (!video.getAttribute('src')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = stream;
            }
        }

        video.controls = true;

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var cover = player.querySelector('[data-play-trigger]');
        var video = player.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(player);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                startPlayer(player);
            });
        }
    });
})();
