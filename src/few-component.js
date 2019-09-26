/* eslint-env es6 */
import './few-global';
import _ from 'lodash';
import FewViewElement from './few-view-element';
import moduleLoader from './few-module-loader';
import {
    parseView2,
    setComponent,
    cloneDeepJsonObject,
    evalObjectExpression
} from './few-utils';

export default class FewComponent {
    /**
     * Constructor for View Model Object
     * @param {FewComponent} parent parent view model
     * @param {Object} componentDef component definition
     */
    constructor( parent, componentDef ) {
        /**
         * parent view model
         */
        this._parent = parent;

        this._vm = componentDef;

        /**
         * module loader
         */
        this._option = componentDef.option || {};

        if ( !this._option.moduleLoader ) {
            this._option.moduleLoader = moduleLoader;
        }

        if ( !this._option.scopePath ) {
            this._option.scopePath = 'scope';
        }

        /**
         * view object
         */
        this._view = null;

        /**
         * method update view
         */
        this.updateView = _.debounce( () => {
            this._view.render( this._vm.model );
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
        setComponent( elem, this );
        this._view.render( this._vm.model );
        return elem;
    }

    /**
     * Update value and trigger view update
     * @param {string} path value path on model
     * @param {string} value value itself
     */
    updateValue( path, value ) {
        _.set( this._vm.model, path, value );
        this.updateView();
    }

    _getActionDefinition( key ) {
        let methodDef = null;
        _.forEach( this._option.actionPaths || [], ( n ) => {
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

    setScope( scope ) {
        this._vm.model[this._option.scopePath] = scope;
    }

    async _executeAction( actionDef, scope ) {
        let dep =  actionDef.import ? await this._option.moduleLoader.loadModule( actionDef.import ) : window;

        // backup and apply scope
        // For now only support on level scope
        let originArg = this._vm.model[this._option.scopePath];
        this.setScope( scope );


        let vals = actionDef.input ? Object.values( evalObjectExpression( cloneDeepJsonObject( actionDef.input ), this._vm.model ) ) : [];

        let func = _.get( dep, actionDef.name );
        let res = await func.apply( dep, vals );

        // restore origin namespace
        if ( originArg ) {
            this.setScope( originArg );
        }

        // consider thenable later
        _.forEach( actionDef.output, ( valPath, vmPath ) => {
            this.updateValue( vmPath, valPath && valPath.length > 0 ? _.get( res, valPath ) : res );
        } );

        // scope as next input
        // return Object.assign( scope, res );
        return res ? res : scope;
    }

    /**
     * evaluate method in view model
     * @param {string} methodName method name in view model
     * @param {object} scope input from upstream
     * @returns {Promise} promise with scope value
     */
    async update( methodName, scope ) {
        let actionDef = this._getActionDefinition( methodName );

        if ( _.isArray( actionDef ) ) {
            return actionDef.reduce( async( scope, name ) => {
                return this.update( name, await scope );
            }, scope );
        }
        return this._executeAction( actionDef, scope );
    }
}
