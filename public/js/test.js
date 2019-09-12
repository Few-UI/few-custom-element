/* eslint-env es6 */
/* global define */

/**
 * print message to console
 * @param {string} msg message to print
 * @returns {string} return message back
 */
define( [], () => {
    var _counter = 0;

    return {
        log: function( msg ) {
            console.log( msg );
            return msg;
        },
        testAccu: function() {
            return `count ${_counter++}`;
        }

    };
} );

