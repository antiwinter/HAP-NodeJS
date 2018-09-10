const isEmu = !(process.arch === 'arm' || process.arch === 'arm64')

var cmdList = []

if (!isEmu) {
  // prepare serial port
  var SerialPort = require('serialport')

  var cmdIssuer = function() {
    if (cmdList.length) {
      port.write(cmdList.pop())
    }
    setTimeout(cmdIssuer, 50)
  }

  var port = new SerialPort(
    '/dev/ttyUSB0',
    {
      baudRate: 4800,
      parser: SerialPort.parsers.raw
    },
    function(error) {
      cmdIssuer()
    }
  )

  port.on('data', function(data) {
    //    console.log('serial reply:', data)
  })
}

var Switch = function(gpio, relay_id, name) {
  this.name = name
  this.gpio = typeof gpio === 'number' ? [gpio] : gpio
  this.relay_id = typeof relay_id === 'number' ? [relay_id] : relay_id

  this.setPower = function(en) {
    if (this.status == en) return

    this.relay_id.forEach(function(r) {
      var cmd = [0x55, 3, en ? 0x12 : 0x11, 0, 0, 0, r],
        sum = 0
      cmd.forEach(function(d) {
        sum += d
      })

      cmd.push(sum)
      cmdList.push(cmd)
      console.log('%s %s (relay %d)', en ? '+++' : '---', name, r)
      //            console.log(cmd + '\n');
    })
    this.status = en
  }

  this.getPower = function() {
    //get power of accessory
    console.log('  ? %s %s', this.name, this.status ? '+++' : '---')
    return this.status
  }
}

var switches = (exports.switches = [
  new Switch(5, 5, 'Cinema Wall Light'), // pin 11
  new Switch(13, 3, 'Cinema Ceiling Light'), // pin 13
  new Switch(27, 1, 'Living room Ceiling Light'), // pin 15
  new Switch(17, 10, 'Living room Strip Light'), // pin 19
  new Switch(26, [8, 11], 'Hallway Light'), // pin 21
  new Switch(22, 13, 'Terrace Light'), // pin 23
  new Switch(19, 2, 'Dining Room Light'), // pin 26
  new Switch(10, 9, 'Dining Room Light Strip'), // 29
  new Switch(7, 7, 'Small Bedroom Light'), // pin 31
  new Switch(9, 14, 'Bedroom Light'), // pin 33
  new Switch(11, [6, 15], 'Bedroom Light Strip')
])

// prepare the buttons
var Gpio
if (!isEmu) {
  Gpio = require('pigpio').Gpio
} else {
  console.log('using emulated gpio on', process.arch)
  Gpio = function(pin, opt) {
    this.pin = pin
    this.opt = opt
    this.val = 0
  }
  Gpio.prototype.OUTPUT = 1
  Gpio.prototype.digitalWrite = function(en) {
    this.val = !!en + 0
    console.log(this.pin, 'is set to', this.val)
  }

  Gpio.prototype.digitalRead = function() {
    console.log(this.pin, 'is', this.val)
    return this.val
  }
  Gpio.prototype.on = function() {}
}

var gnd = [18, 23, 25, 8, 12, 16, 20].map(function(gpio) {
  var g = new Gpio(gpio, {
    mode: Gpio.OUTPUT,
    pullUpDown: Gpio.PUD_DOWN
  })
  g.digitalWrite(0)
  return g
})

switches.forEach(function(sw) {
  sw.gpio = sw.gpio.map(function(gpio) {
    return new Gpio(gpio, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_UP,
      edge: Gpio.EITHER_EDGE,
      alert: true
    })
  })

  sw.gpio.forEach(function(gpio) {
    gpio.savedLevel = gpio.digitalRead()
    gpio.on('alert', function(level, tick) {
      if (this.timeout) clearTimeout(this.timeout)
      this.timeout = setTimeout(function() {
        this.timeout = 0
        if (level === gpio.savedLevel) return
        gpio.savedLevel = level

        console.log('button', gpio.gpio, level ? 'open' : 'close')
        sw.setPower(1 - level)
      }, 100)
    })
  })
})

/*

    So... What is a switch here?

    button --- tel line ---> this_pi <-------- rs485 --------> relay_board --+
                                                                             |
                               ||--- zero line ----- Light ----- fire line --+    

    the whole thing here is abstracted as a switch.
*/
