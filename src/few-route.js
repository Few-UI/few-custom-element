/* eslint-env es6 */
import FewRouter from './few-router';

export default class FewRoute extends HTMLElement {
    static get tag() {
        return 'few-route';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    constructor() {
        super();

        this._router = new FewRouter( this );
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        // console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'src' && newValue && oldValue !== newValue ) {
            // load router config
            this._router.loadConfig( newValue );
        }
    }

    connectedCallback() {
        this._router.enable();
    }

    disconnectedCallback() {
        this._router.disable();
    }
}
customElements.define( FewRoute.tag, FewRoute );
