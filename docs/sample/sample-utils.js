/* eslint-env es6 */
/* global define few */

/**
 * print message to console
 * @param {string} msg message to print
 * @returns {string} return message back
 */
define( [], () => {
    var _counter = 0;

    var exports = {};

    exports.log = function( msg ) {
        console.log( msg );
        return msg;
    };

    exports.testAccu = function() {
        return `count ${_counter++}`;
    };

    exports.testAccu2 = function( value ) {
        return ++value;
    };

    exports.testProc = function( value ) {
        return value ? `Input '${value}'` : 'No Input';
    };

    exports.testProcAsync = function( value ) {
        return new Promise( ( resolve, reject ) => {
            setTimeout( () => {
                resolve( value ? `Input '${value}'` : 'No Input' );
            }, 1000 );
        } );
    };

    exports.testSubmit = function( msg, elem, data ) {
        let viewElem = few.getViewElement( elem );
        viewElem.dispatchEvent( new CustomEvent( 'fewupdate',
            {
                bubbles    : true, // Whether the event will bubble up through the DOM or not
                cancelable : true,  // Whether the event may be canceled or not
                detail: {
                    id: viewElem.id,
                    msg: msg,
                    value: data
                }
            }
        ) );
    };

    return exports;
} );

