// Import the LitElement base class and html helper function

// workaround for stealJS loading
// import { LitElement, html } from 'lit-element';
import {  html } from 'lit-html';
import { LitElement } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';

// Extend the LitElement base class
class TodoFormLitElement extends LitElement {
    // properties getter
    /*
    NOTE: This is not necessary in simple case
    static get properties() {
        return {
            item_desc: { type: String, reflect: true },
            item_status: { type: String, reflect: true }
        };
    }
    */

    /*
    NOTE: css only work under shadow dom mode
    static get styles() {
        return css `
            ::slotted(button) {
                background-color: #ff4470;
                border-color: #ff4470;
            }
        `;
    }
    */

    constructor() {
        super();
        this.item_desc = '';
        this.item_status = 'Pending';

        // This is similar with react
        this.styles = {
            backgroundColor: '#ff4470',
            borderColor: '#ff4470'
        };
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
        return html `
          <form @submit="${this.submitInfo}">
            <label for="item">Todo:</label>
            <input id="item" type="text" value="${this.item_desc}" @change="${this.handleItemDescChange}" />
            <label for="status">Status:</label>
            <select id="status" value="${this.item_status}" @change="${this.handleItemStatusChange}">
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="In Progress">In Progress</option>
            </select>
            <button type="submit" style=${styleMap( this.styles )}>Add</button>
          </form>
        `;
    }

    // basically there is no 2 way data-binding for lit-element template (because it is part of lit-html),
    // so the solution here is very close to react:
    // https://medium.com/collaborne-engineering/litelement-two-way-data-binding-48aec4692f7e
    handleItemDescChange( event ) {
        this.item_desc = event.target.value;
    }

    handleItemStatusChange( event ) {
        this.item_status = event.target.value;
    }

    // pass info back to parent. Much cleaner than the example in react doc
    submitInfo( e ) {
        e.preventDefault();
        let event = new CustomEvent( 'add-todo', {
            detail: {
                item_desc: this.item_desc,
                item_status: this.item_status
            }
        } );
        this.dispatchEvent( event );
    }

    // Trick to not use shadow-dom for getting CSS Effect for now.
    // https://github.com/Polymer/lit-element/issues/42
    // Long-term solution should be use shadow-dom.
    // Note: non-shadow dom doesn't support slot/transclude
    // https://github.com/Polymer/lit-element/issues/553
    createRenderRoot() {
        return this;
    }
}
// Register the new element with the browser.
customElements.define( 'lit-todo-form', TodoFormLitElement );
