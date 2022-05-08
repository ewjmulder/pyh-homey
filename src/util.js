"use strict";

module.exports = {
    // ************************* TO BE OVERRIDDEN ***************************
    // Will be overridden by main app to distribute pretty logging function.
    log: function (any) { },

    // ************************* OTHER UTIL ***************************
    sleep: function(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }
};
