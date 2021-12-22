// elements
const canvas = document.getElementById('canvas');
const disp = document.getElementById('disp');
const ctx = canvas.getContext('2d');

// drawing settings
const width = 500;
const height = 500;
const mapSize = 10; // m
const pxpm = width / mapSize; // px/m
const gridSize = 1; // m
const r = 5; // px

// simulation settings
const timeScale = 1;
const dt = 0.01;

// physical constants
const g = 9.8;
const G = 6.67408e-11;

// global variable
let t, running, simu, points;

// initialize
// initialize();

function initialize() {
  t = 0;
  running = false;
  // points = JSON.parse(JSON.stringify(initial));

  if (simu) clearInterval(simu);
  simu = setInterval(loop, (dt * 1000) / timeScale);

  // initial draw
  draw();
  drawText();
}

function pause() {
  running = !running;
  if (running) {
    document.getElementById('pauseButton').innerHTML = 'PAUSE';
  } else {
    document.getElementById('pauseButton').innerHTML = 'RESUME';
  }
}

function loop() {
  if (!running) return;

  // update time
  t += dt;

  // update velocity (equation of motion)
  points.forEach((point, i) => {
    console.log({ points, point });
    let gravity = points
      .map(({ x, y, m }, j) => {
        if (i == j) return { x: 0, y: 0 };
        const r = ((x - point.x) ** 2 + (y - point.y) ** 2) ** 0.5;
        return {
          x: (G * m * point.m * (x - point.x)) / r ** 3,
          y: (G * m * point.m * (y - point.y)) / r ** 3,
        };
      })
      .reduce((a, v) => ({ x: a.x + v.x, y: a.y + v.y }));
    console.log({ gravity });
    point.vx += (gravity.x / point.m) * dt;
    point.vy += (gravity.y / point.m) * dt;

    // let fall = point.m * g * dt;
    // point.vy += fall / point.m;
  });

  // update position
  points.forEach((point) => {
    point.x += point.vx * dt;
    point.y += point.vy * dt;
  });

  // update locus
  points.forEach((point) => {
    point.locus.push({ x: point.x, y: point.y });
  });

  draw();
  drawText();
}

function draw() {
  // clear previous drawings
  ctx.clearRect(0, 0, width, height);

  // draw grid
  ctx.strokeStyle = 'gray';
  for (let x = 0; x < width; x += pxpm * gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < width; y += pxpm * gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // draw points
  points.forEach(({ x, y, color }) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * pxpm, y * pxpm, r, 0, 360);
    ctx.closePath();
    ctx.fill();
  });

  // draw locus
  points.forEach(({ color, locus }) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    locus.forEach(({ x, y }) => {
      ctx.lineTo(x * pxpm, y * pxpm);
    });
    ctx.stroke();
  });
}

function drawText() {
  disp.innerHTML =
    '' +
    'Simulation Settings<br>' +
    `Grid Size: ${gridSize} m <br>` +
    `Time Scale: ${timeScale}x <br>` +
    `dt: ${dt.toFixed(3)} s<br>` +
    '<br>Current Values<br>' +
    `t = ${t.toFixed(3)} s <br>` +
    points
      .map(
        (point, i) =>
          `[${i}] (${point.x.toFixed(2)}, ${point.y.toFixed(
            2,
          )}) v = (${point.vx.toFixed(2)}, ${point.vy.toFixed(2)})`,
      )
      .join('<br>');
}

new Vue({
  el: '#app',
  data: {
    points: [
      { x: 4, y: 4, vx: 4, vy: 0, m: 1e12, locus: [], color: 'red' },
      { x: 6, y: 6, vx: -4, vy: 0, m: 1e12, locus: [], color: 'blue' },
    ],
  },
  methods: {
    load() {
      points = JSON.parse(JSON.stringify(this.points));
      initialize();
    },
    pause() {
      pause();
    },
  },
  mounted() {
    this.load();
  },
  watch: {
    points: {
      handler() {
        this.load();
      },
      deep: true,
    },
  },
});

export {};
