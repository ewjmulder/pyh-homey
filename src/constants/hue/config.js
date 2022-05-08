"use strict";

const Homey = require("homey");

module.exports = {
    HOST: Homey.env["HUE_BRIDGE_HOST"],
    USERNAME: Homey.env["HUE_API_USERNAME"],
    KEY: Homey.env["HUE_API_KEY"],
};
