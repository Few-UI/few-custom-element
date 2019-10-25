/* eslint-env es6 */

define( [
          '//cdn.jsdelivr.net/npm/vue/dist/vue.js',
          'lib/httpVueLoader.js'
        ], ( Vue, httpVueLoader ) => {
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

                let opts = {
                    el: this._docElem,
                    template: `<${componentName}></${componentName}>`,
                    components: {},
                    data: {
                        message: 'Hello Vue!'
                    }
                };

                opts.components[componentName] = httpVueLoader( `${path}.vue` );

                var app = new Vue( opts );
            }
        }
    }


    customElements.define( VueView.tag, VueView );
} );
