/* eslint-env es6 */

import Vue from '//cdn.jsdelivr.net/npm/vue/dist/vue.esm.browser';
import httpVueLoader from '//cdn.jsdelivr.net/npm/http-vue-loader@1.4.1/src/httpVueLoader.min';
class VueView extends HTMLElement {
    static get tag() {
        return 'vue-view';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    constructor() {
        super();

        let elem = document.createElement( 'div' );
        let shadowRoot = this.shadowRoot || this.attachShadow( { mode: 'open' } );
        shadowRoot.appendChild( elem );
        this._docElem = elem;
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        if ( name === 'src' && newValue && oldValue !== newValue ) {
            // parse component name
            let path = newValue;
            let match = path.match( /\/(\S+)$/ );
            let componentName = match ? match[1] : path;
            let component = httpVueLoader( `${path}.vue` );

            let opts = {
                el: this._docElem,
                template: `<${componentName}></${componentName}>`,
                components: {}
            };

            /*
            TODO: to support import and JS we can enhance this later
            httpVueLoader.langProcessor.esm = function( scriptText ) {
                return scriptText;
            };
            */

            let defaultHttpVueLoaderRequire = httpVueLoader.require;
            httpVueLoader.require = function( str ) {
                if ( /\.vue$/.test( str ) ) {
                    return httpVueLoader( str );
                }
                return defaultHttpVueLoaderRequire.apply( httpVueLoader, [ str ] );
            };

            opts.components[componentName] = component;

            new Vue( opts );
        }
    }
}
customElements.define( VueView.tag, VueView );
