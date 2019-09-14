/* eslint-env es6 */

//import buttonCss from './button.scss';
import { parseView2, getViewModel } from './few-utils';

export class FewButton extends HTMLElement {
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
        shadowRoot.appendChild( parseView2( '<button class="base-button" ><slot/></button>' ).firstChild );
    }

    doAction() {
        return ( e ) => {
            let vm = getViewModel( this );
            vm.evalMethod( this.clickAction );
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
