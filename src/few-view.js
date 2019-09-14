/* eslint-env es6 */

import YAML from 'yaml';
import FewViewModel from './few-view-model';
import { getViewModel, httpGet } from './few-utils';

export class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
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
                this._vm = new FewViewModel( getViewModel( this ), YAML.parse( ymlContent ) );

                this.appendChild( this._vm.getViewElement() );
            } );
    }
}
customElements.define( FewView.tag, FewView );
