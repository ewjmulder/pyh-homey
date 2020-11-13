"use strict";

const pyh = require('./src/pyh');
const util = require('./src/util');
const color = require('./src/constants/hue/color');

module.exports = [

    {
        method: 'GET',
        path: '/',
        public: true,
        fn: function(args, callback) {
            //TODO: logging
            pyh.blinkRoom(color.RED);
            return callback(null, "success");
        }
    },


    // {
    //     method: 'PUT',
    //     path: '/:id',
    //     fn: function( args, callback ){
    //         const result = Homey.app.updateSomething( args.params.id, args.body );
    //         if( result instanceof Error ) return callback( result );
    //         return callback( null, result );
    //     }
    // },

]