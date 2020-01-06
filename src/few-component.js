/* eslint-env es6 */
import _ from 'lodash';
import fewViewFactory from './few-view-factory';
import StringTemplateParser from './string-template-parser';

import {
    applySlot,
    cloneDeepJsonObject,
    evalExpression,
    loadModules,
    setComponent
} from './few-utils';

export default class FewComponent {
    /**
     * Constructor for View Model Object
     * @param {Object} componentDef component definition
     * @param {FewComponent} parent parent view model
     * @param {Object} ctxMap context map
     */
    constructor( componentDef, parent, ctxMap, model ) {
        /**
         * parent view model
         */
        this._parent = parent;

        /**
         * Reference to children
         */
        this._children = {};

        /**
         * Barebone vm with model
         */
        this._vm = {
            model: model || {}
        };

        /**
         * view object
         */
        this._view = null;

        /**
         * Dirty flag, we can put it to model, for now put it here
         */
        this._isDirty = false;

        /**
         * id
         */
        this._id = '';

        /**
         * method update view
         * TODO: can we return promise here
         */
        this.updateViewDebounce = _.debounce( this._updateView.bind( this ) );

        // init
        this._loadComponentDef( componentDef );

        // load ctxMap
        if ( parent && ctxMap ) {
            this._loadParentCtx( ctxMap );
        }
    }

    /**
     * Add component to parent
     * @param {FewComponent} component child component
     * @param {string} elem child element
     */
    addChild( component, elem ) {
        let key = elem.getAttribute( 'id' ) || elem.getAttribute( 'src' );
        if ( key ) {
            this._children[key] = component;
        }
    }

    /**
     * load component def
     * @param {Object} componentDef component definition
     */
    _loadComponentDef( componentDef ) {
        /**
         * Setup options
         */
        this._option = componentDef.option || {};

        if ( !this._option.scopePath ) {
            this._option.scopePath = 'scope';
        }

        if( !this._option.actionPaths ) {
            this._option.actionPaths = [ 'action' ];
        }
        this._option.actionPaths.push( '' );

        this._strTplParser = new StringTemplateParser( this._option.stringTemplate );

        /**
         * Setup model and action
         */
        if ( componentDef ) {
            if ( componentDef.model ) {
                Object.assign( this._vm.model, componentDef.model );
                delete componentDef.model;
            }
            Object.assign( this._vm, componentDef );
        }
    }

    /**
     * load parent context to current model
     * @param {Object} ctxMap context path map from parent
     */
    _loadParentCtx( ctxMap ) {
        this._ctxMap = ctxMap;
        for( let key in ctxMap ) {
            let srcPath = ctxMap[key];
            // TODO: refactor with _updateModel later
            _.set( this._vm.model, key, this._parent.getValue( srcPath ) );
        }
    }

