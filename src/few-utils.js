/* eslint-env es6 */


/**
 * get expression from '{{}}' pattern
 * We may switch to ${} later.
 * https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
 * @param {string} str string as '{{ something }}'
 * @returns {string} expression
 */
export function parseStringTemplate( str ) {
    let match = str.match( /^\s*{{\s*([\S\s\r\n]*)\s*}}\s*$/m );
    return match ? match[1] : null;
}

/**
 * Parse view string as DOM with interpretion
 * @param {string} str HTML String snippet as input
 * @returns {Element} DOM Element
 */
export function parseView2( str ) {
    let newDom = document.createElement( 'div' );
    newDom.innerHTML = str.trim();
    return newDom;
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

export let evalObjectExpression = function( obj, model ) {
    for( let key in obj ) {
        // TODO: we can do it at compile to save performance
        let value = obj[key];
        if ( typeof value === 'string' ) {
            let template = parseStringTemplate( value );
            if ( template ) {
                obj[key] = evalExpression( template, model );
            }
        } else {
            evalObjectExpression( obj[key], model );
        }
    }
    return obj;
};

/**
 * Set view model context on specific element
 * @param {Element} element DOM Element
 * @param {Object} viewModel viewModel object as context
 */
export function setComponent( element, viewModel ) {
    element._vm = viewModel;
    element.classList.add( 'few-scope' );
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
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param {Object} obj Current DOM Element
 * @returns {Object} new cloned object
 */
export function cloneDeepJsonObject( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
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

/**
 * Get view model context from closet parent element which has it
 *
 * @param {Element} element DOM Element
 * @returns {Object} view model object context
 */
export function getComponent( element ) {
    let viewElement = getViewElement( element );
    if( viewElement ) {
        return viewElement._vm;
    }
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
