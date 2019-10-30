import http from './http';
import few from './few-global';
import router from './few-router';
import FewComponent from './few-component';
import { getComponent, setComponent } from './few-utils';
import set from 'lodash/set';


const RE_ORIGIN = /^.+?\/\/+[^/]+/;
const win = typeof window !== 'undefined' && window;
const hist = win && history;
const loc = win && ( hist.location || win.location ); // see html5-history-api

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
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
function getPathFromBase( href ) {
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
function matchUrl( pattern, urlParamStr, params ) {
    // TODO: for now just make it work, blindly say map and return value
    let keys = DEFAULT_PARSER( pattern );
    let values = DEFAULT_PARSER( urlParamStr );

    for( let n in keys ) {
        let key = keys[n];
        if ( key ) {
            key = key.replace( /^:/, '' );
            let value = values[n];
            set( params, key, value );
        }
    }

    return true;
}

/**
 * math url with pre-defined pattern
 * @param {string} pattern pattern as string
 * @param {string} urlParamStr input url
 * @param {object} params param object
 * @returns {boolean} true if url matches
 */
function matchUrl2( pattern, urlParamStr ) {
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


/**
 * load JSON config
 * @param {string} configPath path for JSON configuration
 * @returns {Promise} promise with configuratino JSON object
 */
async function loadConfig( configPath ) {
    return JSON.parse( await http.get( configPath ) );
}

export default class FewRoute extends HTMLElement {
    static get tag() {
        return 'few-route';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    constructor() {
        super();

        this._routeConfigPromise = null;

        this._currState = null;
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        // console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'src' && newValue && oldValue !== newValue ) {
            // load router config
            this._routeConfigPromise = loadConfig( `${newValue}.json` );
        }
    }

    connectedCallback() {
        router.register( this );
    }

    disconnectedCallback() {
        router.unregister( this );
    }

    async processURL( url ) {
        let states = await this._routeConfigPromise;
        if ( states && states.length > 0 ) {
            // let urlStruct = DEFAULT_PARSER( getPathFromBase( url ) );
            let urlParamStr = getPathFromBase( url );
            if( !urlParamStr ) {
                this._currState = states[0];
                this._component = await few.render( `${this._currState.view}.yml`, this );
            } else {
                let state = null;
                let params = {};

                // match state
                for( let key in states ) {
                    let st = states[key];
                    params = matchUrl2( st.url, urlParamStr );
                    if( params ) {
                        state = st;
                        break;
                    }
                }

                // process state
                if ( state ) {
                    if ( this._currState === state ) {
                        let model = this._component._vm.model;
                        for( let key in params ) {
                            set( model, key, params[key] );
                        }
                        this._component.updateView();
                    } else {
                        let model = {};
                        for( let key in params ) {
                            set( model, key, params[key] );
                        }
                        this._currState = state;
                        this._component = await few.render( `${state.view}.yml`, this, model );
                    }
                }
            }
        }
    }
}
customElements.define( FewRoute.tag, FewRoute );
