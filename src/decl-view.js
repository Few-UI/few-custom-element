/* eslint-env es6 */

import YAML from 'yaml';
import DeclViewModel from './decl-view-model';
import { getViewModel, httpGet } from './decl-utils';

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
            httpGet( `sample/${newValue}View.yml` ).then( ( ymlContent ) => {
                this._vm = new DeclViewModel( getViewModel( this ), YAML.parse( ymlContent ) );

                this.appendChild( this._vm.getViewElement() );
            } );
    }
}
customElements.define( DeclView.tag, DeclView );
