"use strict";

const util = require('./util');
const mired = require('./constants/hue/mired');

const hue_v3 = require("node-hue-api").v3;
const LightState = hue_v3.model.lightStates.LightState;
const GroupLightState = hue_v3.model.lightStates.GroupLightState;

const hue_config = require('./constants/hue/config');
const hue_api = hue_v3.api.createLocal(hue_config.HOST).connect(hue_config.USERNAME)

module.exports = {
    turnOnHS: turnOnHS,
    turnOnCT: turnOnCT,
    turnOff: turnOff,
    blink: blink,
};

/**
 * @param {int} room - The id of the room.
 * @param {int} brightness - From 0 (most dimmed, not off) to 100 (most bright).
 * @param {int} hue - From 0 to 65535 (loops through all colors).
 * @param {int} saturation - From 0 (white) to 100 (full color).
 * @param {int} transitionTime - Time of transition in millis.
 */
function turnOnHS(room, brightness, hue, saturation, transitionTime=400) {
    util.log("Turning on room " + room + " with brightness: " + brightness + ", hue: " + hue + ", saturation: " + saturation + " in transitionTime: " + transitionTime);
    const groupState = new GroupLightState()
        .on()
        .brightness(brightness)
        .hue(hue)
        .saturation(saturation)
        .transitionInMillis(transitionTime);
    hue_api.then(api => api.groups.setGroupState(room, groupState));
}

/**
 * @param {int} room - The id of the room.
 * @param {int} brightness - From 0 (most dimmed, not off) to 100 (most bright).
 * @param {int} ct - From 0 (most bright, white) to 100 (most soft, yellowish)
 * @param {int} transitionTime - Time of transition in millis.
 */
function turnOnCT(room, brightness, ct, transitionTime=400) {
    util.log("Turning on room " + room + " with with brightness: " + brightness + ", color temperature: " + ct + " in transitionTime: " + transitionTime);
    const miredValue = mired.MIN + ct * (mired.MAX - mired.MIN);
    const groupState = new GroupLightState()
        .on()
        .brightness(brightness)
        .ct(miredValue)
        .transitionInMillis(transitionTime);
    hue_api.then(api => api.groups.setGroupState(room, groupState));
}

function turnOff(room) {
    util.log("Turning off room " + room);
    const groupState = new GroupLightState()
        .off();
    hue_api.then(api => api.groups.setGroupState(room, groupState));
}

function blink(room, color) {
    util.log("Blinking room " + room + " in color " + color);
    util.log("TODO");
}
