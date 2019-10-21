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

    exports.setValue = function( msg ) {
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

    exports.getMovieListFromOmdb = function( filterString ) {
        var data = 'http://www.omdbapi.com/?s=' + encodeURIComponent( filterString ) + '&apikey=4bca95fd&page=' + 0;
        return data;
    };

    return exports;
} );

