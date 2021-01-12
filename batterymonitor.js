const ads1x15 = require('ads1x15');

const main = async () => {
  const adc = new ads1x15(1, 0x48);

  // open i2c bus. 0 for /dev/i2c-0 and 1 for /dev/i2c-1
  await adc.openBus(1);

  // Reading in Single shot mode channels 0-3
  console.log('Reading Single shot:');
  for await (let channel of [0, 1, 2, 3]) {
    const measure = await adc.readSingleEnded({channel});
    console.log(`Channel ${channel}: ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
  
  // If voltage < 2.5 on channel 0, then battery is about to die. If voltage < 1, then ADS is not connected, if it is > 4 then power source is > 12V
  // Using a resistor voltage divider, with V+->100k ---OUT---50K-->GND, from 7 to 12V
  // https://ohmslawcalculator.com/voltage-divider-calculator
}

main()