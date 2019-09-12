/* eslint-env es6 */

let exports;

import VirtualDomElement from './virtual-dom-element';

/**
 * Create DOM Element from HTML String
 * @param {string} str HTML String snippet as input
 * @returns {Element} DOM Element
 */
export function createElementFromHtmlString( str ) {
    let newDom = document.createElement( 'div' );
    newDom.innerHTML = str.trim();
    return newDom.firstChild;
}

export let evalTemplate = function( input, params ) {
  const names = params ? Object.keys( params ) : [];
  const vals = params ? Object.values( params ) : [];
  return new Function( ...names, `return \`${input}\`;` )( ...vals );
};


/**
 * get expression from '{{}}' pattern
 * @param {string} str string as '{{ something }}'
 * @returns {string} expression
 */
function getExpressionFromTemplate( str ) {
    let match = str.match( /^\s*{{\s*([\S\s\r\n]*)\s*}}\s*$/m );
    return match ? match[1] : null;
}

/**
 * create Virtual DOM from dom element
 * @param {DOM Element} elem dom element
 */
function createVirtualDom( elem ) {
    if( elem.nodeType !== Node.TEXT_NODE && elem.nodeType !== Node.ELEMENT_NODE ) {
        return;
    }

    let node = new VirtualDomElement( elem.nodeName );
    node.hasExpr = false;
    if ( elem.nodeType === Node.ELEMENT_NODE ) {
        for( let i = 0; i < elem.attributes.length; i++ ) {
            let name = elem.attributes[i].name;
            let value = elem.attributes[i].value;
            // TODO: we can do it better later
            let expr = getExpressionFromTemplate( value );
            if( expr ) {
                node.addProperty( name, expr );
                node.hasExpr = true;
            }
        }
    } else if ( elem.nodeType === Node.TEXT_NODE ) {
        let attr = 'textContent';
        let value = elem[attr];
        // TODO: we can do it better later
        let expr = getExpressionFromTemplate( value );
        if( expr ) {
            node.addProperty( attr, expr );
            node.hasExpr = true;
        }
    } else {
        // do nothing
    }

    if ( node.hasExpr ) {
        node.reference = elem;
    }

    for ( let i = 0; i < elem.childNodes.length; i++ ) {
        let child = elem.childNodes[i];
        let childNode = createVirtualDom( child );
        if( childNode ) {
            node.addChild( childNode );
            node.hasExpr = node.hasExpr ? node.hasExpr : childNode.hasExpr;
        }
    }
    return node;
}

/**
 * Interpreter for view and view model
 * @param {string} viewHtml view HTML snippet as string
 * @returns {Element} DOM Element contains everything
 */
export function createView( viewHtml ) {
    let newDom = document.createElement( 'div' );
    newDom.innerHTML = viewHtml.trim();
    let view = createVirtualDom( newDom );
    view.reference = newDom;
    return view;
}

export let evalExpression = function( input, params ) {
  const names = params ? Object.keys( params ) : [];
  const vals = params ? Object.values( params ) : [];
  return new Function( ...names, `return ${input};` )( ...vals );
};

/**
 * Set view model context on specific element
 * @param {Element} element DOM Element
 * @param {Object} viewModel viewModel object as context
 */
export function setViewModel( element, viewModel ) {
    element._vm = viewModel;
    element.classList.add( 'decl-scope' );
}

/**
 * Get closest parent element which has view model context
 * NOTE: IE may need polyfill below -
 * https://github.com/jonathantneal/closest
 *
 * @param {Element} element Current DOM Element
 * @returns {Element} Closest parent element which has view model context
 */
export function getViewElement( element ) {
    return element.closest( 'decl-scope' );
}

/**
 * Get view model context from closet parent element which has it
 *
 * @param {Element} element DOM Element
 * @returns {Object} view model object context
 */
export function getViewModel( element ) {
    let viewElement = exports.getViewElement( element );
    if( viewElement ) {
        return viewElement._vm;
    }
}

export default exports = {
    createElementFromHtmlString,
    evalTemplate,
    createView,
    evalExpression,
    getViewElement,
    getViewModel,
    setViewModel
};
