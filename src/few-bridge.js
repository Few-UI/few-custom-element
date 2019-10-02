/* eslint-env es6 */

export default class FewBridge extends HTMLElement {
    static get tag() {
        return 'few-bridge';
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow( { mode: 'open' } );
        shadowRoot.appendChild( document.createElement( 'slot' ) );

        this.classList.add( 'few-scope' );
    }
}

// test code, will comment out later
customElements.define( FewBridge.tag, FewBridge );
