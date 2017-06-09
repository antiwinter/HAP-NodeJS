// prepare serial port
var SerialPort = require('serialport');

var cmdList = [];
var cmdIssuer = function () {
    if (cmdList.length) {
        port.write(cmdList.pop());
    }
    setTimeout(cmdIssuer, 200);
}

var port = new SerialPort('/dev/pts/5',
    {
        baudRate: 9600,
        parser: SerialPort.parsers.raw
    },
    function (error) {
        cmdIssuer();
    });

port.on('data', function (data) {
    console.log('serial reply:', data)
});


var Switch = function (gpio, relay_id, name) {

    this.name = name;
    this.gpio = (typeof gpio === 'number') ?
        [gpio] : gpio;
    this.relay_id = (typeof relay_id === 'number') ?
        [relay_id] : relay_id;

    this.setPower = function (en) {
        if (this.status == en) return;

        var cmd = [0x55, 1, en ? 0x12 : 0x11, 0, 0, 0, this.relay_id], sum = 0;
        for (i in cmd) { sum += cmd[i] };
        cmd.push(sum);
        cmdList.push(cmd);
        this.status = en;
        console.log("%s %s", en ? "+++" : "---", this.name);
        console.log(cmd + '\n');
    };

    this.getPower = function () { //get power of accessory
        console.log("? %s %s\n", this.status ? "+++" : "---", this.name);
        return this.status;
    };
}

var switches = exports.switches = [
    new Switch(17, 1, "Cinema Wall Light"),  // pin 11
    new Switch(27, 2, "Cinema Ceiling Light"),  // pin 13
    new Switch(22, 3, "Living room Light"), // pin 15
    new Switch(10, 4, "Living room Strip Light"), // pin 19
    new Switch(9, 5, "Hallway Light"), // pin 21
    new Switch(11, 6, "Terrace Light"), // pin 23
    new Switch(7, 7, "Dining Room Light"),  // pin 26
    new Switch(5, 8, "Dining Room Light Strip"),  // 29
    new Switch(6, 9, "Small Bedroom Light"),  // pin 31
    new Switch(13, 10, "Bedroom Light"),  // pin 33
    new Switch(19, 11, "Bedroom Light Strip")  // pin 35
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
            sw.setPower(level);
        });
    });
}

/*

    So... What is a switch here?

    button --- tel line ---> this_pi <-------- rs485 --------> relay_board --+
                                                                             |
                               ||--- zero line ----- Light ----- fire line --+    

    the whole thing here is abstracted as a switch.
*/
