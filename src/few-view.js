/* eslint-env es6 */

import YAML from 'yaml';
import FewViewModel from './few-view-model';
import moduleLoader from './few-module-loader';
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
            // prepare vmInput
            let vmInput = YAML.parse( ymlContent );

            // dependecy injection
            vmInput.moduleLoader = moduleLoader;

            this._vm = new FewViewModel( getViewModel( this ), vmInput );

            return this._vm.createView( vmInput.view );
        } ).then( ( velwElem ) => {
            this.appendChild( velwElem );
        } );
    }
}
customElements.define( FewView.tag, FewView );
