/* eslint-env es6 */
import few from './few-global';
import {
    parseView,
    getComponent
} from './few-utils';


export default class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    set model( value ) {
        let component = getComponent( this );
        if ( !component ) {
            // TODO: Can be optimize to avoid duplicate refresh
            return this._renderPromise.then( ( component ) => {
                component.updateModel( value );
            } );
        }

        // Normal update case
        return component.updateModel( value, false );
    }

    constructor() {
        super();

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
                let ctxPath = this.getAttribute( 'ctx' );
                let ctxMap = ctxPath ? { ctx: ctxPath } : null;

                this._renderPromise = few.render( `${newValue}.yml`, this, ctxMap );

                // await here is required
                await this._renderPromise;
            } catch ( e ) {
                if ( this._currentView === newValue ) {
                    this.appendChild( parseView( `<code style="color:red" >${newValue}.yml: ${e}</code>` ) );
                }
                throw e;
            }
        } else if ( name === 'model' && newValue && oldValue !== newValue ) {
            // console.log( `model: ${oldValue} => ${newValue}` );
        }
    }
}
customElements.define( FewView.tag, FewView );
