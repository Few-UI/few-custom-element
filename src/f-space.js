import http from './http';
import router from './few-router';

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
        let config = await this._routeConfigPromise;
        console.log( `f-space: processing ${url} with ${JSON.stringify( config )}` );
    }
}
customElements.define( FewSpace.tag, FewSpace );
