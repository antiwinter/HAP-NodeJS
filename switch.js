// switch.js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/pts/5',
    { baudRate: 9600 });

var Switch = function (gpio, relay_id, name) {
    this.gpio = gpio;
    this.relay_id = relay_id;
    this.name = name;

    this.setPower = function (en) {
        var cmd = [0x55, 1, en ? 0x12 : 0x11, 0, 0, 0, this.relay_id], sum = 0;
        for (i in cmd) { sum += cmd[i] };
        cmd.push(sum);
        port.write(cmd);
        this.status = en;
        console.log("%s %s", en ? "+++" : "---", this.name);
        console.log(cmd + '\n');
    };

    this.getPower = function () { //get power of accessory
        console.log("? %s %s\n", this.status ? "+++" : "---", this.name);
        return this.status;
    };
}

exports.switches = [
    new Switch(1, 1, "Cinema Wall Light"),
    new Switch(2, 2, "Cinema Ceiling Light"),
    new Switch(3, 3, "Hall Light"),
    new Switch(4, 4, "Hall Strip Light"),
    new Switch(5, 5, "Hallway Light"),
    new Switch(6, 6, "Terrace Light"),
    new Switch(7, 7, "Dining Room Light"),
    new Switch(8, 8, "Small Bedroom Light"),
    new Switch(9, 9, "Bedroom Light"),
    new Switch(10, 10, "Bedroom Strip Light")
];
