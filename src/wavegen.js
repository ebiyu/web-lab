let initialized = false;
let playing = false;

// api objects
let audioContext, gainNode, osciillatorNode;

let freq, gain, type;
setFreq(880);
setGain(1);
setType('sine');

function toggle() {
  if (!initialized) initialize();
  playing = !playing;
  if (playing) {
    setGain(1);
  } else {
    setGain(0);
  }
}

function initialize() {
  audioContext = new AudioContext();
  gainNode = audioContext.createGain();
  osciillatorNode = audioContext.createOscillator();
  osciillatorNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  initialized = true;

  setFreq(freq);
  setGain(gain);
  setType(type);

  osciillatorNode.start();
}

function setFreq(v) {
  if (v < 0) return;
  freq = v;
  document.getElementById('freqDisp').innerText = `${freq.toFixed(1)}Hz`;
  if (initialized) {
    osciillatorNode.frequency.value = freq;
  }
}

function setGain(v) {
  gain = v;
  if (initialized) {
    gainNode.gain.value = gain;
  }
}

function setType(v) {
  type = v;
  document.getElementById('typeDisp').innerText = type;
  if (initialized) {
    osciillatorNode.type = type;
  }
}

Array.from(document.getElementsByClassName('freq-btn')).forEach((el) => {
  el.addEventListener('click', () => {
    setFreq(freq + (el.dataset.freqChange - 0));
  });
});
Array.from(document.getElementsByClassName('wave-btn')).forEach((el) => {
  el.addEventListener('click', () => {
    setType(el.dataset.waveType);
  });
});
document.getElementById('togglebutton').addEventListener('click', () => {
  toggle();
});

export {};
