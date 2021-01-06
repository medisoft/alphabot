const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const serve   = require('koa-static')

const router = new Router();
const app = new Koa();
app.use(cors());
app.use(serve(__dirname + '/src/www/build'));


const _ = require('lodash');
const fs = require('fs'), { O_RDWR } = fs.constants;
const I2CBus = require('i2c-bus');
const Pca9685Driver = require("pca9685").Pca9685Driver;
const motores = require('../../motores');

const pausa = async (tout) => new Promise(resolve => setTimeout(() => resolve(), tout));


const i2c = I2CBus.openSync(1, O_RDWR);
const opt = {
  i2c,
  address: 0x40,
  frequency: 100,
  debug: false
};
const pwm = new Pca9685Driver(opt, (err) => {
  if (err) console.log('Error en PWM: ', err)
});
console.log('Inicia PWM');
const setpos = async (pos, channel = 0) => {
  const max = 1085, min = 145; // 1093, 145... 1092-145
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
  motor.posicion = pos;
  return setpos(motor.posicion, motor.canal);
  const maxSpeed = 60 / 0.2; // Velocidad maxima del servo segun la spec sheet
  const sumSteps = 29.50247262315665; // Suma total del tiempo requerido, para calcular el factor de multiplicacion de la pausa
  let ini = motor.posicion;
  let fin = pos;
  const step = 0.2;
  let tot = 0;
  //console.log(ini, fin)
  for (let t = -6; t <= 6; t += step) {
    const v = f(t);
    tot += v;
    motor.posicion = ini + (fin - ini) * v;
    //console.log('t=%s, f(t)=%s, posicion %s', t, v, motor.posicion);
    setpos(motor.posicion, motor.canal);
    await pausa(f(t) * 100)
  }
  // console.log(tot);
}

pwm.allChannelsOff();


router.get('/', async (ctx) => {
  ctx.body = {
    data: {
      message: 'Hello World ...!',
    },
  };
});

router.get('/off', async (ctx) => {
  pwm.allChannelsOff();
  ctx.body = { success: true, message: 'Todos los motores fueron apagados' };
});

router.get('/home', async (ctx) => {
  for (let pata of Object.values(motores)) {
    for (let motor of Object.values(pata)) {
      await organic_setpos(motor.posicion, motor);
    }
  }
  ctx.body = { success: true, message: 'Auto Home establecido' };
})

router.get('/move', async (ctx) => {
  try {
    const pata = motores[`pata${ctx.query.pata}`];
    if (!pata) throw new Error('No existe la pata seleccionada');
    const motor = pata[ctx.query.motor];
    if (!motor) throw new Error('No existe el motor seleccionado');
    let { posicion, speed = 1, direccion } = ctx.query;
    if (direccion) {
      if (direccion === 'l' || direccion === 'u') {
        posicion = Number(motor.posicion) + 0.025;
        if (posicion > 1) posicion = 1;
      } else if (direccion === 'r' || direccion === 'd') {
        posicion = Number(motor.posicion) - 0.025;
        if (posicion < 0) posicion = 0;
      } else throw new Error('Direccion de movimiento invalida');
    }
    posicion=Number(posicion);
    if (posicion < 0 || posicion > 1) throw new Error('La posicion es entre 0 y 1');
    if (speed <= 0 || speed > 1) throw new Error('La speed es entre 0 y 1');
    console.log('Moviendo %s hacia %s velocidad %s', ctx.query.pata, direccion + ' ' + posicion, speed)
    await organic_setpos(posicion, motor, speed || 1)
    ctx.body = { success: true, message: 'Posicion establecida', posicion: posicion.toFixed(3) };
  } catch (err) {
    console.log(err.message)
    ctx.body = { success: false, message: err.message };
  }
})

router.get('/standup', async (ctx) => {
  ctx.body = { success: false, message: 'Not Implemented' };

});
app.use(router.routes());

app.use(function* index() {
  yield send(this, __dirname + '/src/www/build/index.html');
});
module.exports = app;
