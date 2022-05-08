"use strict";

const util = require('./util');
const mired = require('./constants/hue/mired');

const hue_v3 = require("node-hue-api").v3;
const LightState = hue_v3.model.lightStates.LightState;
const GroupLightState = hue_v3.model.lightStates.GroupLightState;

// //TODO: temp for testing
// const entertainment_group = require('./constants/hue/entertainment_group');
//
const hue_config = require('./constants/hue/config');
// //TODO: is there a way to force resolve this into a local variabe somehow?
// //Seems like, yes you can:
// // (only question is how to know for sure this assignment took place?
// // Seems like a safe bet after boot, maybe have some kind of await at init?)
// /*
//   let hue;
//
//   before(() => {
//     return discovery.nupnpSearch()
//       .then(searchResults => {
//         return HueApi.create(searchResults[0].ipaddress, testValues.username, testValues.clientkey)
//           .then(api => {
//             hue = api;
//           });
//       });
//   });
//  */
const hue_api = hue_v3.api.createLocal(hue_config.HOST).connect(hue_config.USERNAME)
//
// //TODO: find a proper way to combine hue api & entertainment api
// const hue_entertainment = require('phea');
//
// let options = {
//     "address": hue_config.HOST,
//     "username": hue_config.USERNAME,
//     "psk": hue_config.KEY,
//     "dtlsTimeoutMs": 1000,
// }
//
// let bridgeProm = hue_entertainment.bridge(options);
//
// util.log("Before connect");
// bridgeProm.then(bridge => {
//     util.log("Before start");
//     bridge.start(entertainment_group.KITCHEN).then(done => {
//         let lightId = [0];         // 0 is the Default Group for setting all lights in group.
//         let rgb = [255, 0, 0]; // RGB int array [r, g, b]
//         let transitionTime = 300; // Milliseconds
//
//         bridge.transition(lightId, rgb, transitionTime);
//         setTimeout(function() {
//             rgb = [0, 0, 0];
//             bridge.transition(lightId, rgb, transitionTime);
//             setTimeout(function() {
//                 rgb = [255, 0, 0];
//                 bridge.transition(lightId, rgb, transitionTime);
//                 setTimeout(function() {
//                     rgb = [0, 0, 0];
//                     bridge.transition(lightId, rgb, transitionTime);
//                     setTimeout(function() {
//                         rgb = [255, 0, 0];
//                         bridge.transition(lightId, rgb, transitionTime);
//                         setTimeout(function() {
//                             rgb = [0, 0, 0];
//                             bridge.transition(lightId, rgb, transitionTime);
//                             setTimeout(function() {
//                                 rgb = [255, 0, 0];
//                                 bridge.transition(lightId, rgb, transitionTime);
//                             }, transitionTime);
//                         }, transitionTime);
//                     }, transitionTime);
//                 }, transitionTime);
//             }, transitionTime);
//         }, transitionTime);
//         util.log("After trans");
//     }).catch(err => util.log("start err: " + err));
//     util.log("After start");
// }).catch(err => util.log("connect err: " + err));
// util.log("After connect");

module.exports = {
    turnOnHS: turnOnHS,
    turnOnCT: turnOnCT,
    turnOff: turnOff,
    toggleHS: toggleHS,
    toggleCT: toggleCT,
    blink: blink,
};

/**
 * @param {int} group - The id of the group.
 * @param {int} brightness - From 0 (most dimmed, not off) to 100 (most bright).
 * @param {int} hue - From 0 to 65535 (loops through all colors).
 * @param {int} saturation - From 0 (white) to 100 (full color).
 * @param {int} transitionTime - Time of transition in millis.
 */
function turnOnHS(group, brightness, hue, saturation, transitionTime=400) {
    util.log("Turning on group: " + group + " with brightness: " + brightness + ", hue: " + hue + ", saturation: " + saturation + " in transitionTime: " + transitionTime);
    const groupState = new GroupLightState()
        .on()
        .brightness(brightness)
        .hue(hue)
        .saturation(saturation)
        .transitionInMillis(transitionTime);
    hue_api.then(api => api.groups.setGroupState(group, groupState));
}

/**
 * @param {int} group - The id of the group.
 * @param {int} brightness - From 0 (most dimmed, not off) to 100 (most bright).
 * @param {int} ct - From 0 (most soft, yellowish) to 100 (most bright, white)
 * @param {int} transitionTime - Time of transition in millis.
 */
function turnOnCT(group, brightness, ct, transitionTime=400) {
    util.log("Turning on group: " + group + " with with brightness: " + brightness + ", color temperature: " + ct + " in transitionTime: " + transitionTime);
    const miredValue = mired.MIN + Math.round(((100 - ct) / 100) * (mired.MAX - mired.MIN));
    const groupState = new GroupLightState()
        .on()
        .brightness(brightness)
        .ct(miredValue)
        .transitionInMillis(transitionTime);
    hue_api.then(api => api.groups.setGroupState(group, groupState));
}

function turnOff(group) {
    util.log("Turning off group " + group);
    const groupState = new GroupLightState()
        .off();
    hue_api.then(api => api.groups.setGroupState(group, groupState));
}

// TODO: Abstract these 2 below
function toggleHS(group, brightness, hue, saturation, transitionTime=400) {
    hue_api.then(api => {
        api.groups.getGroupState(group).then(state => {
            console.log("Group light state before: " + JSON.stringify(state));
            if (state.on) {
                turnOff(group);
            } else {
                turnOnHS(group, brightness, hue, saturation, transitionTime);
            }
        });
    });
}

function toggleCT(group, brightness, ct, transitionTime=400) {
    hue_api.then(api => {
        api.groups.getGroupState(group).then(state => {
            console.log("Group light state before: " + JSON.stringify(state));
            if (state.any_on) {
                turnOff(group);
            } else {
                turnOnCT(group, brightness, ct, transitionTime);
            }
        });
    });
}

/**
 * @param {int} room - The id of the room.
 * @param {int} color - From 0 to 65535, same as hue value (loops through all colors).
 * @param {int} cycleTime - Length of 1 blink in millis.
 */
async function blink(room, color, cycleTime=20000) {
    util.log("Blinking room: " + room + " in color: " + color);
    hue_api.then(api => performBlink(api, room, color, cycleTime));
}

async function performBlink(api, room, color, cycleTime) {
    // Trial with blink using entertainment API
    // const entertainmentApi = EntertainmentApi(api);
    util.log("api: " + api);
    const entertainment = await api.entertainment.start(16);
    util.log("entertainment: " + JSON.stringify(entertainment));
    const stopped = await entertainment.stop();
    util.log("stopped: " + stopped);
    // // TODO: instead of await you can later use the promise with a then.
    // const previousState = await api.groups.getGroup(room);
    // util.log("previousState: " + JSON.stringify(previousState));
    // // for (let i = 0; i < 6; i++) {
    //     const groupState = new GroupLightState()
    //         .on()
    //         .brightness(100)
    //         .hue(color)
    //         .saturation(100)
    //         .alertShort();
    //     api.groups.setGroupState(room, groupState);
    // // }
    // // api.groups.setGroupState(room, previousState.action);
}
