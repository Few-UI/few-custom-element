/* eslint-env es6 */
import './few-global';
import _ from 'lodash';
import FewViewElement from './few-view-element';
import moduleLoader from './few-module-loader';
import { getExpressionFromTemplate, evalExpression, parseView2, setViewModel } from './few-utils';

export default class FewComponent {
    /**
     * Constructor for View Model Object
     * @param {FewComponent} parent parent view model
     * @param {Object} viewModelInput view model input
     */
    constructor( parent, viewModelInput ) {
        /**
         * parent view model
         */
        this._parent = parent;

        this._vm = viewModelInput.model;

        /**
         * module loader
         */
        this._option = viewModelInput.option || {};

        if ( !this._option.moduleLoader ) {
            this._option.moduleLoader = moduleLoader;
        }

        if ( !this._option.defaultScopePath ) {
            this._option.defaultScopePath = 'arg';
        }

        /**
         * view object
         */
        this._view = null;

        /**
         * method update view
         */
        this.updateView = _.debounce( () => {
            this._view.render( this._vm );
        }, 100 );
    }

    /**
     * set view for current view model
     * @param {Object} view view input
     * @returns {Promise} promise with view element
     */
    async createView( view ) {
        await this._option.moduleLoader.loadModules( view.import ? view.import : [] );

        this._view = FewViewElement.createView( parseView2( view.viewHtml ) );
        let elem = this._view.getDomElement();
        setViewModel( elem, this );
        this._view.render( this._vm );
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
     * @param {string} path value path on model
     * @param {string} value value itself
     */
    updateValue( path, value ) {
        _.set( this._vm, path, value );
        this.updateView();
    }

    _getActionDefinition( key ) {
        let methodDef = null;
        _.forEach( this._option.defaultActionPaths || [], ( n ) => {
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

    _getVmPath( path ) {
        if ( this._option.defaultModelPath ) {
            let idx = path.indexOf( '.' );
            let key = idx === -1 ? path : path.substr( 0, idx );
            return this._vm[key] ? path : `${this._option.defaultModelPath}.${path}`;
        }
        return path;
    }

    async _executeAction( actionDef, arg ) {
        let dep =  actionDef.import ? await this._option.moduleLoader.loadModule( actionDef.import ) : window;

        // backup and apply arg
        // For now only support on level arg
        let originArg = this._vm[this._option.defaultScopePath];
        this._vm[this._option.defaultScopePath] = arg;


        let vals = actionDef.input ? Object.values( actionDef.input ) : [];
        vals = vals.map( ( o ) => {
          let template = getExpressionFromTemplate( o );
          return template ? evalExpression( template, this._vm ) : o;
        } );

        let func = _.get( dep, actionDef.name );
        let res = await func.apply( dep, vals );

        // restore origin namespace
        if ( originArg ) {
            this._vm[this._option.defaultScopePath] = originArg;
        }

        // consider thenable later
        _.forEach( actionDef.output, ( valPath, vmPath ) => {
            this.updateValue( this._getVmPath( vmPath ), valPath && valPath.length > 0 ? _.get( res, valPath ) : res );
        } );

        // arg as next input
        return arg;
    }

    /**
     * evaluate method in view model
     * @param {string} methodName method name in view model
     * @param {object} arg input from upstream
     */
    async update( methodName, arg ) {
        let actionDef = this._getActionDefinition( methodName );

        if ( _.isArray( actionDef ) ) {
            return actionDef.reduce( ( argPromise, name ) => {
                return argPromise.then( ( arg ) => {
                    return this.update( name, arg );
                } );
            }, Promise.resolve( arg ) );
        }
        return this._executeAction( actionDef, arg );
    }
}
