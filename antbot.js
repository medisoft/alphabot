const raspi = require('raspi');
const _ = require('lodash');
const fs = require('fs'), { O_RDWR } = fs.constants;
const I2CBus = require('i2c-bus');
const Pca9685Driver = require("pca9685").Pca9685Driver;
const motores = require('./motores');

const pausa = async (tout) => new Promise(resolve => setTimeout(() => resolve(), tout));

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
console.log('Inicia PWM');
const setpos = async (pos, channel = 0) => {
  const max = 1091, min = 145; // 1093, 145... 1092-145
  const p = (max - min) * pos + min;
  await pwm.setPulseRange(channel, 0, p);
};
const centraAll = async () => {
  for (let [pata, pataObj] of Object.entries(motores)) {
    for (let [motor, motorObj] of Object.entries(pataObj)) {
      console.log('Iniciando %s - %s', pata, motor);
      await setpos(motorObj.posicion = 0.5, motorObj.canal);
      await pausa(500);
    }
  }
}


const f = (t) => {
  return 1 / (1 + Math.exp(-t))
}

/**
 *
 * @param pos
 * @param motor
 * @param speed - porcentaje de la velocidad maxima, sera la nueva maxima para este movimiento
 * @returns {Promise<void>}
 */
const organic_setpos = async (pos, motor, speed = 1) => {
  const maxSpeed = 60 / 0.2; // Velocidad maxima del servo segun la spec sheet
  const sumSteps = 29.50247262315665; // Suma total del tiempo requerido, para calcular el factor de multiplicacion de la pausa
  let ini = motor.posicion;
  let fin = pos;
  const step = 0.2;
  let tot=0;
  //console.log(ini, fin)
  for (let t = -6; t <= 6; t += step) {
    const v = f(t);
    tot+=v;
    motor.posicion = ini + (fin - ini) * v;
    //console.log('t=%s, f(t)=%s, posicion %s', t, v, motor.posicion);
    setpos(motor.posicion, motor.canal);
    await pausa(f(t) * 100)
  }
  console.log(tot);
}

