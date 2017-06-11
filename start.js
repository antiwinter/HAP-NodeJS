var Accessory = require('./hap/Accessory').Accessory;
var Bridge = require('./hap/Bridge').Bridge;
var Service = require('./hap/Service').Service;
var Characteristic = require('./hap/Characteristic').Characteristic;
var uuid = require('./hap/util/uuid');
var storage = require('node-persist');
var sws = require('./switch').switches;

// Initialize our storage system
storage.initSync();

var createSwitchAccessory = function (sw) {
    var a = new Accessory(sw.name, uuid.generate('hehe' + sw.name));

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
    return a;
};

// Start by creating our Bridge which will host all loaded Accessories
var bridge = new Bridge('Switch Center', uuid.generate("Switch Center"));

for (i in sws) {
    var a = createSwitchAccessory(sws[i]);
    bridge.addBridgedAccessory(a);
}

// Publish the Bridge on the local network.
bridge.publish({
    username: "CC:22:3D:E3:CE:F6",
    port: 51826,
    pincode: "079-34-343",
    category: Accessory.Categories.BRIDGE
});
