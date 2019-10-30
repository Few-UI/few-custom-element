/* eslint-env es6 */

import yaml from 'js-yaml';
import FewComponent from './few-component';
import fewViewFactory from './few-view-factory';
import http from './http';
import { getComponent, parseView } from './few-utils';


export default class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
    }

    static get observedAttributes() {
        return [ 'src', 'model' ];
    }

    constructor() {
        super();

        /**
         * component
         */
        this._component = null;

        /**
         * view path
         */
        this._currentView = null;
    }

    getViewPath() {
        if ( /\//.test( this._currentView ) ) {
            return this._currentView.replace( /\/[^/]+$/, '' );
        }
    }


    async attributeChangedCallback( name, oldValue, newValue ) {
        if ( name === 'src' && newValue && oldValue !== newValue ) {
            this._currentView = newValue;

            try {
                // TODO: clean up model except attribute defined by parent
                // also need to destroy its ref in parent
                // this._component.model = _.filter( modelPath );
                // this._component.parent.remove(this._component);

                let modelPath = this.getAttribute( 'model' );

                // load component definition
                let componentDef = yaml.safeLoad( await http.get( `${newValue}.yml` ) );

                if ( this._currentView !== newValue ) {
                    return;
                }

                // Create component and call init definition
                this._component = new FewComponent( getComponent( this ), componentDef, modelPath );

                await this._component.init();

                if ( this._currentView !== newValue ) {
                    return;
                }

                // compile view
                let unit = await fewViewFactory.createView( componentDef.view,
                    this._component._strTplParser, this.getViewPath() );
                this._component.setView( unit );

                if ( this._currentView !== newValue ) {
                    return;
                }

                // attach to page
                this._component.attachViewToPage( this );
            } catch ( e ) {
                if ( this._currentView === newValue ) {
                    this.appendChild( parseView( `<code style="color:red" >${newValue}.yml: ${e}</code>` ) );
                }
                throw e;
            }
        }
    }
}
customElements.define( FewView.tag, FewView );
