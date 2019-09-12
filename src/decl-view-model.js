/* eslint-env es6 */
import { getExpressionFromTemplate, evalExpression } from './decl-utils';
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
        this.data = viewModelInput.data;

        /**
         * function
         */
        this.method = viewModelInput.function;
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

