/* eslint-env es6 */
// https://github.com/riot/route/blob/master/src/index.js

let _started = false;
const RE_ORIGIN = /^.+?\/\/+[^/]+/;
const win = typeof window !== 'undefined' && window;
const hist = win && history;
const loc = win && ( hist.location || win.location ); // see html5-history-api

const POPSTATE = 'popState';
const HASHCHANGE = 'hashchange';

let _routingUnits = [];

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
function DEFAULT_PARSER( path ) {
    return path.split( /[/?#]/ );
}

/**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
function getPathFromRoot( href ) {
  return ( href || loc.href ).replace( RE_ORIGIN, '' );
}


/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
function addWindowListener() {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onpopstate
    // Not support history for now
    /*
    win.addEventListener( 'popState', () => {
        console.log( 'win.popState!' );
    } );
    */

    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onhashchange
    win.addEventListener( 'hashchange', _hashChangeHandler );
}

/**
 * internal handler for hashchange event
 * @param {Event} e hash change event
 */
function _hashChangeHandler( e ) {
    _processURL( e.newURL );
}


/**
 * internal method to process URL
 * @param {string} url current URL transit to
 */
function _processURL( url ) {
    for( let unit in _routingUnits ) {
        _routingUnits[unit].processURL( url );
    }
}

/**
 * Start client router service
 */
function start() {
    if ( !_started ) {
        if ( win ) {
            if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
                addWindowListener( /*autoExec*/ );
            } else {
                document.onreadystatechange = function() {
                    if ( document.readyState === 'interactive' ) {
                        // the timeout is needed to solve
                        // a weird safari bug https://github.com/riot/route/issues/33
                        setTimeout( function() { addWindowListener( /*autoExec*/ ); }, 1 );
                    }
                };
            }
        }

        _started = true;
    }
}

/**
 * Stop client router service
 */
function stop() {
    if ( _started ) {
        if ( win ) {
            // win.removeEventListener( POPSTATE, _processURL );
            win.removeEventListener( HASHCHANGE, _hashChangeHandler );
    }
    _started = false;
  }
}

/**
 * register router element
 * @param {Element} routerElem route element
 */
function register( routerElem ) {
    if ( _routingUnits.length === 0 ) {
        start();
    }

    _routingUnits.push( routerElem );

    // init current element
    routerElem.processURL( document.URL );
}

/**
 * unregister router element
 * @param {Element} routerElem router element
 */
function unregister( routerElem ) {
    // do nothing
    _routingUnits = _routingUnits.filter( elem => elem !== routerElem );

    if ( _routingUnits.length === 0 ) {
        stop();
    }
}


/**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
export function getPathFromBase( href ) {
  const base = '#';
  return base[0] === '#'
    ? ( href || loc.href || '' ).split( base )[1] || ''
    : ( loc ? getPathFromRoot( href ) : href || '' ).replace( base, '' );
}

/**
 * math url with pre-defined pattern
 * @param {string} pattern pattern as string
 * @param {string} urlParamStr input url
 * @param {object} params param object
 * @returns {boolean} true if url matches
 */
export function matchUrl( pattern, urlParamStr ) {
    // TODO: for now just make it work, blindly say map and return value
    let keys = DEFAULT_PARSER( pattern );
    let values = DEFAULT_PARSER( urlParamStr );
    let res = {};

    for( let n in keys ) {
        let key = keys[n];
        if ( key ) {
            key = key.replace( /^:/, '' );
            let value = values[n];
            res[key] = value;
        }
    }
    return res;
}


export default {
    register,
    unregister
};
