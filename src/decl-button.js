/* eslint-env es6 */

//import buttonCss from './button.scss';
import { createElementFromHtmlString, getViewModel, evalMethod } from './decl-utils';

export class DeclButton extends HTMLElement {
    static get tag() {
        return 'decl-button';
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
        shadowRoot.appendChild( createElementFromHtmlString( '<button class="base-button" ><slot/></button>' ) );
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
customElements.define( DeclButton.tag, DeclButton );