"use strict";

const Homey = require("homey");
const pyh = require('./src/pyh');
const util = require('./src/util');
const color = require('./src/constants/hue/color');
const group = require('./src/constants/hue/group');
const schedule = require('./src/constants/cron/schedule');

class Sparrenlaan37 extends Homey.App {

    async onInit() {
        // Expose the log method of this object for pretty logging everywhere.
        util.log = this.log

        util.log("***** Sparrenlaan 37 - Starting Initialization *****");
        util.log("");

        util.log("***** Registering Actions *****");
        registerAction("switch_pressed", switchPressed);
        util.log("");

        util.log("***** Registering Cron events *****");
        // Unregister all existing tasks, since the task id's seem to stay reserved otherwise.
        await Homey.ManagerCron.unregisterAllTasks();
        await registerCronTask("light_rhythm_room", schedule.EVERY_MINUTE, lightRhythmRoom)
        util.log("");

        util.log("***** Sparrenlaan 37 - Finished Initialization *****");
        util.log("");
    }

}

module.exports = Sparrenlaan37;

//TODO: move this actual logic to some other file (service?) and leave app.js as the 'middleware'
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

function lightRhythmRoom() {
    pyh.turnOnHS(group.ROOM, Math.floor(Math.random() * 100), Math.floor(Math.random() * 65500), Math.floor(Math.random() * 100))
    // TODO: abstracted rhythm method that gets some kind of data structure that defines the rhythm for a room
    // Like: time A: start at situation A, time B, situation B, etc + interpolate (linear)
    // TODO: It's not possible (with Hue) to update the light state when off.
    // One way to work around this is to have a 'virtual device' 'room' that will actually trigger
    // this Homey module and when turning off set brightness to 0% and when on directly link into the rhythm.
    // Plus (later): have a way to override / switch this rhythm on and off (virtual device?)
}

function registerAction(id, callback) {
    util.log(id + " --> " + callback.name);
    let action = new Homey.FlowCardAction(id);
    action
        .register()
        .registerRunListener(async (args, state) => {
            util.log("App action triggered: " + callback.name + "(" + JSON.stringify(args) + ")");
            try {
                callback(args, state);
            } catch (e) {
                util.log("Error occurred during callback: " + e);
            }
        });
}

async function registerCronTask(id, schedule, callback) {
    util.log(id + " @ '" + schedule + "' --> " + callback.name);
    let task = await Homey.ManagerCron.registerTask(id, schedule, {});
    task.on('run', data => {
        callback();
    });
}
