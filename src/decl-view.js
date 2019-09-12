/* eslint-env es6 */

import mock from './decl-mock';
import DeclViewModel from './decl-view-model';
import { createView, setViewModel, getViewModel } from './decl-utils';

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

        /**
         * view model
         */
        this._vm = null;
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );

        let vm = new DeclViewModel( getViewModel( this ), mock.viewModel );
        setViewModel( this, vm );

        this._view = createView( mock.view );

        this._view.updateView( vm );

        this.appendChild( this._view.reference );
    }
}
customElements.define( DeclView.tag, DeclView );
