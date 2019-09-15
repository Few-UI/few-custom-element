/* eslint-env es6 */

import { getViewModel } from './few-utils';

let exports;

/**
 * Run method in view model
 * @param {Element} elem DOM Element
 * @param {string} methodName method name in view model
 */
export function exec( elem, methodName ) {
    let vm = getViewModel( elem );
    vm.evalMethod( methodName );
}

export default exports = {
    exec
};

window.few = exports;