    /**
     * Render template to DOM Element, a reactDOM like API
     * NOTE: Promise here doesn't mean render done - we can't catch what happen inside
     * custom elemenet there is no callback or event to say 'render done'
     * @param {Object} viewDef view definition with import and template string
     * @param {Element} containerElem container element
     * @param {Object} urlData url infomation { base, name }
     * @returns {Promise} promise can be used for next step
     */
    async render( viewDef, containerElem, urlData = {} ) {
        // Add myself to parent
        if ( this._parent ) {
            this._parent.addChild( this, containerElem );
        }

        // Load init action
        if ( this._vm.init ) {
            await this._update( this._vm.init, undefined, false );
        }

        // Load view
        if ( this._vm.view ) {
            this._view = await fewViewFactory.createView( viewDef, this._strTplParser, urlData.base );
        }

        // apply slot
        // TODO: consider re-apply and switch view later
        applySlot( this._view.domNode, containerElem );

        containerElem.innerHTML = '';

        this._id = containerElem.getAttribute( 'id' );
        if( !this._id && urlData.name ) {
            containerElem.setAttribute( 'id', urlData.name );
            this._id = urlData.name;
        }

        setComponent( containerElem, this );

        // Save a dom
        let childNodes = this._view.domNode.childNodes;
        let size = childNodes.length;
        let fragment = document.createDocumentFragment();
        for( let i = 0; i < size; i++ ) {
            fragment.appendChild( childNodes[0] );
        }
        containerElem.appendChild( fragment );
        this._view.domNode = containerElem;
        this._view.render( this._vm.model );

        // todo: later we can try to copy the component and return that when apply on different templateDef
        return null;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    updateView() {
        if( this._ctxUpdate && this._parent ) {
            this._parent.updateModel( this._ctxUpdate );
            this._ctxUpdate = null;
        } else {
            this.updateViewDebounce();
        }
    }

    _updateView() {
        if ( this._view && ( this._isDirty || this._ctxMap ) ) {
            this._view.render( this._vm.model );
            this._isDirty = false;
        }

        // TODO: If parent and child share the same scope, and the scope is updated in parent, when msg is destributed
        // to child, the child cannot diffrenciate the value has been changed or not.
        // For now do a hard update for every child node, which is bad practice
        _.forEach( this._children, ( c ) => {
            c._updateView();
       } );
    }

    /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Update value and trigger view update
     * @param {string} path value path on model
     * @param {string} value value itself
     */
    _updateModel( path, value ) {
        if( !this._updateCtx( path, value ) ) {
            _.set( this._vm.model, path, value );
            this._isDirty = true;
        }
    }

    /**
     * Update ctx value and trigger parent view update
     * @param {string} path value path on model
     * @param {string} value value itself
     * @returns {boolean} true if path is in ctx
     */
    _updateCtx( path, value ) {
        for( let key in this._ctxMap ) {
            if ( path.startsWith( key ) ) {
                if ( !this._ctxUpdate ) {
                    this._ctxUpdate = {};
                }
                this._ctxUpdate[path.replace( key, this._ctxMap[key] )] = value;
                return true;
            }
        }
        return false;
    }

    /**
     * update model in component
     * @param {Object} params parameters as name value pair, for deep update make sure to put full path like 'a.b.c'
     * @param {Boolean} updateView if true will update the view
     */
    updateModel( params, updateView = true ) {
        for( let key in params ) {
            this._updateModel( key, params[key] );
        }

        if( updateView ) {
            this.updateView();
        }
    }

    _getActionDefinition( key ) {
        let methodDef = null;
        _.forEach( this._option.actionPaths, ( p ) => {
            methodDef = _.get( this._vm,  p && p.length > 0 ? `${p}.${key}` : key );
            if ( methodDef ) {
                return false;
            }
        } );

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
                let template = this._strTplParser.parse( value );
                if ( template ) {
                    obj[key] = this.getValue( template );
                }
            } else {
                this._evalActionInput( obj[key], level + 1 );
            }
        }
        return obj;
    }

    _evalCond( value ) {
        let template = this._strTplParser.parse( value );
        if ( template ) {
            return this.getValue( template );
        }
        return value;
    }

    async _executeAction( actionDef /*, scope*/ ) {
        let res;

        let dep =  actionDef.import ? ( await loadModules( [ actionDef.import ] ) )[0] : this;


        // evaluate condition firstly
        let input = this._evalActionInput( actionDef.input );
        let vals = actionDef.input ? Object.values( input ) : [];

        let func;

        if ( actionDef.name ) {
            func = _.get( dep, actionDef.name );

            if ( !func ) {
                func = _.get( window, actionDef.name );
                dep = window;
            }
        }

        // Vue's approach is overwrite 'this' by func.apply(data), which will will limit your
        // JS practice. But it is fine for vue since JS is part of its DSL.
        res = func ? await func.apply( dep, vals ) : input;

        _.forEach( actionDef.output, ( valPath, vmPath ) => {
            this._updateModel( vmPath, valPath && valPath.length > 0 ? _.get( res, valPath ) : res );
        } );


        // scope as next input
        // return Object.assign( scope, res );
        // return res !== undefined ? res : scope;
        return res;
    }

    /**
     * check if action exist on current component
     * @param {string} methodName action name
     * @returns {boolean} true if action exist in current definition
     */
    hasAction( methodName ) {
        return this._getActionDefinition( methodName );
    }

    /**
     * evaluate method in view model
     * @param {object} actionDef action definition as JSON object
     * @param {object} scope input from upstream
     * @param {boolean} updateView if true will update view
     * @returns {Promise} promise with scope value
     */
    async _update( actionDef, scope, updateView ) {
        let res;

        // backup and apply scope
        // For now only support on level scope
        // TODO: this may have risk at async case
        let originArg = this._vm.model[this._option.scopePath];
        this._setScope( scope );

        if( !actionDef.when || this._evalCond( actionDef.when ) ) {
            if ( actionDef.then ) {
                res = await actionDef.then.reduce( async( scope, name ) => {
                    return this.update( name, await scope, false );
                }, scope );
            } else {
                res = await this._executeAction( actionDef, scope );
            }

            if( updateView ) {
                this.updateView();
            }
        }

        // restore origin namespace
        if ( originArg ) {
            this._setScope( originArg );
        }

        return res === undefined ? scope : res;
    }


    /**
     * evaluate method in view model
     * @param {string} methodName method name in view model
     * @param {object} scope input from upstream
     * @param {boolean} updateView if true will update view
     * @returns {Promise} promise with scope value
     */
    async update( methodName, scope, updateView = true ) {
        let actionDef = this._getActionDefinition( methodName );

        if( !actionDef ) {
            throw Error( `FewComponent.update => action "${methodName}" not found!` );
        }

        return await this._update( actionDef, scope, updateView );
    }

    /**
     * get value from component by traverse expression
     * NOTE: it will return reference, be sure u do the right copy if needed
     * @param {string} expr to traverse to specific data
     * @returns {Object} traverse result
     */
    getValue( expr ) {
        return evalExpression( expr, this._vm.model );
    }

    /**
     * Equivalent function as few.handleEvent, request update at parent component
     * @param {string} name method name as key
     * @param {Object} input input to the method
     * @returns {Object} result for update
     */
    requestUpdate( name, input ) {
        let methodName = `${this._id}.${name}`;
        if ( this._parent && this._parent.hasAction( methodName ) ) {
            return this._parent.update( methodName, input );
        }
    }
}
