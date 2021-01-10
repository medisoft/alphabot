const I2CBus = require('i2c-bus');
const MPU6050 = require('i2c-mpu6050');
const fs = require('fs'), { O_RDWR } = fs.constants;
const i2c = I2CBus.openSync(1, O_RDWR);

const gyro = new MPU6050(i2c, 0x68);

setInterval(async () => {
  console.log(await gyro.readSync());
}, 500);
