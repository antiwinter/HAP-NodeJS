var Accessory = require('hap/Accessory');;
var Service = require('hap/Service');
var Characteristic = require('hap/Characteristic');
var uuid = require('hap/util/uuid');

var createSwitchAccessory = function (sw) {
    var a = Accessory(sw.name, uuid.generate('hehe' + sw.name));

    // set some basic properties (these values are arbitrary and setting them is optional)
    a.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, 'W-Design')
        .setCharacteristic(Characteristic.Model, 'W0')
        .setCharacteristic(Characteristic.SerialNumber, 'A12S345KGB');

    // Add the actual Lightbulb Service and listen for change events from iOS.
    // We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
    a.addService(Service.Lightbulb, sw.name) // services exposed to the user should have "names" like "Light" for this case
        .getCharacteristic(Characteristic.On)
        .on('set', function (value, callback) {
            sw.setPower(value);

            // Our light is synchronous - this value has been successfully set
            // Invoke the callback when you finished processing the request
            // If it's going to take more than 1s to finish the request, try to invoke the callback
            // after getting the request instead of after finishing it. This avoids blocking other
            // requests from HomeKit.
            callback();
        })
        // We want to intercept requests for our current power state so we can query the hardware itself instead of
        // allowing HAP-NodeJS to return the cached Characteristic.value.
        .on('get', function (callback) {
            callback(null, sw.getPower());
        });
};

var Switch = function (pin, relay_id, name) {
    this.pin = pin;
    this.relay_id = ri;
    this.name = name;
    this.setPower = function (en) {
        console.log("Turning the '%s' %s", this.name, en ? "on" : "off");
        this.status = en;
    };

    this.getPower = function () { //get power of accessory
        console.log("'%s' is %s.", this.name, this.status ? "on" : "off");
        return this.status;
    };
}

// Start by creating our Bridge which will host all loaded Accessories
var bridge = new Bridge('Switch Center', uuid.generate("Switch Center"));

// switches property
var sws = [
    Switch(1, 1, "Cinema Wall"),
    Switch(1, 1, "Cinema Ceiling"),
    Switch(1, 1, "Hall"),
    Switch(1, 1, "Hallway"),
    Switch(1, 1, "Terrace"),
    Switch(1, 1, "Dining Room"),
    Switch(1, 1, "Small Bedroom"),
    Switch(1, 1, "Bedroom")
];

for (i in sws) {
    var a = createSwitchAccessory(sws[i]);
    bridge.addBridgedAccessory(a);
}

// Publish the Bridge on the local network.
bridge.publish({
    username: "CC:22:3D:E3:CE:F6",
    port: 51826,
    pincode: "031-45-154",
    category: Accessory.Categories.BRIDGE
});
