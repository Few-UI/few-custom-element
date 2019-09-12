/* eslint-env es6 */

import mock from './decl-mock';
import DeclViewModel from './decl-view-model';
import { getViewModel } from './decl-utils';

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

        /**
         * view model
         */
        this._vm = null;
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );

        this._vm = new DeclViewModel( getViewModel( this ), mock );

        this.appendChild( this._vm.getViewElement() );
    }
}
customElements.define( DeclView.tag, DeclView );
