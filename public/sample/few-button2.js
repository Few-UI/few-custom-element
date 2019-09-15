/* eslint-env es6 */

define( [], () => {
class FewButton extends HTMLElement {
    static get tag() {
        return 'few-button2';
    }

    get clickAction() {
        return this.getAttribute( 'click' );
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow( { mode: 'open' } );

        // Apply style to shadow DOM
        // let style = document.createElement( 'style' );
        // style.textContent = buttonCss;
        // shadowRoot.appendChild( style );

        //let newDom = document.createElement( 'div' );
        shadowRoot.innerHTML = '<button class="base-button" ><slot/></button>';
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
