/* eslint-env es6 */

/**
 * Parse view string as DOM without interpret it
 * TODO no for now and needs to be enahanced
 * @param {string} str view template as string
 * @returns {Element} DOM Element
 */
export function parseView( str ) {
    let parser = new DOMParser();
    return parser.parseFromString( `<div>${str}</div>`, 'text/html' ).body.firstChild;
}


/**
 * Parse view string as DOM with interpretion
 * @param {string} str HTML String snippet as input
 * @returns {Element} DOM Element
 */
export function parseViewToDiv( str ) {
    let newDom = document.createElement( 'div' );
    newDom.innerHTML = str.trim();
    return newDom;
}

/**
 * evaluate string as Javascript expression
 * @param {string} input string as expression
 * @param {Object} params parameters as name value pair
 * @return {*} evaluation result
 *
 * TODO: match name with function parameters
 * https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
 */
export let evalExpression = function( input, params ) {
  const names = params ? Object.keys( params ) : [];
  const vals = params ? Object.values( params ) : [];
  try {
      return new Function( ...names, `return ${input};` )( ...vals );
  } catch( e ) {
      throw new Error( `evalExpression('${input}') => ${e.message}` );
  }
};


/**
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param {Object} obj Current DOM Element
 * @returns {Object} new cloned object
 */
export function cloneDeepJsonObject( obj ) {
    return obj ? JSON.parse( JSON.stringify( obj ) ) : obj;
}

/**
 * simple http get
 * @param {string} theUrl url as string
 * @returns {Promise} promise
 */
export function httpGet( theUrl ) {
    return new Promise( ( resolve, reject ) => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
                resolve( xmlHttp.responseText );
            }
        };
        xmlHttp.open( 'GET', theUrl, true ); // true for asynchronous
        xmlHttp.send( null );
    } );
}

/**
 * get form input from Form HTML Element
 * @param {Element} elem Form element
 * @returns {Object} from input as name value pair
 */
export function getFormInput( elem ) {
    let res = {};
    // TODO: not consider custom element for now
    if( elem.tagName === 'FORM' ) {
        let nodeList = elem.elements;
        for ( let i = 0; i < nodeList.length; i++ ) {
            if ( nodeList[i].nodeName === 'INPUT' && nodeList[i].type === 'text' ) {
                // Update text input
                nodeList[i].value.toLocaleUpperCase();
            }

            // only supports naming input
            if( nodeList[i].name ) {
                res[nodeList[i].name] = nodeList[i].value;
            }
        }
    }
    return res;
}

/**
 * Get closest parent element which has view model context
 * NOTE: IE may need polyfill below -
 * https://github.com/jonathantneal/closest
 *
 * @param {Element} element Current DOM Element
 * @returns {Element} Closest parent element which has view model context
 */
function getScopeElement( element ) {
    return element.closest( '.few-scope' );
}

/**
 * Attach component object on specific element
 * @param {Element} element DOM Element
 * @param {Object} componentObj componentObject
 */
export function setComponent( element, componentObj ) {
    if ( element && componentObj ) {
        element._vm = componentObj;
        element.classList.add( 'few-scope' );
    } else {
      throw new Error( `setComponent(${element ?  element.id ? `id:${element.id}` : element.tagName  : 'undefined'}) => componentObj is undefined` );
    }
}

/**
 * Get view model context from closet parent element which has it
 *
 * @param {Element} element DOM Element
 * @returns {Object} view model object context
 */
export function getComponent( element ) {
    let scopeElem = getScopeElement( element );
    if( scopeElem ) {
        return scopeElem._vm;
    }
}

/**
 * Get closest few view element
 *
 * @param {Element} element Current DOM Element
 * @returns {Element} Closest parent element which has view model context
 */
export function getViewElement( element ) {
    let scopeElem = getScopeElement( element );
    if ( scopeElem ) {
        return scopeElem.parentElement;
    }
}


