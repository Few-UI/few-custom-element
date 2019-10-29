// Import the LitElement base class and html helper function

// workaround for stealJS loading
// import { LitElement, html } from 'lit-element';
import { html } from 'lit-html';
import { LitElement } from 'lit-element';

import './lit-todo-form';
import './lit-todo-table';

// Extend the LitElement base class
class TodoLitElement extends LitElement {
    // properties getter
    // - It defines a basic watcher by 'a === b'.
    // - It could bind with attribute change with exact same attribue,
    //   on current element(not inside template), which is all in lower-case
    // - You can do further customization by other interface
    static get properties() {
        return {
            items: { type: Array }
        };
    }

    constructor() {
        super();
        this.items = [
        ];
    }

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
          <lit-todo-form @event-add-todo="${this.addTodo}">
            <button>Test</button>
          </lit-todo-form>
          <lit-todo-table .items=${this.items}></lit-todo-table>
        `;
    }

    addTodo( e ) {
        // 'prop' watcher uses 'a === b', so here need to use immutable logic
        // (concat), instead of mutation (push).
        // this.items.push( e.detail );
        this.items = this.items.concat( [ e.detail ] );
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
customElements.define( 'lit-todo', TodoLitElement );
