/* eslint-env es6 */

import _ from 'lodash';
import yaml from 'js-yaml';
import FewComponent from './few-component';
import { getComponent, httpGet, parseViewToDiv } from './few-utils';

export default class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
    }

    static get observedAttributes() {
        return [ 'view', 'scope' ];
    }

    get view() {
        return this.getAttribute( 'view' );
    }

    get scope() {
        return this.getAttribute( 'scope' );
    }

    set scope( value ) {
        // do nothing
        // TODO: skip this update or reuse this update in refresh
        // Better not use it if we don't want to tie up with custom element
        this._dummy;
    }

    constructor() {
        super();

        /**
         * view model
         */
        this._component = null;
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'view' && oldValue !== newValue ) {
            try {
                let componentDef = yaml.load( await httpGet( `${newValue}.yml` ) );

                this._component = new FewComponent( getComponent( this ), componentDef, this.scope );

                // View has too be initialized separately since it is async
                let viewElem = await this._component.createView( componentDef.view );

                // TODO: we can try catch and append error text to DOM if we want
                this.appendChild( viewElem );
            } catch ( e ) {
                let codeElem = document.createElement( 'code' );
                codeElem.style.color = 'red';
                codeElem.textContent = e;
                this.appendChild( parseViewToDiv( `<code style="color:red" >${newValue}.yml: ${e}</code>` ) );
            }
        }
    }
}
customElements.define( FewView.tag, FewView );
