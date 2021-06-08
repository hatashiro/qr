const $canvas = document.querySelector('canvas');
const $figcaption = document.querySelector('figcaption');
const $video = document.createElement('video');

const canvasContext = $canvas.getContext("2d");

const mediaConstraint = {
  audio: false,
  video: {
    facingMode: 'environment',
  },
};

const qrOptions = {inversionAttempts: "dontInvert"};

let stream;
async function startRecording() {
  if (stream) stopRecording();
  stream = await navigator.mediaDevices.getUserMedia(mediaConstraint);

  $video.srcObject = stream;
  $video.setAttribute("playsinline", true);
  $video.play();
}

function stopRecording() {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
  stream = null;
}

async function main() {
  await startRecording();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  animationLoop(() => {
    const width = $video.videoWidth;
    const height = $video.videoHeight;

    if (width == 0 || height == 0) return;

    $canvas.width = width;
    $canvas.height = height;
    canvasContext.drawImage($video, 0, 0, width, height);

    const image = canvasContext.getImageData(0, 0, width, height);

    const code = jsQR(image.data, image.width, image.height, qrOptions);
    if (code) handleCode(code);
  });
}

const urlRE = /^https?:\/\//;

function handleCode({data, location}) {
  const points = [
    location.topLeftCorner,
    location.bottomLeftCorner,
    location.bottomRightCorner,
    location.topRightCorner,
  ];
  drawSquare(points, 'rgba(0, 150, 255, 0.4)');

  if (data.match(urlRE)) {
    $figcaption.innerHTML = '';
    const $a = document.createElement('a');
    $a.href = data;
    $a.textContent = data;
    $a.target = '_blank';
    $figcaption.appendChild($a);
  } else {
    $figcaption.textContent = data;
  }
}

function drawSquare(points, fill) {
  canvasContext.beginPath();
  canvasContext.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    canvasContext.lineTo(point.x, point.y);
  }
  canvasContext.closePath();
  canvasContext.fillStyle = fill;
  canvasContext.fill();
}

function animationLoop(handler) {
  (function tick() {
    handler();
    requestAnimationFrame(tick);
  })();
}

main();
