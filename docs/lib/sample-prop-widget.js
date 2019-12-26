/* eslint-env es6 */

define( [], () => {
    class TestButton extends HTMLElement {
        static get tag() {
            return 'sample-prop-widget';
        }

        get ['sample-prop']() {
            return this._sattr;
        }

        set ['sample-prop']( val ) {
            this._sattr = val;
            // sample code to update view
            this.textContent = JSON.stringify( this._sattr );
        }

        constructor() {
            super();

            this.textContent = 'undefined';
        }

        /*
        Cannot do it here - need to load context from parent
        attributeChangedCallback( name, oldValue, newValue ) {
            console.log( `${name}: ${oldValue} => ${newValue}` );
        }
        */
    }
    customElements.define( TestButton.tag, TestButton );
} );
