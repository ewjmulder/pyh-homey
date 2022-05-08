"use strict";

const hue_v3 = require("node-hue-api").v3;
const hue_api = hue_v3.api.createLocal("192.168.1.50").connect("x-18OhWUAZcKMWrURpU6suoE-IN0nOA7dyuQJV3x")

// Import classes to perform prototype extensions on.
const HueBridge = require("phea/build/hue-bridge").HueBridge;
const PheaEngine = require("phea/build/phea-engine").PheaEngine;
const HueLight = require("phea/build/hue-light").HueLight;

HueBridge.prototype.blink = function(fromRgb, toRgb, cycles, cycleTimeInMillis) {
    this.pheaEngine.blink(fromRgb, toRgb, cycles, cycleTimeInMillis);
}
PheaEngine.prototype.blink = function(fromRgb, toRgb, cycles, cycleTimeInMillis) {
    this.lights.forEach((light) => {
        light.blink(fromRgb, toRgb, cycles, cycleTimeInMillis);
    });
}
HueLight.prototype.blink = function (fromRgb, toRgb, cycles, cycleTimeInMillis) {
    this.gen = setBlink(this, fromRgb, toRgb, cycles, cycleTimeInMillis);
}

// TODO: make these settings into a Blink class that can provide convenience
// functions, like getting the firstHalfFrom, secondHalfTo, etc + make copies of those
function* setBlink(light, fromRgb, toRgb, cycles, cycleTimeInMillis) {
    for (let i = 0; i < cycles * 2; i++) {
        let currentFromRgb = [...fromRgb];
        let currentToRgb = [...toRgb];
        if (i % 2 === 1) {
            currentFromRgb = [...toRgb];
            currentToRgb = [...fromRgb];
        }
        // Set current state to from get correct tween calculation.
        light.rgb = currentFromRgb;
        let tween = light.calculateTween(currentToRgb, cycleTimeInMillis / 2);
        while (tween.frames-- > 0) {
            light.rgb[0] += tween.dr;
            light.rgb[1] += tween.dg;
            light.rgb[2] += tween.db;
            yield;
        }
    }
}


const phea = require('phea');

let options = {
    "address": "192.168.1.50",
    "username": "x-18OhWUAZcKMWrURpU6suoE-IN0nOA7dyuQJV3x",
    "psk": "F5ECD64FCFE3B44CD53BBA2B91643A48",
    "dtlsTimeoutMs": 1000,
}

let bridgePromise = phea.bridge(options);

hue_api.then(api => {
    api.lights.getLightState(11).then(state => {
        console.log("state before: " + JSON.stringify(state));
        bridgePromise.then(bridge => {
            bridge.start(16).then(done => {
                let fromRgb = [1, 0, 0];
                let toRgb = [255, 0, 0];
                let cycles = 3
                let cycleTimeInMillis = 1000;

                bridge.blink(fromRgb, toRgb, cycles, cycleTimeInMillis);

                setTimeout(function() {
                    bridge.stop().then(done => {
                        api.groups.setGroupState(2, state);
                    })
                }, cycles * cycleTimeInMillis);
            }).catch(err => console.log("start err: " + err));
        }).catch(err => console.log("connect err: " + err));
    })
})
