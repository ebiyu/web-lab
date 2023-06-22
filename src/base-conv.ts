const inputDec = document.getElementById('inputDec') as HTMLInputElement;
const inputHex = document.getElementById('inputHex') as HTMLInputElement;
const inputBin = document.getElementById('inputBin') as HTMLInputElement;

window.addEventListener('load', () => {
  inputDec.addEventListener('input', () => {
    const val = Number(inputDec.value);
    if (Number.isNaN(val)) return false;
    inputHex.value = val.toString(16);
    inputBin.value = val.toString(2);
  });
  inputHex.addEventListener('input', () => {
    if (inputHex.value.startsWith('0x')) {
      inputHex.value = inputHex.value.slice(2);
    }
    const val = Number('0x' + inputHex.value);
    if (Number.isNaN(val)) return;
    inputDec.value = val.toString(10);
    inputBin.value = val.toString(2);
  });
  inputBin.addEventListener('input', () => {
    const val = Number('0b' + inputBin.value);
    if (Number.isNaN(val)) return;
    inputDec.value = val.toString(10);
    inputHex.value = val.toString(16);
  });
});
