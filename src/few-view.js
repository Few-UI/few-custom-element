/* eslint-env es6 */

import _ from 'lodash';
import yaml from 'js-yaml';
import FewComponent from './few-component';
import { getComponent, httpGet, evalExpression } from './few-utils';

export class FewView extends HTMLElement {
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
            let componentDef = yaml.load( await httpGet( `${newValue}.yml` ) );

            this._component = new FewComponent( getComponent( this ), componentDef );

            if ( this.scope ) {
                this._component.initScope( this.scope );
            }
            // console.log( `view generated for ${newValue}`);

            let viewElem = await this._component.createView( componentDef.view );

            this.appendChild( viewElem );
        }
    }
}
customElements.define( FewView.tag, FewView );
