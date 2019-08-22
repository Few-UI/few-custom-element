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
 * Interpreter for view and view model
 * @param {string} viewHtml view HTML snippet as string
 * @param {JSON} viewModelJson view model JSON object
 * @returns {Element} DOM Element contains everything
 */
export function createView( viewHtml, viewModelJson ) {
    let viewTemplate = viewHtml.replace( /{{(.*?)}}/g, '$' + '{$1}' );
    return exports.createElementFromHtmlString( exports.evalTemplate( viewTemplate, {
        data: viewModelJson.data
    } ) );
}

/**
 * Set view model context on specific element
 * @param {Element} element DOM Element
 * @param {Object} viewModel viewModel object as context
 */
export function setDataModel( element, viewModel ) {
    element.$scope = viewModel;
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
export function getDataModel( element ) {
    let viewElement = exports.getViewElement( element );
    if( viewElement ) {
        return viewElement.$scope;
    }
}

export default exports = {
    createElementFromHtmlString,
    evalTemplate,
    createView,
    getViewElement,
    getDataModel,
    setDataModel
};
