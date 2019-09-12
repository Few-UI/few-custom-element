/* eslint-env es6 */
let exports;

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
export function getExpressionFromTemplate( str ) {
    let match = str.match( /^\s*{{\s*([\S\s\r\n]*)\s*}}\s*$/m );
    return match ? match[1] : null;
}

/**
 * Parse view string as DOM without interpret it
 * @param {string} str view template as string
 * @returns {Element} DOM Element
 */
export function parseView( str ) {
    let parser = new DOMParser();
    return parser.parseFromString( `<div>${str}</div>`, 'text/html' ).body.firstChild;
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
    return element.closest( '.decl-scope' );
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
    getExpressionFromTemplate,
    createElementFromHtmlString,
    evalTemplate,
    evalExpression,
    getViewElement,
    getViewModel,
    parseView,
    setViewModel
};
