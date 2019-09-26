/* eslint-env es6 */
/* global few */

//import buttonCss from './button.scss';
import { parseViewToDiv } from './few-utils';

export default class FewButton extends HTMLElement {
    static get tag() {
        return 'few-button';
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
        shadowRoot.appendChild( parseViewToDiv( '<button class="base-button" ><slot/></button>' ).firstChild );
    }

    doAction() {
        return ( e ) => {
            few.handleEvent( this.action );
        };
    }

    // https://stackoverflow.com/questions/43836886/failed-to-construct-customelement-error-when-javascript-file-is-placed-in-head
    connectedCallback() {
        this.onclick = this.doAction();
    }

    /*
    Cannot do it here - need to load context from parent
    attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );
    }
    */
}
customElements.define( FewButton.tag, FewButton );