pwm.allChannelsOff();
const run = async () => {
  if (process.stdin.isTTY && true) {
    console.log('Iniciando control manual')
    process.stdin.setRawMode(true);
    process.stdin.on('data', async function (chunk) {
      const key = chunk, keyString = key.toString();
      if (keyString === 'p') {
        pwm.allChannelsOff();
        process.exit();
      } else if (keyString === ' ') {
        pwm.allChannelsOff();
      } else if (keyString === 'c') {
        await centraAll();
      } else {
        let motor, motorObj, pata, pataObj, direccion;
        for ([pata, pataObj] of Object.entries(motores)) {
          for ([motor, motorObj] of Object.entries(pataObj)) {
            if (motorObj.keys.up !== '' && motorObj.keys.up === keyString) {
              direccion = 'up';
              break;
            }
            if (motorObj.keys.down !== '' && motorObj.keys.down === keyString) {
              direccion = 'down';
              break;
            }
          }
          if (direccion) break;
        }
        console.log('Pata %s Motor %s Direccion %s Valor %s', pata, motor, direccion, motorObj.posicion);
        if (direccion === 'up') {
          if (motorObj.posicion >= 0.99) return;
          await setpos(motorObj.posicion += 0.01, motorObj.canal);
        }
        if (direccion === 'down') {
          if (motorObj.posicion <= 0.01) return;
          await setpos(motorObj.posicion -= 0.01, motorObj.canal);
        }
      }
      /*
            switch (key.toString()) {
              case 'q':
                console.log('Motor hombro derecha');
                if (motores.pata1.hombro.posicion >= 0.99) return;
                await setpos(motores.pata1.hombro.posicion += 0.01, 0);
                break;
              case 'a':
                console.log('Motor hombro izquierda');
                if (posicionMotores.hombro <= 0.01) return;
                await setpos(posicionMotores.hombro -= 0.01, 0);
                break;

              case 'w':
                console.log('Sube motor brazo');
                if (posicionMotores.brazo >= 0.99) return;
                await setpos(posicionMotores.brazo += 0.01, 1);
                break;
              case 's':
                console.log('Baja motor brazo');
                if (posicionMotores.brazo <= 0.01) return;
                await setpos(posicionMotores.brazo -= 0.01, 1);
                break;

              case 'e':
                console.log('Sube motor antebrazo');
                if (posicionMotores.antebrazo >= 0.99) return;
                await setpos(posicionMotores.antebrazo += 0.01, 2);
                break;
              case 'd':
                console.log('Baja motor antebrazo');
                if (posicionMotores.antebrazo <= 0.01) return;
                await setpos(posicionMotores.antebrazo -= 0.01, 2);
                break;


              case 'c':
                console.log('Centrando todos los canales');
                // for (let m = 0; m < 16; m++) {
                //   await setpos(0.5, m);
                //   await pausa(250);
                // }
                // Object.keys(posicionMotores).forEach(m => posicionMotores[m] = 0.5);
                Object.keys(posicionMotores).forEach((m, idx) => setpos(posicionMotores[m] = 0.5, idx));
                break;

              /!*
                      case 'r':
                        console.log('Sube tras_izquierda');
                        await setSpeed({
                          motorId: 'tras_izquierda', percent: motores.tras_izquierda.lastValue + 0.05,
                          progresive: false
                        });
                        break;
                      case 'f':
                        console.log('Baja tras_izquierda');
                        await setSpeed({
                          motorId: 'tras_izquierda', percent: motores.tras_izquierda.lastValue - 0.05,
                          progresive: false
                        });
                        break;
              *!/

              case ' ':
                console.log('Deteniendo todo');
                pwm.allChannelsOff();
                break;
              case 'p':
                console.log('Deteniendo todo');
                pwm.allChannelsOff();
                process.exit();
                break;
              default:
                /!*if (Buffer.compare(Buffer.from('1b5b42', 'hex'), key)) {
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
                } else*!/
                console.log('Recibi', chunk.toString(), chunk);
            }
      */
    });
  } else {
    await pausa(2000);

    await setpos(motores.pata1.hombro.posicion = 0.25, motores.pata1.hombro.canal);
    await setpos(motores.pata1.brazo.posicion = 0, motores.pata1.brazo.canal);
    await setpos(motores.pata1.antebrazo.posicion = 1, motores.pata1.antebrazo.canal);

    await setpos(motores.pata2.hombro.posicion = 0.75, motores.pata2.hombro.canal);
    await setpos(motores.pata2.brazo.posicion = 0, motores.pata2.brazo.canal);
    await setpos(motores.pata2.antebrazo.posicion = 1, motores.pata2.antebrazo.canal);

    await setpos(motores.pata3.hombro.posicion = 0.75, motores.pata3.hombro.canal);
    await setpos(motores.pata3.brazo.posicion = 0, motores.pata3.brazo.canal);
    await setpos(motores.pata3.antebrazo.posicion = 1, motores.pata3.antebrazo.canal);

    await setpos(motores.pata4.hombro.posicion = 0.25, motores.pata4.hombro.canal);
    await setpos(motores.pata4.brazo.posicion = 0, motores.pata4.brazo.canal);
    await setpos(motores.pata4.antebrazo.posicion = 1, motores.pata4.antebrazo.canal);


    await pausa(5000);
    organic_setpos(0.25, motores.pata1.hombro);
    organic_setpos(0.45, motores.pata1.brazo);
    organic_setpos(0.15, motores.pata1.antebrazo);
    await pausa(5000);
    organic_setpos(0.25, motores.pata4.hombro);
    organic_setpos(0.45, motores.pata4.brazo);
    organic_setpos(0.15, motores.pata4.antebrazo);

    await pausa(5000);
    organic_setpos(0.75, motores.pata2.hombro);
    organic_setpos(0.45, motores.pata2.brazo);
    organic_setpos(0.15, motores.pata2.antebrazo);

    await pausa(5000);
    organic_setpos(0.75, motores.pata3.hombro);
    organic_setpos(0.45, motores.pata3.brazo);
    organic_setpos(0.15, motores.pata3.antebrazo);


    //    await Promise.all([
//      organic_setpos(0.25, motores.pata1.hombro),
//      organic_setpos(0.5, motores.pata1.brazo),
//      organic_setpos(0.5, motores.pata1.antebrazo),


  //    organic_setpos(0.75, motores.pata3.hombro),
    //  organic_setpos(0.5, motores.pata3.brazo),
     // organic_setpos(0.5, motores.pata3.antebrazo),
//    ]);
    await pausa(5000);
/*    await Promise.all([
      organic_setpos(0.75, motores.pata1.hombro),
      organic_setpos(0, motores.pata1.brazo),
      organic_setpos(1, motores.pata1.antebrazo),


      organic_setpos(0.25, motores.pata3.hombro),
      organic_setpos(0, motores.pata3.brazo),
      organic_setpos(1, motores.pata3.antebrazo),
    ]);
    await pausa(5000);*/


    // await setpos(0.9, motores.pata1.brazo.canal);
    // await setpos(0.9, motores.pata2.brazo.canal);
    // await setpos(0.9, motores.pata3.brazo.canal);
    // await setpos(0.9, motores.pata4.brazo.canal);
    // await pausa(5000);
    //
    //
    // await setpos(0.25, motores.pata1.hombro.canal);
    // await setpos(0.75, motores.pata2.hombro.canal);
    // await setpos(0.75, motores.pata3.hombro.canal);
    // await setpos(0.25, motores.pata4.hombro.canal);
    // await pausa(5000);
    //
    //
    // await setpos(0.0, motores.pata1.antebrazo.canal);
    // await setpos(0.0, motores.pata2.antebrazo.canal);
    // await setpos(0.0, motores.pata3.antebrazo.canal);
    // await setpos(0.0, motores.pata4.antebrazo.canal);
    // await pausa(5000);
    //
    //
    // await setpos(0.5, motores.pata1.brazo.canal);
    // await setpos(0.5, motores.pata2.brazo.canal);
    // await setpos(0.5, motores.pata3.brazo.canal);
    // await setpos(0.5, motores.pata4.brazo.canal);
    // await pausa(5000);


    pwm.allChannelsOff();
    // while (false) {
    //   const motor = Math.floor(Math.random() * 1000) % 2;
    //   //await pwm.channelOff(0);
    //   await setpos(0.5, motor);
    //   await pausa(2000);
    //   // await pwm.channelOff(0);
    //   await setpos(0.05, motor);
    //   await pausa(2000);
    //   // await setpos(0.5);
    //   // await pausa(2000);
    //   await setpos(0.95, motor);
    //   await pausa(2000);
    //   // await setpos(1);
    //   // await pausa(2000);
    //   // await setpos(0.75);
    //   // await pausa(2000);
    //   // await setpos(0.5);
    //   // await pausa(2000);
    //   // await setpos(0.25);
    //   // await pausa(30000);
    //   // await pwm.channelOff(0);
    //   await pwm.allChannelsOff();
    //   await pausa(2000);
    //   /*
    //       await pwm.setPulseRange(0, 0, 145);
    //       await pausa(2000);
    //       await pwm.setPulseRange(0, 0, 1093);
    //       await pausa(5000);
    //   */
    // }
  }
}

run();