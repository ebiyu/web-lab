var mergin = 5;
var rad = 250;
var ctx = document.getElementById('can').getContext('2d');
ctx.strokeStyle = '#000';
//円を描く
ctx.lineWidth = mergin * 2;
ctx.beginPath();
ctx.arc(rad + mergin, rad + mergin, rad, 0, Math.PI * 2, false);
ctx.stroke();
//長方形を描く
ctx.strokeRect(mergin, mergin, rad * 2, rad * 2);

ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(0, rad + mergin);
ctx.lineTo(rad * 2 + mergin * 2, rad + mergin);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(rad + mergin, 0);
ctx.lineTo(rad + mergin, rad * 2 + mergin * 2);
ctx.stroke();

window.onkeypress = function (e) {
  switch (e.key) {
    case 'Enter':
      speedup();
      break;
    case 'Backspace':
      speeddown();
      break;
    case ' ':
      e.preventDefault();
      pause = !pause;
  }
};
if ('ontouchend' in document) {
  document.getElementById('can').ontouchstart = function (e) {
    if (e.changedTouches[0].pageX < rad + mergin) {
      speeddown();
    } else if (e.changedTouches[0].pageX > rad * 3 + mergin * 3) {
      speedup();
    } else {
      pause = !pause;
    }
  };
} else {
  document.getElementById('can').onclick = function (e) {
    if (e.pageX < rad + mergin) {
      speeddown();
    } else if (e.pageX > rad * 3 + mergin * 3) {
      speedup();
    } else {
      pause = !pause;
    }
  };
}
function speedup() {
  if (spd < unit.length - 1) {
    spd++;
    printspd();
  }
}
function speeddown() {
  if (spd > 0) {
    spd--;
    printspd();
  }
}

var cnt = 0;
var incircle = 0;
var pi = 0;

var spd = 0;

var timeout = [1000, 500, 300, 200, 100, 50, 10, 0, 0, 0, 0, 0, 0, 0];
var unit = [1, 1, 1, 1, 1, 1, 1, 5, 10, 50, 100, 500, 1000, 9638];

printtxt();
printspd();

var pause = true;
loop();

function loop() {
  if (pause) {
    setTimeout(function () {
      loop();
    }, 10);
  } else {
    for (var i = 0; i < unit[spd]; ++i) calc();
    pi = (incircle / cnt) * 4;
    printtxt();
    setTimeout(function () {
      loop();
    }, timeout[spd]);
  }
}
function calc() {
  var x = Math.random() * 2 - 1;
  var y = Math.random() * 2 - 1;
  if (x ** 2 + y ** 2 < 1) {
    ctx.strokeStyle = '#00f';
    ++incircle;
    plot(x, y, true);
  } else {
    ctx.strokeStyle = '#f00';
    plot(x, y, false);
  }
  ++cnt;
}
function plot(x, y, inc) {
  if (inc) {
    ctx.strokeStyle = '#00f';
  } else {
    ctx.strokeStyle = '#f00';
  }
  ctx.lineWidth = mergin * 4;
  ctx.beginPath();
  ctx.moveTo(x * rad + rad - mergin, -y * rad + rad + mergin);
  ctx.lineTo(x * rad + rad + mergin * 3, -y * rad + rad + mergin);
  ctx.stroke();
}
function printspd() {
  ctx.strokeStyle = '#000';
  ctx.clearRect(rad * 3.8, 0, rad, rad / 6);
  ctx.font =
    String(rad / 10) +
    'px  "ヒラギノ丸ゴ ProN", "Hiragino Maru Gothic ProN","HG丸ｺﾞｼｯｸM-PRO","HGMaruGothicMPRO"';
  ctx.fillText('スピード:' + (spd + 1) + '/' + unit.length, rad * 3.8, rad / 8);
}
function printtxt() {
  ctx.strokeStyle = '#000';
  ctx.clearRect(rad * 2 + mergin * 4, rad / 6, rad * 4 + mergin * 4, rad * 2);
  ctx.font =
    String(rad / 4) +
    'px  "ヒラギノ丸ゴ ProN", "Hiragino Maru Gothic ProN","HG丸ｺﾞｼｯｸM-PRO","HGMaruGothicMPRO"';
  ctx.fillText('投げた数:' + cnt, rad * 2 + mergin * 4, rad / 2);
  ctx.fillText('入った数:' + incircle, rad * 2 + mergin * 4, rad);
  ctx.fillText('外れた数:' + (cnt - incircle), rad * 2 + mergin * 4, rad * 1.5);
  ctx.clearRect(0, rad * 2 + mergin * 2, rad * 10, rad);
  ctx.font =
    String(rad * 0.6) +
    'px  "ヒラギノ丸ゴ ProN", "Hiragino Maru Gothic ProN","HG丸ｺﾞｼｯｸM-PRO","HGMaruGothicMPRO"';
  ctx.fillText('π≒' + pi.toFixed(7), 0, rad * 2.7);
}
