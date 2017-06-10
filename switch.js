// prepare serial port
var SerialPort = require('serialport');

var cmdList = [];
var cmdIssuer = function () {
    if (cmdList.length) {
        port.write(cmdList.pop());
    }
    setTimeout(cmdIssuer, 50);
}

var port = new SerialPort('/dev/ttyUSB0',
    {
        baudRate: 4800,
        parser: SerialPort.parsers.raw
    },
    function (error) {
        cmdIssuer();
    });

port.on('data', function (data) {
    //    console.log('serial reply:', data)
});


var Switch = function (gpio, relay_id, name) {

    this.name = name;
    this.gpio = (typeof gpio === 'number') ?
        [gpio] : gpio;
    this.relay_id = (typeof relay_id === 'number') ?
        [relay_id] : relay_id;

    this.setPower = function (en) {
        if (this.status == en) return;

        this.relay_id.forEach(function (r) {
            var cmd = [0x55, 3, en ? 0x12 : 0x11, 0, 0, 0, r],
                sum = 0; cmd.forEach(function (d) {
                    sum += d;
//                    console.log("adding", d, "sum", sum);
                });

            cmd.push(sum);
            cmdList.push(cmd);
            console.log("%s %s", en ? "+++" : "---", this.name);
            console.log(cmd + '\n');
        });
        this.status = en;
    };

    this.getPower = function () { //get power of accessory
        console.log("? %s %s\n", this.status ? "+++" : "---", this.name);
        return this.status;
    };
}

var switches = exports.switches = [
    new Switch(17, 5, "Cinema Wall Light"),  // pin 11
    new Switch(27, 3, "Cinema Ceiling Light"),  // pin 13
    new Switch(22, 1, "Living room Light"), // pin 15
    new Switch(10, 10, "Living room Strip Light"), // pin 19
    new Switch(9, [8, 11], "Hallway Light"), // pin 21
    new Switch(11, 13, "Terrace Light"), // pin 23
    new Switch(7, 2, "Dining Room Light"),  // pin 26
    new Switch(5, 9, "Dining Room Light Strip"),  // 29
    new Switch(6, 7, "Small Bedroom Light"),  // pin 31
    new Switch(13, 14, "Bedroom Light"),  // pin 33
    new Switch(19, [6, 15], "Bedroom Light Strip")  // pin 35
];

// prepare the buttons
var Gpio = require('pigpio').Gpio;

var gnd = [18, 23, 25, 8, 12, 16, 20].map(function (pin) {
    return new Gpio(pin, {
        mode: Gpio.OUTPUT,
        pullUpDown: Gpio.PUD_DOWN
    });
});

switches.forEach(function (sw) {
    sw.gpio = sw.gpio.map(function (gpio) {
        return new Gpio(gpio, {
            mode: Gpio.INPUT,
            pullUpDown: Gpio.PUD_UP,
            edge: Gpio.EITHER_EDGE
        })
    });

    sw.gpio.forEach(function (gpio) {
        gpio.on('interrupt', function (level) {
            //            sw.setPower(level);
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(function () {
                console.log("GPIO", gpio.gpio, level);
                this.timeout = 0;
            }, 50);
        });
    });
});

/*

    So... What is a switch here?

    button --- tel line ---> this_pi <-------- rs485 --------> relay_board --+
                                                                             |
                               ||--- zero line ----- Light ----- fire line --+    

    the whole thing here is abstracted as a switch.
*/
