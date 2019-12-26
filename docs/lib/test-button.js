/* eslint-env es6 */

define( [], () => {
    class TestButton extends HTMLElement {
        static get tag() {
            return 'test-button';
        }

        get sattr() {
            return this._sattr;
        }

        set sattr( val ) {
            this._sattr = JSON.stringify( val );
            this.textContent = this._sattr;
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
