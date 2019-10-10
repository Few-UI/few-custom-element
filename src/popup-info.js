/* eslint-env es6 */
// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements

// Create a class for the element
class PopUpInfo extends HTMLElement {
    get msg() {
        return this.getAttribute( 'msg' );
    }

    constructor() {
        // Always call super first in constructor
        super();

        // Create a shadow root
        const shadow = this.attachShadow( { mode: 'open' } );

        // Create spans
        const wrapper = document.createElement( 'span' );
        wrapper.setAttribute( 'class', 'wrapper' );

        const mainDom = document.createElement( 'code' );
        mainDom.classList.add( 'few-popup' );
        mainDom.appendChild( document.createElement( 'slot' ) );

        const info = document.createElement( 'span' );
        info.setAttribute( 'class', 'info' );

        // Take attribute content and put it inside the info span
        // NOTE: without polyfill do it here is useless, not getting the attribute here
        let msg = this.getAttribute( 'msg' );
        // msg = this.msg;
        info.textContent = msg;
        this.__info = info;

        // Create some CSS to apply to the shadow dom
        const style = document.createElement( 'style' );

        style.textContent = `
            .wrapper {
                position: relative;
            }
            .info {
                font-size: 0.8rem;
                width: 200px;
                display: inline-block;
                border: 1px solid black;
                padding: 10px;
                background: white;
                border-radius: 10px;
                opacity: 0;
                transition: 0.6s all;
                position: absolute;
                bottom: 20px;
                left: 10px;
                z-index: 3;
            }
            img {
                width: 1.2rem;
            }
            .few-popup:hover + .info, .few-popup:focus + .info {
                opacity: 1;
            }
        `;

        // wrapper
        wrapper.appendChild( mainDom );
        wrapper.appendChild( info );

        // Attach the created elements to the shadow dom
        shadow.appendChild( style );
        shadow.appendChild( wrapper );
    }

    connectedCallback() {
        this.__info.textContent = this.getAttribute( 'msg' );
    }
}

// Define the new element
customElements.define( 'popup-info', PopUpInfo );
