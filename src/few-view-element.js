/* eslint-env es6 */

import YAML from 'yaml';
import FewComponent from './few-component';
import http from './http';
import { getComponent, parseViewToDiv } from './few-utils';

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
         * view model
         */
        this._component = null;
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        // console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'src' && newValue && oldValue !== newValue ) {
            this._pendingView = newValue;
            try {
                // clean up
                this.innerHTML = '';

                // TODO: clean up model except attribute defined by parent
                // also need to destroy its ref in parent
                // this._component.model = _.filter( modelPath );
                // this._component.parent.remove(this._component);

                let modelPath = this.getAttribute( 'model' );

                // load component definition
                let componentDef = YAML.parse( await http.get( `${newValue}.yml` ) );

                if ( this._pendingView !== newValue ) {
                    return;
                }

                this._component = new FewComponent( getComponent( this ), componentDef, modelPath );

                // View has too be initialized separately since it is async
                // let viewElem = await this._component.createView( componentDef.view );
                // this.appendChild( viewElem );

                await this._component.createView( componentDef.view );

                if ( this._pendingView !== newValue ) {
                    return;
                }

                this._component.attachViewToPage( this );
                delete this._pendingView;
            } catch ( e ) {
                if ( this._pendingView !== newValue ) {
                    return;
                }
                this.appendChild( parseViewToDiv( `<code style="color:red" >${newValue}.yml: ${e}</code>` ) );
            }
        }
    }
}
customElements.define( FewView.tag, FewView );
