/* eslint-env es6 */

import mock from './declMock';
import { createView, setDataModel } from './declUtils';

export class DeclView extends HTMLElement {
    static get tag() {
        return 'decl-view';
    }

    static get observedAttributes() {
        return [ 'name' ];
    }

    get name() {
        return this.getAttribute( 'name' );
    }

    constructor() {
        super();
        // const shadowRoot = this.attachShadow( { mode: 'open' } );
    }

    doAction() {
        return ( e ) => {
            console.log( `${this.name} executed!` );
        };
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );

        this.appendChild( createView( mock.view, mock.data ) );
        setDataModel( this, mock.data );
    }
}
customElements.define( DeclView.tag, DeclView );
