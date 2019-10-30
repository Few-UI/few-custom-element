/* eslint-env es6 */

import yaml from 'js-yaml';
import { defineDirective } from './few-view-directive';
import { excludeElement } from './few-view-null-unit';
import { getComponent, getFormInput, getViewElement } from './few-utils';
import http from './http';

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

    let component = getComponent( elem );
    return component.update( methodName, {
        element: elem,
        event: e
    } );
}

/**
 * Request update to parent view model
 * @param {Element} elem DOM Element  as context
 * @param {object}  data data as request input
 * @param {string}  method action name
 * @returns {Promise} evaluation as promise
 */
export function requestUpdate( elem, data, method ) {
    let viewElem = getViewElement( elem );
    let parentElement = viewElem.parentElement;
    let component = getComponent( parentElement );
    let actionName = method || viewElem.id;
    if ( component.hasAction( actionName ) ) {
        // TODO: need to tune performance to reduce over update
        return component.update( actionName, data );
    }
    return requestUpdate( parentElement, data, actionName );
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

/**
 * default loadModule function
 * @param {Array} moduleNames array of name or rel path for modules as key
 * @returns {Promise} promise with module objects
 */
let _loadModuleCallback = function( moduleNames ) {
    return Promise.all( moduleNames.map( ( key ) => {
        return import( key );
    } ) );
};

/**
 * Import Global Document Style Sheet to shadow DOM
 * @param {Array} deps Dependency as string or array of string
 * @returns {Promise} promise with dependencies
 */
export function loadModules( deps ) {
    return _loadModuleCallback( deps );
}

/**
 * Set loader function for few
 * @param {Function} callback loader function as callback
 */
export function setModuleLoader( callback ) {
    _loadModuleCallback = callback;
}

/**
 * default loadComponent function
 * @param {string} path relative path of component
 * @returns {Promise} promise with componentDef objects
 */
let _loadComponentCallback = async function( path ) {
    return yaml.safeLoad( await http.get( path ) );
};

/**
 * Import Global Document Style Sheet to shadow DOM
 * @param {string} path relative path of component
 * @returns {Promise} promise with componentDef objects
 */
export function loadComponent( path ) {
    return _loadComponentCallback( path );
}

/**
 * Set loader function for few
 * @param {Function} callback loader function as callback
 */
export function setComponentLoader( callback ) {
    _loadComponentCallback = callback;
}

export default exports = {
    handleEvent,
    requestUpdate,
    getFormInput,
    getViewElement,
    importDocStyle,
    loadModules,
    setModuleLoader,
    loadComponent,
    setComponentLoader,
    httpGet: http.get,
    exclude: excludeElement,
    directive: defineDirective
};

// set it at global
window.few = exports;

// load router
