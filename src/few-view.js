/* eslint-env es6 */

import YAML from 'yaml';
import FewComponent from './few-component';
import { getViewModel, httpGet } from './few-utils';

export class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
    }

    static get observedAttributes() {
        return [ 'view' ];
    }

    get view() {
        return this.getAttribute( 'view' );
    }

    constructor() {
        super();

        /**
         * view model
         */
        this._vm = null;
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        // console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'view' && oldValue !== newValue ) {
            let vmInput = YAML.parse( await httpGet( `${newValue}.yml` ) );

            this._vm = new FewComponent( getViewModel( this ), vmInput );
            // console.log( `view generated for ${newValue}`);

            this.appendChild( await this._vm.createView( vmInput.view ) );
        }
    }
}
customElements.define( FewView.tag, FewView );
