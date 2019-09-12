/* eslint-env es6 */

//import buttonCss from './button.scss';
import { createElementFromHtmlString, getViewModel } from './decl-utils';

export class DeclButton extends HTMLElement {
    static get tag() {
        return 'decl-button';
    }

    get size() {
        return this.getAttribute( 'size' );
    }

    get action() {
        return this.getAttribute( 'action' );
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow( { mode: 'open' } );

        // Apply style to shadow DOM
        // let style = document.createElement( 'style' );
        // style.textContent = buttonCss;
        // shadowRoot.appendChild( style );

        //let newDom = document.createElement( 'div' );
        shadowRoot.appendChild( createElementFromHtmlString( `<button class="base-button${ this.size === 'auto' ? ' size-auto' : '' }" ><slot/></button>` ) );
    }

    doAction() {
        return ( e ) => {
            console.log( `${this.action} executed!` );
        };
    }

    // https://stackoverflow.com/questions/43836886/failed-to-construct-customelement-error-when-javascript-file-is-placed-in-head
    connectedCallback() {
        this.onclick = this.doAction();
        let vm = getViewModel( this );
    }

    /*
    Cannot do it here - need to load context from parent
    attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );
    }
    */
}
customElements.define( DeclButton.tag, DeclButton );
