const raspi = require('raspi');
const _ = require('lodash');
const fs = require('fs'), { O_RDWR } = fs.constants;
const I2CBus = require('i2c-bus');

const pausa = async (tout) => new Promise(resolve => setTimeout(() => resolve(), tout));

const motores = {};
let i2c_1, i2c_3;
const init = () => {
  i2c_1 = I2CBus.openSync(1, O_RDWR); // Frontales
  i2c_3 = I2CBus.openSync(3, O_RDWR); // Traseros
  motores.ccw1 = {
    currentSpeed: 0,
    factor: 1, // Max: 5.01 Min 0.02, 0.25=1.30, 0.5=2.55, 0.75=3.79
    max: 5.01,
    lastValue: 0,
    enabled: true,
    writeSync: (buffer) => i2c_1.i2cWriteSync(0x60, buffer.length, buffer)
  };
  motores.ccw2 = {
    currentSpeed: 0,
    factor: 1,
    max: 5.01,
    lastValue: 0,
    enabled: false,
    writeSync: (buffer) => i2c_1.i2cWriteSync(0x61, buffer.length, buffer)
  };
  motores.cw1 = {
    currentSpeed: 0,
    factor: 1, // Max: 4.82 Min 0, 0.25=1.19, 0.5=2.41, 0.75=3.61
    max: 4.82,
    lastValue: 0,
    enabled: true,
    writeSync: (buffer) => i2c_3.i2cWriteSync(0x60, buffer.length, buffer)
  };
  motores.cw2 = {
    currentSpeed: 0,
    factor: 1, // Max: 4.74 Min 0.0, 0.25=1.19, 0.5=2.41, 0.75=3.61
    max: 4.74,
    lastValue: 0,
    enabled: true,
    writeSync: (buffer) => i2c_3.i2cWriteSync(0x61, buffer.length, buffer)
  };

  // El factor toma el maximo mas pequeño y divide ese maxMin/maxDelMotor
  let minMax = _.min(Object.values(motores).map(m => m.max));
  Object.entries(motores).forEach(([ k, v ]) => v.factor = minMax / v.max);
}
/**
 *
 * @param motorId
 * @param percent
 * @param storeInEEPROM
 * @param progresive
 * @return {Promise<void>}
 */
const setSpeed = async ({ motorId, percent = 0, storeInEEPROM = false, progresive = true }) => {
  const i2c = motores[motorId];
  if (!i2c.enabled) return;
  if (!i2c) throw new Error(`No existe el motor ${motorId}`);
  const writeBuf = []; // 12-bit device values from 0-4095
  if (i2c.lastValue < percent) {
    for (let p = i2c.lastValue; p <= percent; p += 0.01) {
      writeBuf[0] = 0b01000000; // control byte
      writeBuf[1] = 0b00000000; // HIGH data
      writeBuf[2] = 0b00000000; // LOW data

      const val = Math.floor(p * 4095 * i2c.factor);
      writeBuf[1] = (val >> 4) & 0xff; // MSB 11-4 shift right 4 places
      writeBuf[2] = (val << 4) & 0xff; // LSB 3-0 shift left 4 places
      if (progresive) {
        i2c.writeSync(Buffer.from(writeBuf));
        await pausa(100);
      }
    }
    i2c.lastValue = percent;
  } else {
    for (let p = i2c.lastValue; p >= percent; p -= 0.01) {
      writeBuf[0] = 0b01000000; // control byte: bits 7-5; 010 write DAC; 011 write DAC and EEPROM bits 4-3 unused bits 2-1 PD1, PD0 PWR down P19 00 normal. bit 0 unused
      writeBuf[1] = 0b00000000; // HIGH data (de la conversion)
      writeBuf[2] = 0b00000000; // LOW data (de la conversion)
      const val = Math.floor(p * 4095 * i2c.factor);
      writeBuf[1] = (val >> 4) & 0xff; // MSB 11-4 shift right 4 places
      writeBuf[2] = (val << 4) & 0xff; // LSB 3-0 shift left 4 places
      if (progresive) {
        i2c.writeSync(Buffer.from(writeBuf));
        await pausa(100);
      }
    }
    i2c.lastValue = percent;
  }
  if (storeInEEPROM) {
    writeBuf[0] = writeBuf[0] | 0b01100000;
    console.log('Guardando %s en la EEPROM', percent.toFixed(2))
  }
  if (percent === 0) {
    writeBuf[0] = writeBuf[0] | 0b01000110; // Fija el DAC a modo de ultra alta impedancia y ultra bajo consumo de energia
    console.log('Fijando en modo de ahorro de energía');
  }
  i2c.writeSync(Buffer.from(writeBuf));
}

