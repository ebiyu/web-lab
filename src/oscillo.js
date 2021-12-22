// 参考: https://qiita.com/mhagita/items/6c7d73932d9a207eb94d

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

const canvas = document.getElementById('wave_canvas');
const fft_canvas = document.getElementById('fft_canvas');
const container = document.getElementById('canvas_container');

canvas.width = container.clientWidth;
canvas.height = (canvas.width * 3) / 4;
const width = canvas.width;
const height = canvas.height;
fft_canvas.width = width;
fft_canvas.height = height;

// fundamental settings
const x_divs = 10;
const y_divs = 10;

// variables
let divsize_x = 0.01; // s. / div

// draw settigns
const gridWidth = 1;
const gridWidth_bold = 2;
const waveWidth = 2;

const waveColor = '#ff0';

// buffer size
const bufferSize = 1024;

// objects for api
let localMediaStream = null;
let localScriptProcessor = null;
let audioContext = null;
let audioAnalyser = null;
let audioData = []; // wave data

// fft
const fft_points = 4096;
let fft_max_freq = 10000;
let fftData = [];

// flags
let recording = false;
let initialized = false;

// trigger
let triggerLevel = 0;
let trigger_type = 'up';

setInterval(trigger_check, 10);
let triggerIndex = 0;
let triggerDelta = 0;
let triggerLastChecked = 0;
let triggeredIndicator = 0;

function trigger_check() {
  if (!initialized) return;

  // abort if triggering has not ended
  const indexSize = divsize_x * x_divs * audioContext.sampleRate;
  if (audioData.length - triggerIndex < indexSize) {
    triggerLastChecked = audioData.length;
    return;
  }

  if (trigger_type == 'up') {
    // check positive edge
    let below = false;
    audioData.slice(triggerLastChecked).some((v, i) => {
      if (v > triggerLevel) {
        if (below) {
          trigger(triggerLastChecked + i);
          return true;
        }
      } else {
        below = true;
      }
    });
  } else {
    trigger(audioData.length);
  }

  triggerLastChecked = audioData.length;
}

function trigger(index) {
  triggerDelta = index - triggerIndex;
  triggerIndex = index;
  triggeredIndicator = 3;
}

setInterval(fft, 30);
function fft() {
  if (!initialized) return;

  const data = audioData.slice(audioData.length - fft_points, audioData.length);
  if (data.length < fft_points) return;

  // calc w
  const w = [
    Math.cos((Math.PI * 2) / fft_points),
    -Math.sin((Math.PI * 2) / fft_points),
  ];
  fftData = fft_r(
    data.map((r) => [r, 0]),
    w,
  ).map((c) => complex_abs(c));

  function fft_r(x, w) {
    const N = x.length;
    if (N == 1) return x;

    let x_even = [...Array(N / 2)];
    let x_odd = [...Array(N / 2)];
    let W = [1, 0];

    for (let i = 0; i < N / 2; i++) {
      x_even[i] = complex_add(x[i], x[i + N / 2]);
      x_odd[i] = complex_mul(W, complex_sub(x[i], x[i + N / 2]));
      W = complex_mul(W, w);
    }
    const w2 = complex_mul(w, w);
    const y_even = fft_r(x_even, w2);
    const y_odd = fft_r(x_odd, w2);
    return [...Array(N)].map((_, i) => {
      if (i % 2 == 0) {
        return y_even[i / 2];
      } else {
        return y_odd[(i - 1) / 2];
      }
    });
  }
}

function complex_add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function complex_sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function complex_mul(a, b) {
  return [a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]];
}

function complex_abs(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}

setInterval(draw, 30);
function draw() {
  drawText();
  drawWave();
  drawFFT();
}

function drawText() {
  const divsize_x_disp =
    divsize_x >= 1
      ? `${divsize_x.toFixed(2)} s/div`
      : divsize_x >= 1e-3
      ? `${(divsize_x * 1e3).toFixed(2)} ms/div`
      : `${(divsize_x * 1e6).toFixed(2)} us/div`;
  const trigger_indicate = triggeredIndicator > 0 ? 'Triggered' : '';
  triggeredIndicator -= 1;
  const trigger_disp =
    trigger_type == 'up'
      ? `Trigger Level ${triggerLevel.toFixed(2)}↑ ${trigger_indicate}`
      : 'No Trigger';
  document.getElementById(
    'bottomDisplay',
  ).innerHTML = `${divsize_x_disp} <span style="color: orange">${trigger_disp}</span>`;
}

