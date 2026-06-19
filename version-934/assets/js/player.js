(function () {
  function startPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    function play() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.play().catch(function () {});
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
  }

  document.querySelectorAll('[data-player]').forEach(startPlayer);
})();
