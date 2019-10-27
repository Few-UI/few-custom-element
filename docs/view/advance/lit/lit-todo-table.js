// Import the LitElement base class and html helper function

// workaround for stealJS loading
// import { LitElement, html } from 'lit-element';
import { html } from 'lit-html';
import { LitElement } from 'lit-element';

// Extend the LitElement base class
class MyElement extends LitElement {
    constructor() {
        super();
        this.items = [
            {
                item_desc: 'Apple',
                item_status: 'Done'
            },
            {
                item_desc: 'Banana',
                item_status: 'Done'
            }
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
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.items.map( item => html `
              <tr>
                <td>${item.item_desc}</td>
                <td>${item.item_status}</td>
              </tr>
              ` )}
            </tbody>
          </table>
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
customElements.define( 'lit-todo-table', MyElement );
