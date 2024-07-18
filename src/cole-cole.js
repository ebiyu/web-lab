const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// complex number
const plus = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const sum = (Zs) => Zs.reduce(plus, { x: 0, y: 0 });
const div = (a, b) => {
  const r = b.x ** 2 + b.y ** 2;
  return { x: (a.x * b.x + a.y * b.y) / r, y: (a.y * b.x - a.x * b.y) / r };
};
const inv = (a) => div({ x: 1, y: 0 }, a);

// impedance
const R = (R) => (_) => ({ x: R, y: 0 });
const C = (C) => (f) => div({ x: 1, y: 0 }, { x: 0, y: 2 * Math.PI * f * C });
const parallel = (Zs) => (f) => inv(sum(Zs.map((Z) => inv(Z(f)))));

const getTickSize = (size) => {
  const baseTickSize = 10 ** Math.floor(Math.log10(size));
  if (size / baseTickSize < 2) return baseTickSize / 5;
  if (size / baseTickSize < 5) return baseTickSize / 2;
  return baseTickSize;
};

new Vue({
  el: '#app',
  data: {
    fmin: 1e-10,
    fmax: 1e10,
    fppd: 100,
    elements: [
      {
        R: { enabled: true, value: 1e6 },
        C: { enabled: true, value: 1e-6 },
      },
      {
        R: { enabled: true, value: 1e7 },
        C: { enabled: true, value: 1e-5 },
      },
    ],
  },
  methods: {
    removeElement(i) {
      this.elements.splice(i, 1);
    },
    addElement() {
      this.elements.push({
        R: { enabled: true, value: 1e6 },
        C: { enabled: true, value: 1e-6 },
      });
    },
    draw() {
      // get elements
      const fs = [];
      for (let f = this.fmin; f <= this.fmax; f *= 10 ** (1 / this.fppd)) {
        fs.push(f);
      }

      const Z = (f) =>
        this.elements.reduce(
          (Z, element) => {
            const paraZs = [];
            if (element.R.enabled) paraZs.push(R(element.R.value));
            if (element.C.enabled) paraZs.push(C(element.C.value));
            return plus(Z, parallel(paraZs)(f));
          },
          { x: 0, y: 0 },
        );

      const Zs = fs.map(Z);

      // graph size
      const reMax = Math.max(...Zs.map(({ x }) => x));
      const reMin = Math.min(...Zs.map(({ x }) => x), 0);
      const imMax = Math.max(...Zs.map(({ y }) => y));
      const imMin = Math.min(...Zs.map(({ y }) => y), 0);
      const size = Math.max(reMax - reMin, imMax - imMin);
      const origin = { x: reMin, y: imMin };

      // caclulate points
      const width = canvas.width;
      const height = canvas.height;

      const marginX = 10;
      const marginY = 10;
      const axWidth = width - marginX * 2;
      const axHeight = height - marginY * 2;
      const getPoint = (re, im) => ({
        x: marginX + (axWidth * (re - origin.x)) / size,
        y: marginY + (axHeight * (size + origin.y - im)) / size,
      });

      // draw box
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'gray';
      ctx.beginPath();
      ctx.moveTo(marginX, marginY);
      ctx.lineTo(marginX, marginY + axHeight);
      ctx.lineTo(marginX + axWidth, marginY + axHeight);
      ctx.lineTo(marginX + axWidth, marginY);
      ctx.lineTo(marginX, marginY);
      ctx.stroke();

      // draw X/Y axis
      const originPoint = getPoint(0, 0);
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(originPoint.x, marginY);
      ctx.lineTo(originPoint.x, marginY + axHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(marginX, originPoint.y);
      ctx.lineTo(marginX + axWidth, originPoint.y);
      ctx.stroke();
      ctx.fill();

      // draw tick
      const tickSize = getTickSize(size);
      const tickBaseX = Math.ceil(origin.x / tickSize) * tickSize;
      const tickBaseY = Math.ceil(origin.y / tickSize) * tickSize;

      ctx.strokeStyle = 'gray';
      for (let x = tickBaseX; x < origin.x + size; x += tickSize) {
        const { x: x0 } = getPoint(x, origin.y);
        ctx.beginPath();
        ctx.moveTo(x0, marginY);
        ctx.lineTo(x0, marginY + axHeight);
        ctx.stroke();
        ctx.fillText(x, x0, originPoint.y);
      }
      for (let y = tickBaseY; y < origin.y + size; y += tickSize) {
        const { y: y0 } = getPoint(origin.x, y);
        ctx.beginPath();
        ctx.moveTo(marginX, y0);
        ctx.lineTo(marginX + axWidth, y0);
        ctx.stroke();
        ctx.fillText(y, originPoint.x, y0);
      }

      // draw Z
      const drawZ = (Zs) => {
        ctx.beginPath();
        Zs.forEach((Z, i) => {
          const { x, y } = getPoint(Z.x, Z.y);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      };

      ctx.strokeStyle = 'blue';
      drawZ(Zs);
    },
  },
  mounted() {
    this.draw();
  },
  watch: {
    elements: {
      deep: true,
      handler() {
        this.draw();
      },
    },
  },
});

export {};
