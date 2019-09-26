/* eslint-env es6 */

import _ from 'lodash';
import yaml from 'js-yaml';
import FewComponent from './few-component';
import { getComponent, httpGet } from './few-utils';

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
        // this.setAttribute( 'scope', value );

        if( this._vm && !_.isEqual( this._scope, value ) ) {
            this._vm.setScope( this._scope );
            this._vm.updateView();
        }
        this._scope = value;
    }

    constructor() {
        super();

        /**
         * view model
         */
        this._vm = null;

        /**
         * temp scope
         */
        this._scope = null;
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        // console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'view' && oldValue !== newValue ) {
            let componentDef = yaml.load( await httpGet( `${newValue}.yml` ) );

            this._vm = new FewComponent( getComponent( this ), componentDef );
            this._vm.setScope( this._scope );
            // console.log( `view generated for ${newValue}`);

            this.appendChild( await this._vm.createView( componentDef.view ) );

            this.firstChild.addEventListener( 'fewupdate', ( e ) => {
                // console.log( `${e.detail.id} => ${e.detail.value}` );
                this._vm.update( e.detail.id, e.detail.value );
            } );
        }
    }
}
customElements.define( FewView.tag, FewView );