const parar = async (storeInEEPROM) => {
  await Promise.all(Object.entries(motores).map(([ k, v ]) => v.enabled && setSpeed({
    motorId: k,
    percent: 0,
    storeInEEPROM,
    progresive: false
  })));
}

init();
raspi.init(async () => {
  await parar(false);
  await pausa(250);

  if (process.stdin.isTTY) {
    console.log('Iniciando control manual')
    process.stdin.setRawMode(true);
    process.stdin.on('data', async function (chunk) {
      const key = chunk;
      switch (key.toString()) {
        case 'q':
          await setSpeed({
            motorId: 'ccw1',
            percent: motores.ccw1.lastValue + 0.05,
            progresive: false
          });
          console.log('Sube ccw1: %s', motores.ccw1.lastValue.toFixed(2));
          break;
        case 'a':
          await setSpeed({
            motorId: 'ccw1', percent: motores.ccw1.lastValue - 0.05,
            progresive: false
          });
          console.log('Baja ccw1: %s', motores.ccw1.lastValue.toFixed(2));
          break;

        case 'w':
          await setSpeed({
            motorId: 'ccw2', percent: motores.ccw2.lastValue + 0.05,
            progresive: false
          });
          console.log('Sube ccw2: %s', motores.ccw2.lastValue.toFixed(2));
          break;
        case 's':
          await setSpeed({
            motorId: 'ccw2', percent: motores.ccw2.lastValue - 0.05,
            progresive: false
          });
          console.log('Baja ccw2: %s', motores.ccw2.lastValue.toFixed(2));
          break;

        case 'e':
          await setSpeed({
            motorId: 'cw1', percent: motores.cw1.lastValue + 0.05,
            progresive: false
          });
          console.log('Sube cw1: %s', motores.cw1.lastValue.toFixed(2));
          break;
        case 'd':
          await setSpeed({
            motorId: 'cw1', percent: motores.cw1.lastValue - 0.05,
            progresive: false
          });
          console.log('Baja cw1: %s', motores.cw1.lastValue.toFixed(2));
          break;

        case 'r':
          await setSpeed({
            motorId: 'cw2', percent: motores.cw2.lastValue + 0.05,
            progresive: false
          });
          console.log('Sube cw2: %s', motores.cw2.lastValue.toFixed(2));
          break;
        case 'f':
          await setSpeed({
            motorId: 'cw2', percent: motores.cw2.lastValue - 0.05,
            progresive: false
          });
          console.log('Baja cw2: %s', motores.cw2.lastValue.toFixed(2));
          break;

        case ' ':
          console.log('Deteniendo todo');
          await parar();
          break;
        case 'p':
          console.log('Deteniendo todo');
          await parar();
          process.exit();
          break;
        default:
          if (Buffer.compare(Buffer.from('1b5b42', 'hex'), key)) {
            await Promise.all(Object.entries(motores).map(([ k, v ]) => setSpeed({
              motorId: k,
              percent: v.lastValue + 0.05,
              progresive: false
            })))
            console.log('Sube todos: %s', _.mean(Object.values(motores).filter(v => v.enabled).map(v => v.lastValue)).toFixed(2));
          } else if (Buffer.compare(Buffer.from('1b4f42', 'hex'), key)) {
            await Promise.all(Object.entries(motores).map(([ k, v ]) => setSpeed({
              motorId: k,
              percent: v.lastValue - 0.05,
              progresive: false
            })))
            console.log('Baja todos: %s', _.mean(Object.values(motores).filter(v => v.enabled).map(v => v.lastValue)).toFixed(2));
          } else
            console.log('Recibi', chunk.toString(), chunk);
      }
    });
  } else {
    const target = 0.6;
    console.log('Iniciando con prueba automatica target %s', target);
    const t1 = new Date().getTime();
    await Promise.all([
      setSpeed({ motorId: 'cw1', percent: target }),
      setSpeed({ motorId: 'cw2', percent: target }),
      setSpeed({ motorId: 'ccw1', percent: target }),
      setSpeed({ motorId: 'ccw2', percent: target })
    ]);
    console.log('Alcanzo su objetivo en %s segundos', (new Date().getTime() - t1) / 1000);
    await pausa(300000);
    await parar();
  }
});