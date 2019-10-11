/* eslint-env es6 */

define( [], () => {
    class FewButton extends HTMLElement {
        static get tag() {
            return 'sample-button';
        }

        get clickAction() {
            return this.getAttribute( 'click' );
        }

        constructor() {
            super();

            const shadowRoot = this.shadowRoot || this.attachShadow( { mode: 'open' } );

            // Apply style to shadow DOM
            // let style = document.createElement( 'style' );
            // style.textContent = buttonCss;
            // shadowRoot.appendChild( style );


            shadowRoot.innerHTML = '<button class="base-button" ><slot/></button>';

            /*
            let newDom = document.createElement( 'div' );
            newDom.innerHTML = '<button class="base-button" ><slot/></button>';
            shadowRoot.appendChild( newDom.firstChild );
            */
        }

        /*
        Cannot do it here - need to load context from parent
        attributeChangedCallback( name, oldValue, newValue ) {
            console.log( `${name}: ${oldValue} => ${newValue}` );
        }
        */
    }
    customElements.define( FewButton.tag, FewButton );
} );
