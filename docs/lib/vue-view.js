/* eslint-env es6 */

/*define( [
          '//cdn.jsdelivr.net/npm/vue/dist/vue.js',
          'lib/httpVueLoader'
        ], ( Vue, httpVueLoader ) => {*/

import Vue from 'https://cdn.jsdelivr.net/npm/vue/dist/vue.esm.browser.js';
import httpVueLoader from 'lib/httpVueLoader';
    class VueView extends HTMLElement {
        static get tag() {
            return 'vue-view';
        }

        static get observedAttributes() {
            return [ 'src' ];
        }

        constructor() {
            super();

            let shadowRoot = this.shadowRoot || this.attachShadow( { mode: 'open' } );
            this._docElem = document.createElement( 'div' );
            shadowRoot.appendChild( this._docElem );
        }

        attributeChangedCallback( name, oldValue, newValue ) {
            // console.log( `${name}: ${oldValue} => ${newValue}` );

            if ( name === 'src' && newValue && oldValue !== newValue ) {
                // parse component name
                let path = newValue;
                let match = path.match( /\/(\S+)$/ );
                let componentName = match ? match[1] : path;
                // httpVueLoader.register( Vue, `${path}.vue` );
                let component = httpVueLoader( `${path}.vue` );

                let opts = {
                    el: this._docElem,
                    template: `<${componentName}></${componentName}>`,
                    components: {}
                };


                /*
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

                var app = new Vue( opts );
            }
        }
    }


    customElements.define( VueView.tag, VueView );
// } );
