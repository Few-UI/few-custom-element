/* eslint-env es6 */

import { getViewModel, getFormInput, getViewElement } from './few-utils';

let exports;

/**
 * Run method in view model
 * @param {Element} elem DOM Element
 * @param {string} methodName method name in view model
 * @param {object}  e event object as context
 * @returns {Promise} evaluation as promise
 */
export function handleEvent( elem, methodName, e ) {
    /*
        return false from within a jQuery event handler is effectively the same as calling
        both e.preventDefault and e.stopPropagation on the passed jQuery.Event object.

        e.preventDefault() will prevent the default event from occuring.
        e.stopPropagation() will prevent the event from bubbling up.
        return false will do both.

        Note that this behaviour differs from normal (non-jQuery) event handlers, in which,
        notably, return false does not stop the event from bubbling up.

        Source: John Resig
    */
    e.preventDefault();
    // e.stopPropagation();

    let component = getViewModel( elem );
    return component.update( methodName, {
        element: elem,
        event: e
    } );
}

/**
 * Import Global Document Style Sheet to shadow DOM
 * @param {Element} shadowRoot Shadow root element for shadow DOM
 */
export function importDocStyle( shadowRoot ) {
    let linkElems = document.head.querySelectorAll( 'link' );
    linkElems.forEach( ( elem )=>{
        if ( elem.rel === 'stylesheet' ) {
            shadowRoot.appendChild( elem.cloneNode() );
        }
    } );
}

export default exports = {
    handleEvent,
    getFormInput,
    getViewElement,
    importDocStyle
};

// set it at global
window.few = exports;
