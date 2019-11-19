/* eslint-env es6 */
/* global define few */

/**
 * print message to console
 * @param {string} msg message to print
 * @returns {string} return message back
 */
define( [], () => {
    var exports = {};

    exports.digitAction = function( currValue, newInput ) {
        return ( currValue === '0' ? '' : currValue.toString() ) + newInput;
    };

    exports.addAction = function( currValue ) {
        if ( /(\+|-)$/.test( currValue ) ) {
            return currValue;
        }
        return currValue + '+';
    };

    exports.minusAction = function( currValue ) {
        if ( /(\+|-)$/.test( currValue ) ) {
            return currValue;
        }
        return currValue + '-';
    };

    exports.equalAction = function( currValue ) {
      let func = new Function( `return ${currValue};` );
      return func.apply( null ).toString();
    };

    return exports;
} );

