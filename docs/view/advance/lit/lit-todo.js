// Import the LitElement base class and html helper function

// workaround for stealJS loading
// import { LitElement, html } from 'lit-element';
import './lit-todo-table';
import { html } from 'lit-html';
import { LitElement } from 'lit-element';

// Extend the LitElement base class
class MyElement extends LitElement {
    /**
     * Implement `render` to define a template for your element.
     *
     * You must provide an implementation of `render` for any element
     * that uses LitElement as a base class.
     * @returns {function} render template
     */
    render() {
        /**
         * `render` must return a lit-html `TemplateResult`.
         *
         * To create a `TemplateResult`, tag a JavaScript template literal
         * with the `html` helper function:
         */
        this.dummy;
        return html `
          <h2>Lit Todo</h2>
          <lit-todo-table></lit-todo-table>
        `;
    }

    // AFX: Trick to not use shadow-dom for getting CSS Effect for now.
    // https://github.com/Polymer/lit-element/issues/42
    // Long-term solution should be use shadow-dom.
    // Note: non-shadow dom doesn't support slot/transclude
    // https://github.com/Polymer/lit-element/issues/553
    createRenderRoot() {
        return this;
    }
}
// Register the new element with the browser.
customElements.define( 'lit-todo', MyElement );
