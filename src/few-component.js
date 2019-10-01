/* eslint-env es6 */
import './few-global';
import _ from 'lodash';
import FewDom from './few-dom';
import moduleLoader from './few-module-loader';
import {
    parseViewToDiv,
    setComponent,
    evalExpression,
    cloneDeepJsonObject
} from './few-utils';

export default class FewComponent {
    /**
     * Constructor for View Model Object
     * @param {FewComponent} parent parent view model
     * @param {Object} componentDef component definition
     * @param {string} scopeExpr expression to fetch scope in parent component
     */
    constructor( parent, componentDef, scopeExpr ) {
        /**
         * parent view model
         */
        this._parent = parent;

        this._children = [];

        if ( parent ) {
            parent._children.push( this );
        }

        /**
         * view object
         */
        this._view = null;

        /**
         * component definition
         */
        this._vm = componentDef;

        /**
         * method update view
         */
        this.updateView = _.debounce( () => {
            this._view.render( this._vm.model );
        }, 100 );

        this.parseStringTemplate = null;

        /**
         * Default options
         */
        this._option = componentDef.option || {};

        if ( !this._option.moduleLoader ) {
            this._option.moduleLoader = moduleLoader;
        }

        if ( !this._option.scopePath ) {
            this._option.scopePath = 'scope';
        }

        if ( !this._option.stringTemplate ) {
            this._option.stringTemplate = {
                // eslint-disable-next-line no-template-curly-in-string
                pattern: '/^\\s*\\${\\s*([\\S\\s\\r\\n]*)\\s*}\\s*$/m',
                index: 1
            };
        }

        // Load string template
        this._loadStringTemplate();

        // Load Scope
        if ( scopeExpr ) {
            this._vm.model[this._option.scopePath] = evalExpression( this.parseStringTemplate( scopeExpr ), this._parent._vm.model );
        }
    }

    _loadStringTemplate() {
        let templateDef = this._option.stringTemplate;
        let regExpObj = evalExpression( templateDef.pattern );
        this._option.templateParser = function( str ) {
            let match = regExpObj.exec( str );
            if ( match ) {
                return match[templateDef.index];
            }
        };

        this.parseStringTemplate = this._option.templateParser.bind( this );
    }


    /**
     * Update value and trigger view update
     * @param {string} path value path on model
     * @param {string} value value itself
     */
    _updateValue( path, value ) {
        _.set( this._vm.model, path, value );
        this.updateView();
        // TODO: If parent and child share the same scope, and the scope is updated in parent, when msg is destributed
        // to child, the child cannot diffrenciate the value has been changed or not.
        // For now do a hard update for every child node, which is bad practice
        _.forEach( this._children, ( c ) => {
            c.updateView();
        } );
    }

    /*
    parseStringTemplate( str ) {
        return this._option.templateParser( str );
    }
    */


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

    _setScope( scope ) {
        this._vm.model[this._option.scopePath] = scope;
    }

    _evalActionInput( input, level = 0 ) {
        // Make the method to be immutable at top level
        let obj = level > 0 ? input : cloneDeepJsonObject( input );

        for( let key in obj ) {
            // TODO: we can do it at compile to save performance
            let value = obj[key];
            if ( typeof value === 'string' ) {
                let template = this.parseStringTemplate( value );
                if ( template ) {
                    obj[key] = evalExpression( template, this._vm.model );
                }
            } else {
                this._evalActionInput( obj[key], level + 1 );
            }
        }
        return obj;
    }

    async _executeAction( actionDef, scope ) {
        let dep =  actionDef.import ? await this._option.moduleLoader.loadModule( actionDef.import ) : window;

        // backup and apply scope
        // For now only support on level scope
        let originArg = this._vm.model[this._option.scopePath];
        this._setScope( scope );


        let vals = actionDef.input ? Object.values( this._evalActionInput( actionDef.input ) ) : [];

        let func = _.get( dep, actionDef.name );
        let res = await func.apply( dep, vals );

        // restore origin namespace
        if ( originArg ) {
            this._setScope( originArg );
        }

        _.forEach( actionDef.output, ( valPath, vmPath ) => {
            this._updateValue( vmPath, valPath && valPath.length > 0 ? _.get( res, valPath ) : res );
        } );

        // scope as next input
        // return Object.assign( scope, res );
        return res ? res : scope;
    }

    /**
     * set view for current view model
     * @param {Object} view view input
     * @returns {Promise} promise with view element
     */
    async createView( view ) {
        await this._option.moduleLoader.loadModules( view.import ? view.import : [] );

        this._view = FewDom.createFewDom( parseViewToDiv( view.template ), this.parseStringTemplate );
        let elem = this._view.getDomElement();
        setComponent( elem, this );
        this._view.render( this._vm.model );
        return elem;
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
