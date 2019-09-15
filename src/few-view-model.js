/* eslint-env es6 */
import './few-global';
import _ from 'lodash';
import FewViewElement from './few-view-element';
import { getExpressionFromTemplate, evalExpression, parseView2, setViewModel } from './few-utils';

export default class FewViewModel {
    /**
     * Constructor for View Model Object
     * @param {FewViewModel} parent parent view model
     * @param {Object} viewModelInput view model input
     */
    constructor( parent, viewModelInput ) {
        /**
         * parent view model
         */
        this._parent = parent;

        this._vm = viewModelInput.viewModel;

        /**
         * module loader
         */
        this._options = {
            moduleLoader: viewModelInput.moduleLoader,
            methodNamespaces: viewModelInput.methodNamespaces || []
        };

        /**
         * view object
         */
        this._view = null;

        /**
         * method update view
         */
        this.updateView = _.debounce( () => {
            this._view.updateView( this._vm );
        }, 100 );
    }

    /**
     * set view for current view model
     * @param {Object} view view input
     * @returns {Promise} promise with view element
     */
    async createView( view ) {
        await this._options.moduleLoader.loadModules( view.import ? view.import : [] );

        this._view = FewViewElement.createView( parseView2( view.viewHtml ) );
        let elem = this._view.getDomElement();
        setViewModel( elem, this );
        this._view.updateView( this._vm );
        return elem;
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
        _.set( this._vm, path, value );
        this.updateView();
    }

    _getMethodDefinition( key ) {
        let methodDef = null;
        _.forEach( this._options.methodNamespaces, ( n ) => {
            methodDef = _.get( this._vm, `${n}.${key}` );
            if ( methodDef ) {
                return false;
            }
        } );

        if ( !methodDef ) {
            methodDef = _.get( this._vm, key );
        }
        return methodDef;
    }

    /**
     * evaluate method in view model
     * @param {string} methodName method name in view model
     * @returns {object} result
     */
    evalMethod( methodName ) {
        let method = this._getMethodDefinition( methodName );
        if ( method.import ) {
            return import( method.import ).then( ( dep ) => {
                let vals = method.input ? Object.values( method.input ) : [];
                vals = vals.map( ( o ) => {
                  let template = getExpressionFromTemplate( o );
                  return template ? evalExpression( template, this._vm ) : o;
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
