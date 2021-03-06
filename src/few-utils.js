/* eslint-env es6 */
import yaml from 'js-yaml';
import http from './http';

/**
 * merge model object
 * Deprecate function, keep here for not loosing the code
 * @param {Object} tar target object
 * @param {Object} src source object
 * @returns {Object} target object
 */
function mergeModel( tar, src ) {
    if ( tar === undefined ) {
        return src;
    }

    if( isPrimitive( tar ) || isPrimitive( src ) || Array.isArray( src ) ) {
        return src;
    }

    for ( let key in src ) {
        tar[key] = mergeModel( tar[key], src[key] );
        if ( tar[key] === undefined ) {
            delete tar[key];
        }
    }
    return tar;
}

/**
 * Parse view string as DOM without interpret it
 * TODO no for now and needs to be enahanced
 * @param {string} str view template as string
 * @returns {Element} DOM Element
 */
export function parseView( str ) {
    let parser = new DOMParser();
    let fragement = document.createDocumentFragment();
    fragement.appendChild( parser.parseFromString( `<div>${str}</div>`, 'text/html' ).body.firstChild );
    return fragement.firstChild;
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
 * @param {boolean} ignoreError if true the error is not thrown
 * @param {boolean} applyObject object will apply to the expr as this
 * @return {*} evaluation result
 *
 * TODO: match name with function parameters
 * https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
 */
export let evalExpression = function( input, params, ignoreError, applyObject ) {
  const names = params ? Object.keys( params ) : [];
  const vals = params ? Object.values( params ) : [];
  try {
      let func = new Function( ...names, `return ${input};` );
      return func.apply( applyObject, vals );
  } catch( e ) {
      if ( !ignoreError ) {
          throw new Error( `evalExpression('${input}') => ${e.message}` );
      } else {
          return undefined;
      }
  }
};

/**
 * load JSON config
 * @param {string} configPath path for JSON configuration
 * @returns {Promise} promise with configuratino JSON object
 */
export async function loadJSON( configPath ) {
    return JSON.parse( await http.get( configPath ) );
}


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
 * fastest way to compare a pure JSON object, use on your own risk
 * https://www.mattzeunert.com/2016/01/28/javascript-deep-equal.html
 *
 * @param {Object} obj Current DOM Element
 * @returns {Object} new cloned object
 */
export function deepEqual( a, b ) {
    return isPrimitive( a ) || isPrimitive( b ) ? a === b :
        JSON.stringify( a ) === JSON.stringify( b );
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
 * applySlot to template element. Both inputs will be mutated in this API.
 * @param {Element} templateElem template element that contains slot definition
 * @param {Element} srcElem source element that contains actual slot element
 */
export function applySlot( templateElem, srcElem ) {
    // SLOT: get all children and save at slot as template
    // TODO: we can do it outside and passin unit which will be better
    let _slot = null;
    let size = srcElem.childNodes.length;
    if ( size > 0 ) {
        _slot = {
            domFragement: document.createDocumentFragment(),
            nameSlotMap: {}
        };
        for( let i = 0; i < size; i++ ) {
            let domNode = srcElem.firstChild;
            if ( domNode.getAttribute && domNode.getAttribute( 'slot' ) ) {
                _slot.nameSlotMap[domNode.getAttribute( 'slot' )] = domNode;
                // remove slot attribute to avoid complication
                domNode.removeAttribute( 'slot' );
            }
            _slot.domFragement.appendChild( domNode );
        }
    }

    // SLOT: apply slot to current DOM
    // TODO: we can do it before atttachViewPage to save performance later
    let slotElements = templateElem.getElementsByTagName( 'SLOT' );
    size = slotElements.length;
    if ( size > 0 ) {
        let unNamedSlot = null;
        for( let i = size; i > 0; i-- ) {
            let slotElem = slotElements[i - 1];  // <-- HTMLCollection is a dynamic list
            let slotName = slotElem.getAttribute( 'name' );
            if ( slotName && _slot.nameSlotMap[slotName] ) {
                slotElem.parentElement.replaceChild( _slot.nameSlotMap[slotName], slotElem );
            } else if( !unNamedSlot ) {
                // match thi 1st unnamed slot
                unNamedSlot = slotElem;
            }
        }

        // if we have unname slot, put all the rest into unname slot
        if ( unNamedSlot ) {
            unNamedSlot.parentElement.replaceChild( _slot.domFragement, unNamedSlot );
        }
    }
}

/**
 * Check if element has scope defined
 *
 * @param {Element} element Current DOM Element
 * @returns {boolean} true if element has scope defined
 */
export function hasScope( element ) {
    return element && element.classList && element.classList.contains( 'few-scope' );
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
        return getComponentFromElem( scopeElem );
    }
}

/**
 * Get view model context from curren element. Return undefiened if it doesn't exist
 * Simple wrapper for _vm
 *
 * @param {Element} element DOM Element
 * @returns {Object} view model object context
 */
export function getComponentFromElem( element ) {
    return element._vm;
}

/**
 * Get closest few view element
 *
 * @param {Element} element Current DOM Element
 * @returns {Element} Closest parent element which has view model context
 */
export function getViewElement( element ) {
    return getScopeElement( element );
}

/**
 * get path from URL by removing '/[^/]+$'
 * @param {string} url URL
 * @returns {Object} { base, name, ext }
 */
export function parseUrl( url ) {
    let res = {};
    let str = url;

    // base url
    let match = url.match( /^.*\// );
    if ( match ) {
        res.base = match[0];
        str = url.replace( /^.*\//, '' );
    } else {
        res.base = '';
        str = url;
    }

    // ext
    match = str.match( /\.([^. ]+)$/ );

    if ( match ) {
        res.ext = match[1];
        res.name = str.replace( /\.([^. ]+)$/, '' );
    } else {
        res.ext = '';
        res.name = str;
    }

    return res;
}

/**
 * resolve relative path to absolute based on URL
 * @param {String} baseUrl base URL
 * @param {String} path, relative path
 * @returns {String} absolute URL
 */
export function resolvePath( baseUrl, path ) {
    if( /^\.\.?\//.test( path ) && baseUrl ) {
        return baseUrl + '/' + path;
    }
    return path;
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


/**
 * Check value type is primitive or not
 * @param {any} val input value
 * @returns {boolean} true if input is number or string
 */
export function isPrimitive( val ) {
  const type = typeof val;
  return type === 'number' || type === 'string' || type === 'boolean';
}

export const isArray = Array.isArray;
