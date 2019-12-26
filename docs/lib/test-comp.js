/* eslint-env es6 */

define( [ 'lib/test-button' ], () => {
    class TestComp extends HTMLElement {
        static get tag() {
            return 'test-comp';
        }

        static get observedAttributes() {
            return [ 'height', 'width' ];
        }

        constructor() {
            super();

            this.innerHTML = '<test-button></test-button>';

            this._ref = this.firstChild;
        }

        async attributeChangedCallback( name, oldValue, newValue ) {
            let height = this.getAttribute( 'height' );
            let width = this.getAttribute( 'width' );
            this._ref.sattr = {
                height,
                width
            };
        }
    }
    customElements.define( TestComp.tag, TestComp );
} );
