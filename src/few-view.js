/* eslint-env es6 */
import few from './few-global';
import {
    parseView
} from './few-utils';


export default class FewView extends HTMLElement {
    static get tag() {
        return 'few-view';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    set model( value ) {
        if ( !this._component ) {
            // TODO: Can be optimize to avoid duplicate refresh
            return this._renderPromise.then( ( component ) => {
                component.updateModel( value );
            } );
        }

        // Normal update case
        return this._component.updateModel( value, false );
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
                let ctxPath = this.getAttribute( 'ctx' );
                let ctxMap = ctxPath ? { ctx: ctxPath } : null;

                this._renderPromise = few.render( `${newValue}.yml`, this, ctxMap );
                this._component = await this._renderPromise;
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
