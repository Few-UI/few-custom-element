/* eslint-env es6 */
import _ from 'lodash';
import few from './few-global';
import fewViewFactory from './few-view-factory';
import StringTemplateParser from './string-template-parser';

import {
    applySlot,
    setComponent,
    evalExpression,
    cloneDeepJsonObject
} from './few-utils';

export default class FewComponent {
    /**
     * Constructor for View Model Object
     * @param {FewComponent} parent parent view model
     * @param {string} scopeExpr expression to fetch scope in parent component
     */
    constructor( parent, scopeExpr ) {
        /**
         * parent view model
         */
        this._parent = parent;

        this._children = [];

        if ( parent ) {
            parent._children.push( this );
        }

        /**
         * component definition setup
         */
        this._vm = {
            model: {}
        };

        if ( scopeExpr ) {
            this._vm.model = evalExpression( scopeExpr, this._parent._vm.model );
        }

        /**
         * view object
         */
        this._view = null;

        /**
         * Dirty flag, we can put it to model, for now put it here
         */
        this._isDirty = false;

        /**
         * method update view
         * TODO: can we return promise here
         */
        this._updateViewDebounce = _.debounce( () => {
            this._updateView();
        }, 100 );
    }

    /**
     * load component definition
     * @param {Object} componentDef component definition
     */
    loadComponentDef( componentDef ) {
        if ( componentDef ) {
            if ( componentDef.model ) {
                Object.assign( this._vm.model, componentDef.model );
                delete componentDef.model;
            }
            Object.assign( this._vm, componentDef );
        }

        /**
         * Default options
         */
        this._option = componentDef.option || {};

        if ( !this._option.scopePath ) {
            this._option.scopePath = 'scope';
        }

        if( !this._option.actionPaths ) {
            this._option.actionPaths = [ 'action' ];
        }
        this._option.actionPaths.push( '' );

        // Load string template
        this._strTplParser = new StringTemplateParser( this._option.stringTemplate );
    }

    /**
     * Render template to DOM Element, a reactDOM like API
     * @param {Object} templateDef template definition with import and template string
     * @param {Element} containerElem container element
     * @param {string} baseUrl base URL for relative path
     * @returns {Promise} promise can be used for next step
     */
    async render( templateDef, containerElem, baseUrl ) {
        // Load init action
        if ( this._vm.init ) {
            await this._update( this._vm.init, undefined, false );
        }

        // Load view
        if ( this._vm.view ) {
            this._view = await fewViewFactory.createView( templateDef, this._strTplParser, baseUrl );
        }

        this.attachViewToPage( containerElem );

        // todo: later we can try to copy the component and return that when apply on different templateDef
        return null;
    }

    /**
     * init component based on model
     * @param {Object} componentDef component definition
     * @param {string} baseUrl base URL for relative path
     */ 
    async initComponent( componentDef, baseUrl ) {
        // load component definition
        this.loadComponentDef( componentDef );

        // Load init action
        if ( this._vm.init ) {
            await this._update( this._vm.init, undefined, false );
        }

        // Load view
        if ( this._vm.view ) {
            this._view = await fewViewFactory.createView( this._vm.view, this._strTplParser, baseUrl );
        }
    }

    /**
     * attach current view to DOM in page
     * TODO: Move it out of here...
     * @param {Element} elem DOM Element in page
     */
    attachViewToPage( elem ) {
        // apply slot
        // TODO: consider re-apply and switch view later
        applySlot( this._view.domNode, elem );

        elem.innerHTML = '';
        /**
         * - The raw temple is a HTML which all custom element functon is not executed.
         * - We need to attach the view to actual page so all the custom element render takes priority
         * - Then we render -> it will have some overhead
         * - Then the custom directive gets executed to make sure no crash with custom element logic
         */
        setComponent( elem, this );

        let childNodes = this._view.domNode.childNodes;
        let size = childNodes.length;
        let fragment = document.createDocumentFragment();
        for( let i = 0; i < size; i++ ) {
            fragment.appendChild( childNodes[0] );
        }
        elem.appendChild( fragment );
        this._view.domNode = elem;
        this._view.render( this._vm.model );
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    _updateView() {
        if ( this._view ) {
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

    // _updateViewDebounce = _.debounce(_updateView);

    updateView() {
        if ( this._parent ) {
            this._parent.updateView();
        } else {
            this._updateViewDebounce();
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Update value and trigger view update
     * @param {string} path value path on model
     * @param {string} value value itself
     */
    _updateModel( path, value ) {
        _.set( this._vm.model, path, value );
        this._isDirty = true;
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
                    obj[key] = evalExpression( template, this._vm.model );
                }
            } else {
                this._evalActionInput( obj[key], level + 1 );
            }
        }
        return obj;
    }

    async _executeAction( actionDef, scope ) {
        let dep =  actionDef.import ? ( await few.load( [ actionDef.import ] ) )[0] : window;

        // backup and apply scope
        // For now only support on level scope
        let originArg = this._vm.model[this._option.scopePath];
        this._setScope( scope );

        let input = this._evalActionInput( actionDef.input );
        let vals = actionDef.input ? Object.values( input ) : [];

        let func = _.get( dep, actionDef.name );
        let res = actionDef.name ? await func.apply( dep, vals ) : input;

        // restore origin namespace
        if ( originArg ) {
            this._setScope( originArg );
        }

        _.forEach( actionDef.output, ( valPath, vmPath ) => {
            this._updateModel( vmPath, valPath && valPath.length > 0 ? _.get( res, valPath ) : res );
        } );

        // scope as next input
        // return Object.assign( scope, res );
        return res !== undefined ? res : scope;
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
        let res = null;
        if ( Array.isArray( actionDef ) ) {
            res = await actionDef.reduce( async( scope, name ) => {
                return this.update( name, await scope, false );
            }, scope );
        } else {
            res = await this._executeAction( actionDef, scope );
        }

        if( updateView ) {
            this.updateView();
        }

        return res;
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

        return await this._update( actionDef, scope, updateView );
    }
}
