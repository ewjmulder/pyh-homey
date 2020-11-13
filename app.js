"use strict";

const Homey = require("homey");
const pyh = require('./src/pyh');
const util = require('./src/util');
const color = require('./src/constants/hue/color');

class Sparrenlaan37 extends Homey.App {

    async onInit() {
        // Expose the log method of this object for pretty logging everywhere.
        util.log = this.log

        util.log("***** Sparrenlaan 37 - Starting Initialization *****");
        util.log("");
        util.log("***** Registering Actions *****");
        registerAction("switch_pressed", switchPressed);
        util.log("");
        util.log("***** Sparrenlaan 37 - Finished Initialization *****");
    }
}

module.exports = Sparrenlaan37;

function switchPressed(args, state) {
    if (!args.switchName) {
        throw "No value for argument 'switchName'";
    } else if (args.switchName === "master_bedroom__bed") {
        pyh.blinkRoom(color.GREEN);
    } else if (args.switchName === "master_bedroom__wall") {
        pyh.blinkRoom(color.BLUE);
    } else {
        throw "Unknown value '" + args.switchName + "' for argument 'switchName'";
    }
}

function registerAction(actionId, callback) {
    util.log(actionId + " --> " + callback.name);
    let action = new Homey.FlowCardAction(actionId);
    action
        .register()
        .registerRunListener(async (args, state) => {
            util.log("App action triggered: " + callback.name + "(" + JSON.stringify(args) + ")");
            try {
                callback(args, state);
            } catch (e) {
                util.log("Error occured during callback: " + e);
            }
        });
}
