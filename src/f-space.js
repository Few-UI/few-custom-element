import http from './http';
import router from './few-router';
import FewComponent from './few-component';
import { setComponent } from './few-utils';
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
 * @returns {object} pramter structure
 */
function matchUrl( pattern, urlParamStr ) {
    // TODO: for now just make it work, blindly say map and return value
    let res = {};
    let keys = DEFAULT_PARSER( pattern );
    let values = DEFAULT_PARSER( urlParamStr );

    for( let n in keys ) {
        let key = keys[n];
        if ( key ) {
            key = key.replace( /^:/, '' );
            let value = values[n];
            set( res, key, value );
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

export default class FewSpace extends HTMLElement {
    static get tag() {
        return 'f-space';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    constructor() {
        super();

        this._routeConfigPromise = null;
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

        // let urlStruct = DEFAULT_PARSER( getPathFromBase( url ) );
        let urlParamStr = getPathFromBase( url );

        for( let key in states ) {
            let state = states[key];
            let params = matchUrl( state.url, urlParamStr );
            if( params ) {
                // matching, process and break
                // TODO: fake component
                let componentDef = {
                    model: {
                        data: params
                    }
                };


                let component = new FewComponent( null, componentDef );
                setComponent( this, component );

                this.innerHTML = `<f-view src="${state.view}" model="data"></f-view>`;
                break;
            }
        }
    }
}
customElements.define( FewSpace.tag, FewSpace );
