/* eslint-env es6 */

import yaml from 'js-yaml';
import FewComponent from './few-component';
import http from './http';
import {
    evalExpression,
    getComponent,
    parseView
} from './few-utils';


export default class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
    }

    static get observedAttributes() {
        return [ 'src', 'model' ];
    }

    get baseUrl() {
        if ( /\//.test( this._currentView ) ) {
            return this._currentView.replace( /\/[^/]+$/, '' );
        }
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

    async attributeChangedCallback( name, oldValue, newValue ) {
        if ( name === 'src' && newValue && oldValue !== newValue ) {
            this._currentView = newValue;

            try {
                // TODO: clean up model except attribute defined by parent
                // also need to destroy its ref in parent
                // this._component.model = _.filter( modelPath );
                // this._component.parent.remove(this._component);

                // NOTE: THIS HAS TO BE HERE BEFORE 1ST AWAIT. BE CAREFUL OF AWAIT
                let parentComponent = getComponent( this );

                let modelPath = this.getAttribute( 'model' );

                // load component definition
                let componentDef = yaml.safeLoad( await http.get( `${newValue}.yml` ) );

                if ( this._currentView !== newValue ) {
                    return;
                }

                // load from parent
                let model;
                if ( parentComponent && modelPath ) {
                    model = evalExpression( modelPath, parentComponent._vm.model );
                }

                // Create component and call init definition
                this._component = new FewComponent( componentDef, parentComponent,  model );

                await this._component.render( componentDef.view, this, this.baseUrl );
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
