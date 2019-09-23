/* eslint-env es6 */

export default class FewBridge extends HTMLElement {
    static isBridge( elem ) {
        if ( elem ) {
            if ( elem.nodeType === Node.TEXT_NODE ) {
                elem = elem.parentElement;
            }
            return elem.closest( '.few-bridge' );
        }
    }

    static hasBridgeClass( elem ) {
        return elem && elem.classList && elem.classList.contains( 'few-bridge' );
    }

    static get tag() {
        return 'few-bridge';
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow( { mode: 'open' } );
        shadowRoot.appendChild( document.createElement( 'slot' ) );

        this.classList.add( 'few-bridge' );
    }
}

// test code, will comment out later
customElements.define( FewBridge.tag, FewBridge );
