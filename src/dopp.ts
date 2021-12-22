const canvas = document.getElementById('can') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const speedSpan = document.getElementById('speedSpan') as HTMLSpanElement;
const freqSpan = document.getElementById('freqSpan') as HTMLSpanElement;
const width = canvas.width;
const height = canvas.height;

const hagenImgRight = new Image();
hagenImgRight.src = require('./img/dopp/ambulance.png');
const hagenImgLeft = new Image();
hagenImgLeft.src = require('./img/dopp/ambulance-rev.png');

const icaston = new Image();
icaston.src = require('./img/dopp/caston.png');

let running = true;
let speed = 0.5;
let freq = 4; // frequency \propto ( 1 / freq )

const circles: [number, number, number][] = [];

type Hagen = {
  x: number;
  y: number;
  direction: 'left' | 'right';
};
const hagen: Hagen = { x: width / 4, y: height / 2, direction: 'right' };
const observer = { x: (width * 3) / 4, y: height / 2 };

let mousePos = { x: 0, y: 0 };

const hagenMoving = { left: false, right: false, up: false, down: false };
const observerMoving = { left: false, right: false, up: false, down: false };

let mouseMode: null | 'hagen' = null;

// マウスの移動においてmx, myを更新する
canvas.addEventListener(
  'mousemove',
  function (evt) {
    mousePos = getMousePosition(canvas, evt);
  },
  false,
);

function getMousePosition(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

window.addEventListener('keydown', function (e) {
  switch (e.key) {
    case 'j':
      observerMoving.left = true;
      break;
    case 'l':
      observerMoving.right = true;
      break;
    case 'i':
      observerMoving.up = true;
      break;
    case 'k':
      observerMoving.down = true;
      break;
    case 'a':
      hagenMoving.left = true;
      break;
    case 'd':
      hagenMoving.right = true;
      break;
    case 'w':
      hagenMoving.up = true;
      break;
    case 's':
      hagenMoving.down = true;
      break;
  }
});

window.addEventListener('keyup', function (e) {
  switch (e.key) {
    case 'j':
      observerMoving.left = false;
      break;
    case 'l':
      observerMoving.right = false;
      break;
    case 'i':
      observerMoving.up = false;
      break;
    case 'k':
      observerMoving.down = false;
      break;
    case 'a':
      hagenMoving.left = false;
      break;
    case 'd':
      hagenMoving.right = false;
      break;
    case 'w':
      hagenMoving.up = false;
      break;
    case 's':
      hagenMoving.down = false;
      break;
  }
});

window.addEventListener('keypress', function (e) {
  switch (e.key) {
    case ' ':
      e.preventDefault();
      running = !running;
      break;
    case 'm':
      if (mouseMode == 'hagen') {
        mouseMode = null;
      } else {
        mouseMode = 'hagen';
      }
      break;
    case '1':
      speed = 0.5;
      break;
    case '2':
      speed = 0.7;
      break;
    case '3':
      speed = 1;
      break;
    case '4':
      speed = 1.5;
      break;
    case '5':
      speed = 2;
      break;
    case '6':
      freq = 8;
      break;
    case '7':
      freq = 4;
      break;
    case '8':
      freq = 2;
      break;
    case '9':
      freq = 1;
      break;
  }
});

/**
 * キー入力の状態をもとに位置を更新します
 */
function updatePosition() {
  if (!running) return;
  if (mouseMode == 'hagen') {
    hagen.x = mousePos.x;
    hagen.y = mousePos.y;
  } else {
    const dx = -(hagenMoving.left ? 1 : 0) + (hagenMoving.right ? 1 : 0);
    const dy = -(hagenMoving.up ? 1 : 0) + (hagenMoving.down ? 1 : 0);

    const multiplyer = dx != 0 && dy != 0 ? 0.5 ** 0.5 : 1;
    hagen.x += 5 * speed * dx * multiplyer;
    hagen.y += 5 * speed * dy * multiplyer;
    switch (hagen.direction) {
      case 'left':
        if (dx > 0) hagen.direction = 'right';
        break;
      case 'right':
        if (dx < 0) hagen.direction = 'left';
        break;
    }
  }
  {
    const dx = -(observerMoving.left ? 1 : 0) + (observerMoving.right ? 1 : 0);
    const dy = -(observerMoving.up ? 1 : 0) + (observerMoving.down ? 1 : 0);
    const multiplyer = dx != 0 && dy != 0 ? 0.5 ** 0.5 : 1;
    observer.x += 5 * speed * dx * multiplyer;
    observer.y += 5 * speed * dy * multiplyer;
  }
}
setInterval(updatePosition, 20);

let prescaler = 0;
setInterval(function (evt) {
  if (!running) return;
  prescaler++;
  if (prescaler >= freq) {
    prescaler = 0;
    circles.push([0, hagen.x, hagen.y]);
    if (circles.length != 0) {
      if (circles[0][0] > 1000) {
        circles.shift();
      }
    }
  }
}, 50);

/**
 * 円の半径を大きくします。(音の伝播)
 */
function updateCircleRadius() {
  if (!running) return;
  for (let i = 0; i < circles.length; i++) {
    circles[i][0] += 5;
  }
}
setInterval(updateCircleRadius, 20);

/**
 * 描画
 */
function draw() {
  ctx.clearRect(0, 0, 1500, 1000);

  for (let i = 0; i < circles.length; i++) {
    drawCircle(circles[i][0], circles[i][1], circles[i][2]);
  }

  const hagenImg = hagen.direction == 'left' ? hagenImgLeft : hagenImgRight;
  ctx.drawImage(hagenImg, 0, 0, 450, 330, hagen.x - 50, hagen.y - 50, 100, 100);

  const castonSize = 200;
  ctx.drawImage(
    icaston,
    0,
    0,
    800,
    800,
    observer.x - castonSize / 2,
    observer.y - castonSize / 2,
    castonSize,
    castonSize,
  );

  speedSpan.innerText = `${speed}`;
  freqSpan.innerText = `${8 / freq}`;
}
setInterval(draw, 20);

function drawCircle(rad: number, x: number, y: number) {
  const ratio = Math.max(0, 1 - rad / 1000) ** 2;
  ctx.strokeStyle = `rgb(${255 - ratio * 255}, ${255 - ratio * 255}, ${
    255 - ratio * 255
  })`;

  ctx.fillStyle = `rgb(${255 - ratio * 80}, 255, 255)`;

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.fill();
}
