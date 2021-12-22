import { questions } from './russian-typing-question';

var textbox = document.getElementById('textbox');
var label = document.getElementById('label');
var tweetbutton = document.getElementById('tweetbutton');
tweetbutton.style.visibility = 'hidden';

textbox.focus();

var n = 5;

var qno = 0; //今何問目か
var len = 0; //今まで入力した文字列の長さ
var miss = 0; //ミスタイプの回数

//各入力における変数
var rest = questions[0];
var done = '';

/*
0:メニュー
1:開始前
2:プレイ中
3:プレイ終了
*/
var state = 0;

redraw();

textbox.onkeypress = function (e) {
  if (state == 0 && e.keyCode == 13) {
    if (isNaN(textbox.value)) {
      textbox.value = '';
      window.alert('数字を指定してね！');
    } else if (Number(textbox.value) > questions.length) {
      textbox.value = '';
      window.alert(questions.length + '以下で指定してね！');
    } else if (Number(textbox.value) <= 0) {
      textbox.value = '';
      window.alert('正の数で指定してね！');
    } else {
      n = Number(textbox.value);
      textbox.value = '';
      init();
    }
  }
};
function text_update(e) {
  switch (state) {
    case 1:
      if (textbox.value == 'я') {
        start();
        redraw(done, '', rest);
      }
      break;
    case 2:
      var next = rest.substr(0, 1);
      if (textbox.value == next) {
        done += next;
        rest = rest.substr(1);
        if (rest == '') {
          len += done.length;
          ++qno;
          if (qno < n) {
            rest = questions[qno];
            done = '';
          } else {
            end();
          }
        }
        redraw(done, '', rest);
      } else {
        redraw(done, next, rest.substr(1));
        miss += 1;
      }
      break;
    case 3:
      if (textbox.value == ' ') {
        state = 0;
        textbox.oninput = function (e) {};
        redraw();
      }
      break;
  }
  textbox.value = '';
}

function redraw(ac = '', wa = '', normal = '') {
  switch (state) {
    case 0:
      label.innerHTML = '問題数を入力してEnterを押してください。';
      break;
    case 1:
      label.innerHTML = '入力をロシア語に変更して"я"を押してスタート';
      break;
    case 2:
      label.innerHTML =
        '<font class="AC">' +
        ac +
        '</font><font class="WA">' +
        wa.replace(' ', '␣') +
        '</font>' +
        normal.replace(' ', '␣');
      break;
  }
}

var starttime;
var time;
function start() {
  if (state == 1) {
    starttime = new Date();
    state = 2;
  }
}

function init() {
  for (var i = questions.length - 1; i > 0; i--) {
    var r = Math.floor(Math.random() * (i + 1));
    var tmp = questions[i];
    questions[i] = questions[r];
    questions[r] = tmp;
  }

  qno = 0; //今何問目か
  len = 0; //今まで入力した文字列の長さ
  miss = 0; //ミスタイプの回数

  //各入力における変数
  rest = questions[0];
  done = '';
  textbox.oninput = function (e) {
    text_update(e);
  };
  state = 1;
  redraw();
}

function end() {
  if (state == 2) {
    var time = new Date() - starttime;
    label.innerHTML = 'time:' + time / 1000 + '<br>';
    label.innerHTML += 'char:' + len + '<br>';
    var spd = (len / time) * 1000;
    label.innerHTML += spd.toFixed(2) + 'chars/s' + '<br>';
    label.innerHTML += 'miss:' + miss + '<br>';
    var pts = (spd * 20 - (miss / len) * 20).toFixed(2);
    label.innerHTML += '<strong>score:' + pts + '</strong><br>';
    label.innerHTML += 'SPACEで再挑戦';
    state = 3;

    tweetbutton.style.visibility = 'visible';
    tweetbutton.onclick = function (e) {
      window.open(
        'http://twitter.com/share?url=https://lab.ebiyuu.com/russian-typing.html&text=' +
          n +
          '問解いて，私のスコアは' +
          pts +
          '点でした！#ロシア語タイピング',
      );
    };
  }
}
