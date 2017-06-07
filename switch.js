// switch.js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1',
    { baudRate: 9600 });

var Switch = function (gpio, relay_id, name) {
    this.gpio = gpio;
    this.relay_id = relay_id;
    this.name = name;
    this.setPower = function (en) {
        console.log("Turning the '%s' %s", this.name, en ? "on" : "off");
        port.write([0x55, 1, en ? 0x12 : 0x11, 0, 0, 0, this.relay_id, this.relay_id + 0x68]);
        this.status = en;
    };

    this.getPower = function () { //get power of accessory
        console.log("'%s' is %s.", this.name, this.status ? "on" : "off");
        return this.status;
    };
}

exports.switches = [
    Switch(1, 1, "Cinema Wall Light"),
    Switch(1, 1, "Cinema Ceiling Light"),
    Switch(1, 1, "Hall Light"),
    Switch(1, 1, "Hall Strip Light"),
    Switch(1, 1, "Hallway Light"),
    Switch(1, 1, "Terrace Light"),
    Switch(1, 1, "Dining Room Light"),
    Switch(1, 1, "Small Bedroom Light"),
    Switch(1, 1, "Bedroom Light"),
    Switch(1, 1, "Bedroom Strip Light")
];
