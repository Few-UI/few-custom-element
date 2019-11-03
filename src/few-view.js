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

    async attributeChangedCallback( name, oldValue, newValue ) {
        if ( name === 'src' && newValue && oldValue !== newValue ) {
            this._currentView = newValue;

            try {
                // TODO: clean up model except attribute defined by parent
                // also need to destroy its ref in parent
                // this._component.model = _.filter( modelPath );
                // this._component.parent.remove(this._component);
                let modelPath = this.getAttribute( 'model' );

                await few.render( `${newValue}.yml`, this, modelPath );
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