function drawWave() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = '#fff';

  // horizontal grid
  [...Array(y_divs + 1)]
    .map((_, i) => i)
    .forEach((i) => {
      if (i * 2 == y_divs) {
        ctx.lineWidth = gridWidth_bold;
      } else {
        ctx.lineWidth = gridWidth;
      }
      const y = (i * height) / y_divs;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

  // vertical grid
  [...Array(x_divs + 1)]
    .map((_, i) => i)
    .forEach((i) => {
      if (i * 2 == x_divs) {
        ctx.lineWidth = gridWidth_bold;
      } else {
        ctx.lineWidth = gridWidth;
      }
      const x = (i * width) / x_divs;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

  // trigger level
  if (trigger_type == 'up') {
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = gridWidth_bold;
    const y = (0.5 - triggerLevel / 2) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (!initialized) return;

  const length = divsize_x * x_divs * audioContext.sampleRate;
  const startIndex = triggerIndex;

  ctx.strokeStyle = waveColor;
  ctx.lineWidth = waveWidth;

  ctx.beginPath();

  [...Array(width)]
    .map((_, i) => i)
    .forEach((x) => {
      let index = startIndex + Math.floor((x * length) / width);
      if (divsize_x < 0.01) {
        index -= triggerDelta;
      } else if (audioData.length > length && index > audioData.length) {
        index -= triggerDelta;
      }
      const val = audioData[index];
      const y = (0.5 - val / 2) * canvas.height;
      ctx.lineTo(x, y);
    });

  ctx.stroke();
}

function drawFFT() {
  const ctx = fft_canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = '#fff';

  // horizontal grid
  [...Array(y_divs + 1)]
    .map((_, i) => i)
    .forEach((i) => {
      ctx.lineWidth = gridWidth;
      const y = (i * height) / y_divs;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

  // vertical grid
  [...Array(x_divs + 1)]
    .map((_, i) => i)
    .forEach((i) => {
      ctx.lineWidth = gridWidth;
      const x = (i * width) / x_divs;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

  if (!initialized) return;

  ctx.strokeStyle = waveColor;
  ctx.lineWidth = waveWidth;

  ctx.beginPath();

  [...Array(width)]
    .map((_, i) => i)
    .forEach((x) => {
      const index = Math.floor(
        (((x * fft_max_freq) / audioContext.sampleRate) * fft_points) / width,
      );
      const val = fftData[index];
      const y = (1 - val / 100) * canvas.height;
      ctx.lineTo(x, y);
    });

  ctx.stroke();
}

function toggleRecording() {
  recording = !recording;
  document.getElementById('togglebutton').innerHTML = recording
    ? 'Stop'
    : 'Run';
  if (!initialized) initialize();
}

function initialize() {
  audioContext = new AudioContext();
  navigator.getUserMedia(
    { audio: true },
    (stream) => {
      localMediaStream = stream;
      const scriptProcessor = audioContext.createScriptProcessor(
        bufferSize,
        1,
        1,
      );
      localScriptProcessor = scriptProcessor;
      const mediastreamsource = audioContext.createMediaStreamSource(stream);
      mediastreamsource.connect(scriptProcessor);
      scriptProcessor.onaudioprocess = onAudioProcess;
      scriptProcessor.connect(audioContext.destination);
    },
    (e) => {
      console.log(e);
    },
  );

  initialized = true;
}

// recording loop
function onAudioProcess(e) {
  if (!recording) return;

  let input = e.inputBuffer.getChannelData(0);
  audioData = [...audioData, ...input];
}

// shortcut keys
document.onkeydown = (e) => {
  switch (e.keyCode) {
    case 32: // space
      toggleRecording();
      break;
    case 38: //up
      triggerLevel += 0.05;
      break;
    case 40: //down
      triggerLevel -= 0.05;
      break;
    case 37: //left
      divsize_x_down();
      break;
    case 39: //right
      divsize_x_up();
      break;
    case 84:
      toggleTrigger();
      break;
  }
};

function toggleTrigger() {
  trigger_type = trigger_type == 'up' ? '' : 'up';
}

function divsize_x_down() {
  divsize_x /= 10;
}

function divsize_x_up() {
  divsize_x *= 10;
}

// UIのボタンのトリガーを設定

document.getElementById('togglebutton').addEventListener('click', () => {
  toggleRecording();
});

document.getElementById('divSizeXDownButton').addEventListener('click', () => {
  divsize_x_down();
});
document.getElementById('divSizeXUpButton').addEventListener('click', () => {
  divsize_x_up();
});

document.getElementById('toggleTriggerButton').addEventListener('click', () => {
  toggleTrigger();
});

document.getElementById('triggerUpButton').addEventListener('click', () => {
  triggerLevel += 0.05;
});
document.getElementById('triggerDownButton').addEventListener('click', () => {
  triggerLevel -= 0.05;
});

export {};
