const I2CBus = require('i2c-bus');
const Pca9685Driver = require("pca9685").Pca9685Driver;
const fs = require('fs'), { O_RDWR } = fs.constants;
const motores = require('./motores');

const i2c = I2CBus.openSync(1, O_RDWR);
const opt = {
  i2c,
  address: 0x40,
  frequency: 100,
  debug: true
};
const pwm = new Pca9685Driver(opt, (err) => {
  if (err) console.log('Error en PWM: ', err)
});

const setpos = async (pos, channel = 0) => {
  const max = 1091, min = 145; // 1093, 145... 1092-145
  const p = (max - min) * pos + min;
  await pwm.setPulseRange(channel, 0, p);
};

const pausa = async (tout) => new Promise(resolve => setTimeout(() => resolve(), tout));
const centraAll = async () => {
  for (let [ pata, pataObj ] of Object.entries(motores)) {
    for (let [ motor, motorObj ] of Object.entries(pataObj)) {
      console.log('Iniciando %s - %s', pata, motor);
      await setpos(motorObj.posicion = 0.5, motorObj.canal);
      await pausa(500);
    }
  }
}

const run = async () => {
  await pausa(2000);
  await centraAll();
  await pausa(15000);
  pwm.allChannelsOff();
}

console.log('Mandando todos los motores a 50% por 15 segundos y luegoa apagando');
run();