/* eslint-env es6 */
import DeclViewElement from './decl-view-element';
import { getExpressionFromTemplate, evalExpression, parseView, setViewModel } from './decl-utils';
export default class DeclViewModel {
    /**
     * Constructor for View Model Object
     * @param {DeclViewModel} parent parent view model
     * @param {Object} viewModelInput view model input
     */
    constructor( parent, viewModelInput ) {
        /**
         * parent view model
         */
        this._parent = parent;

        /**
         * view object
         */
        this._view = null;

        /**
         * data
         */
        this.data = viewModelInput.data;

        /**
         * function
         */
        this.method = viewModelInput.function;
    }

    /**
     * set view for current view model
     * @param {string} viewHtml view HTML snippet as string
     * @returns {Element} top DOM Node
     */
    setView( viewHtml ) {
        this._view = DeclViewElement.createView( parseView( viewHtml ) );
        setViewModel( this._view.reference, this );
        this.updateView();
        return this._view.reference;
    }

    /**
     * update view when view model is updated
     * This method is not needed later
     */
    updateView() {
        this._view.updateView( this );
    }

    /**
     * evaluate method in view model
     * @param {string} methodName method name in view model
     * @returns {object} result
     */
    evalMethod( methodName ) {
        let method = this.method[methodName];
        let vals = method.input ? Object.values( method.input ) : [];
        vals = vals.map( ( o ) => {
          let template = getExpressionFromTemplate( o );
          return template ? evalExpression( template, this ) : o;
        } );
        let callee = {
            module: console,
            method: method.name
        };
        return callee.module[ callee.method ].apply( callee.module, vals );
    }
}

