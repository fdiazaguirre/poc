var FILE = 'videos/sample.mp4';
var NUM_CHUNKS = 5;
var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
var video = document.querySelector('video');

window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
  alert('MediaSource API is not available');
}

var mediaSource = new MediaSource();

video.src = window.URL.createObjectURL(mediaSource);

function callback(e) {
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);


  getVideo(FILE, function(uInt8Array) {
    var file = new Blob([uInt8Array], {type: 'video/mp4'});
    var chunkSize = Math.ceil(file.size / NUM_CHUNKS);

    // Slice the video into NUM_CHUNKS and append each to the media element.
    var i = 0;

    (function readChunk_(i) {
      var reader = new FileReader();

      // Reads aren't guaranteed to finish in the same order they're started in,
      // so we need to read + append the next chunk after the previous reader
      // is done (onload is fired).
      reader.onload = function(e) {
        sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
        console.log('appending chunk:' + i);
        if (i == NUM_CHUNKS - 1) {
          mediaSource.endOfStream();
        } else {
          if (video.paused) {
            video.play(); // Start playing after 1st chunk is appended.
          }
          readChunk_(++i);
        }
      };

      var startByte = chunkSize * i;
      var chunk = file.slice(startByte, startByte + chunkSize);

      reader.readAsArrayBuffer(chunk);
    })(i);  // Start the recursive call by self calling.
  });
}

// Chrome
mediaSource.addEventListener('sourceopen', callback, false);
// Safari
mediaSource.addEventListener('webkitsourceopen', callback, false);

mediaSource.addEventListener('webkitsourceended', function(e) {
  console.log('mediaSource readyState: ' + this.readyState);
}, false);

function getVideo(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('getVideo', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    callback(new Uint8Array(xhr.response));
  };
}