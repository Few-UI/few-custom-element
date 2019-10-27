/* eslint-env es6 */
/*
 global
 System
 */
import React from '//cdn.jsdelivr.net/npm/react@16.11.0/umd/react.development';
import ReactDOM from '//cdn.jsdelivr.net/npm/react-dom@16.11.0/umd/react-dom.development';

class JsxView extends HTMLElement {
    static get tag() {
        return 'jsx-view';
    }

    static get observedAttributes() {
        return [ 'src' ];
    }

    constructor() {
        super();

        /*
        let elem = document.createElement( 'div' );
        let shadowRoot = this.shadowRoot || this.attachShadow( { mode: 'open' } );
        shadowRoot.appendChild( elem );
        this._docElem = elem;
        */
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        if ( name === 'src' && newValue && oldValue !== newValue ) {
        // NOTE: This makes current component only available with stealJS
        System.import( 'view/advance/jsx/todo.jsx' ).then( ( JsxView ) => {
            ReactDOM.render(
              React.createElement( JsxView.default, null ),
              this
            );
        } );
        }
    }
}
customElements.define( JsxView.tag, JsxView );

