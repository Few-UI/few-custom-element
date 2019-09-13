/* eslint-env es6 */

export default class DeclBridge extends HTMLElement {
    static isBridge( elem ) {
        if ( elem ) {
            if ( elem.nodeType === Node.TEXT_NODE ) {
                elem = elem.parentElement;
            }
            return elem.closest( '.decl-bridge' );
        }
    }

    static get tag() {
        return 'decl-bridge';
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow( { mode: 'open' } );
        shadowRoot.appendChild( document.createElement( 'slot' ) );

        this.classList.add( 'decl-bridge' );
    }
}

// test code, will comment out later
customElements.define( DeclBridge.tag, DeclBridge );
