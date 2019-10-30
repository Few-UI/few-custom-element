import http from './http';
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

        // let urlStruct = DEFAULT_PARSER( getPathFromBase( url ) );
        let urlParamStr = getPathFromBase( url );

        for( let key in states ) {
            let state = states[key];
            if( !urlParamStr && key === '0' ) {
                let componentDef = {
                    model: {
                        data: {}
                    }
                };

                let component = new FewComponent( null, componentDef );
                setComponent( this, component );

                this.innerHTML = `<few-view src="${state.view}" model="data"></few-view>`;

                this._currState = state;
                break;
            } else if ( this._currState === state ) {
                let component = getComponent( this );
                if ( matchUrl( state.url, urlParamStr, component._vm.model.data ) ) {
                    component.updateView();
                    break;
                }
            } else {
                let params = {};
                if( matchUrl( state.url, urlParamStr, params ) ) {
                    // matching, process and break
                    // TODO: fake component
                    let componentDef = {
                        model: {
                            data: params
                        }
                    };

                    let component = new FewComponent();

                    component.loadComponentDef( componentDef );

                    setComponent( this, component );

                    this.innerHTML = `<few-view src="${state.view}" model="data"></few-view>`;

                    this._currState = state;
                    break;
                }
            }
        }
    }
}
customElements.define( FewRoute.tag, FewRoute );
