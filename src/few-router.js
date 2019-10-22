/* eslint-env es6 */
// https://github.com/riot/route/blob/master/src/index.js

let _started = false;

let win = typeof window !== 'undefined' && window;

const POPSTATE = 'popState';
const HASHCHANGE = 'hashchange';

let _routingUnits = [];

/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
function _start() {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onpopstate
    // Not support history for now
    /*
    win.addEventListener( 'popState', () => {
        console.log( 'win.popState!' );
    } );
    */

    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onhashchange
    win.addEventListener( 'hashchange', _hashChangeHandler );

    console.log( `router started with ${document.URL}` );
}

/**
 * internal handler for hashchange event
 * @param {Event} e hash change event
 */
function _hashChangeHandler( e ) {
    for( let unit in _routingUnits ) {
        _routingUnits[unit].processURL( e.newURL );
    }
    console.log( `win.hashchange! ${e.oldURL} => ${e.newURL}` );
}

/**
 * register router element
 * @param {Element} routerElem route element
 */
export function register( routerElem ) {
    _routingUnits.push( routerElem );

    // init current element
    routerElem.processURL( document.URL );
}

/**
 * unregister router element
 * @param {Element} routerElem
 */
export function unregister( routerElem ) {
    // do nothing
    _routingUnits = _routingUnits.filter( elem => elem !== routerElem );
}

/**
 * Start client router service
 */
export function start() {
    if ( !_started ) {
        if ( win ) {
            if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
                _start( /*autoExec*/ );
            } else {
                document.onreadystatechange = function() {
                    if ( document.readyState === 'interactive' ) {
                        // the timeout is needed to solve
                        // a weird safari bug https://github.com/riot/route/issues/33
                        setTimeout( function() { _start( /*autoExec*/ ); }, 1 );
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
export function stop() {
    if ( _started ) {
        if ( win ) {
            // win.removeEventListener( POPSTATE, _processURL );
            win.removeEventListener( HASHCHANGE, _hashChangeHandler );
    }
    _started = false;
  }
}

start();

export default {
    start,
    stop,
    register,
    unregister
};
