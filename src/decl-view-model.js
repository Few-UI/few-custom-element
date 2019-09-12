/* eslint-env es6 */
import _ from 'lodash';
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
         * data
         */
        this.data = viewModelInput.viewModel.data;

        /**
         * function
         */
        this.method = viewModelInput.viewModel.function;

        /**
         * view object
         */
        this._view = this.createView( viewModelInput.viewHtml );

        /**
         * method update view
         */
        this.updateView = _.debounce( () => {
            this._view.updateView( this );
        }, 100 );
    }

    /**
     * set view for current view model
     * @param {string} viewHtml view HTML snippet as string
     * @returns {DeclViewElement} view object
     */
    createView( viewHtml ) {
        this._view = DeclViewElement.createView( parseView( viewHtml ) );
        setViewModel( this._view.reference, this );
        this._view.updateView( this );
        return this._view;
    }

    /**
     * Return view element
     * @returns {Element} top DOM Node
     */
    getViewElement() {
        return this._view.reference;
    }

    /**
     * Update value and trigger view update
     * @param {string} path value path on viewModel
     * @param {string} value value itself
     */
    updateValue( path, value ) {
        _.set( this, path, value );
        this.updateView();
    }

    /**
     * evaluate method in view model
     * @param {string} methodName method name in view model
     * @returns {object} result
     */
    evalMethod( methodName ) {
        let method = this.method[methodName];
        if ( method.import ) {
            return import( method.import ).then( ( dep ) => {
                let vals = method.input ? Object.values( method.input ) : [];
                vals = vals.map( ( o ) => {
                  let template = getExpressionFromTemplate( o );
                  return template ? evalExpression( template, this ) : o;
                } );
                let callee = {
                    module: dep,
                    method: method.name
                };
                let res = callee.module[ callee.method ].apply( callee.module, vals );

                // consider thenable later
                _.forEach( method.output, ( valPath, vmPath ) => {
                    this.updateValue( vmPath, valPath && valPath.length > 0 ? _.get( res, valPath ) : res );
                } );
            } );
        }
    }
}

