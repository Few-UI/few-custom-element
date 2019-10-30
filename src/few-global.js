/* eslint-env es6 */

import http from './http';
import FewComponent from './few-component';

import { defineDirective } from './few-view-directive';
import { excludeElement } from './few-view-null-unit';
import {
    getComponent,
    getFormInput,
    getViewElement,
    loadModules,
    setModuleLoader,
    loadComponent,
    setComponentLoader
} from './few-utils';

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
 * Reneder component to specific DOM Element
 * NOTE: Promise here doesn't mean render done - we can't catch what happen inside
 * custom elemenet there is no callback or event to say 'render done'
 * @param {string} componentPath path for component definition
 * @param {Element} containerElem container element that component attach to
 * @param {Element} modelPath model path to fetch model from parent ( if parent exist )
     * @param {string} baseUrl base URL for relative path
 * @returns {Promise} promise can be used for next step
 */
export async function render( componentPath, containerElem, modelPath, baseUrl ) {
    // NOTE: THIS HAS TO BE HERE BEFORE 1ST AWAIT. BE CAREFUL OF AWAIT
    let parentComponent = getComponent( containerElem );

    // load from parent
    let model =  parentComponent && modelPath  ? parentComponent.getValue( modelPath ) : undefined;

    // load component definition
    let componentDef = await loadComponent( componentPath );

    // Create component and call init definition
    let component = new FewComponent( componentDef, parentComponent,  model );

    await component.render( componentDef.view, containerElem, baseUrl );

    return component;
}

export default exports = {
    render,
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
