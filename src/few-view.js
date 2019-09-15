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

    async attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );

        let vmInput = YAML.parse( await httpGet( `sample/${newValue}View.yml` ) );

        // dependecy injection
        vmInput.moduleLoader = moduleLoader;
        vmInput.methodNamespaces = [ 'method' ];

        this._vm = new FewViewModel( getViewModel( this ), vmInput );

        this.appendChild( await this._vm.createView( vmInput.view ) );
    }
}
customElements.define( FewView.tag, FewView );
