"use strict";

const util = require('./util');

const hue_v3 = require("node-hue-api").v3;
const LightState = hue_v3.model.lightStates.LightState;
const GroupLightState = hue_v3.model.lightStates.GroupLightState;

// const hue_color = require('./constants/hue/color');
const hue_config = require('./constants/hue/config');
const hue_group = require('./constants/hue/group');

const hue_api = hue_v3.api.createLocal(hue_config.HOST).connect(hue_config.USERNAME)

module.exports = {
    blinkRoom: function (color) {
        //TODO: logging
        const lightState = new LightState()
            .on(true)
            .brightness(100)
            .hue(color)
            .saturation(100)
        hue_api.then(api => api.lights.setLightState(6, lightState))
    },
    bar: function () {
        // whatever
    }
};


//
// return HUE_V3.api.createLocal(HUE_HOST).connect(HUE_USERNAME).then(api => {
//     api.lights.setLightState(6, {on: false})
// });


// HUE_V3.api.createLocal(HUE_HOST).connect(HUE_USERNAME).then(api => {
//     const groupState = new GroupLightState()
//         .on()
//         .brightness(100)
//         .hue(0)
//         .saturation(100)
//         .alertLong()
//     api.groups.setGroupState(HUE_GROUP_ID_ROOM, groupState)
//         .then(result => {
//             console.log(`Updated Group State: ${result}`);
//         });
//     });
