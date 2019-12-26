/* eslint-env es6 */
import { hasScope } from './few-utils';
import FewViewNode from './few-view-node';

export class FewViewUnit extends FewViewNode {
    /**
     * Create FewViewUnit
     * @param {Node} domNode DOM node
     * @param {StringTemplateParser} parser string template parser
     */
    constructor( domNode, parser ) {
        super( domNode.nodeName );

        /**
         * string template parser
         */
        this._parser = parser;

        /**
         * variable attributes
         */
        // this._attrs = {};

        /**
         * variable properties
         */
        // this._props = {};

        /**
         * directive attributes
         */
        // this._directives = {};

        /**
         * domNode reference
         */
        this.domNode = this._compile( domNode );

        return this.domNode ? this : undefined;
    }

    get hasVariable() {
        return Boolean( this._attrs ||
                        this._props ||
                        this._directives ||
                        this.children );
    }

    /**
     * Add variable attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    setAttr( name, val ) {
        // var shuld be string
        if ( val ) {
            this._attrs = this._attrs || {};
            this._attrs[name] = val;
        }
    }

    /**
     * Get attribute expression by name
     * @param {string} name attribute name
     * @returns {string} expression as string
     */
    getAttr( name ) {
        return this._attrs ? this._attrs[name] : undefined;
    }

    /**
     * Get the all definitions for variable attribute
     * @returns {object} expression as string
     */
    getAttrs() {
        return this._attrs || {};
    }

    /**
     * Add variable property
     * @param {string} name property name
     * @param {string} val property value
     */
    setProp( name, val ) {
        // var shuld be string
        if ( val ) {
            this._props = this._props || {};
            this._props[name] = val;
        }
    }

    /**
     * Get property expression by name
     * @param {string} name attribute name
     * @returns {string} expression as string
     */
    getProp( name ) {
        return this._props ? this._props[name] : undefined;
    }

    /**
     * Get the all definitions for variable property
     * @returns {object} expression as string
     */
    getProps() {
        return this._props || {};
    }

    /**
     * Set directives definition to unit
     * @param {string} name name of directives
     * @param {string} expr expression as directive input
     */
    setDirective( name, expr ) {
        this._directives = this._directives || {};
        this._directives[name] = expr;
    }

    /**
     * Get directive definition from unit by name
     * @param {string} name name of directives
     * @returns {string} expression as string
     */
    getDirective( name ) {
        return this._directives ? this._directives[name] : undefined;
    }

    /**
     * Get all directive definitions from unit
     * @returns {object} expression as string
     */
    getDirectives() {
        return this._directives || {};
    }

    /**
     * Check if directive is defined or not
     * @param {string} name name of directives
     * @returns {boolean} true if directive is defined
     */
    hasDirective( name ) {
        return this._directives && this._directives.hasOwnProperty( name );
    }

    /**
     * general render function
     * @param {Object} vm view model object
     * @returns {Node} dom element as result
     */
    render( vm ) {
        let newNode = this._update( this.domNode, vm );
        if ( newNode !== this.domNode ) {
            this.domNode = newNode;
        }
        return newNode;
    }


    /**
     * compile dom node input to curren unit context
     * @param {Node} domNode DOM Node input
     * @returns {Node} DOM Node as anchor
     */
    /*
    _compile( domNode ) {
        return domNode;
    }
    */

    /**
     * update DOM node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
     */
    /*
    _update( domNode, vm ) {
        return domNode;
    }
     */
}

/**
 * Singleton factory template
 */
let _factories = [];

/**
 * Create FewViewUnit structure based on input DOM
 * @param {Node} node DOM Node
 * @param {StringTemplateParser} parser string template parser
 * @param {boolean} skipConstant if true result without input will not be returned
 * @returns {FewViewUnit} FewViewUnit object
 */
function _createUnit( node, parser, skipConstant ) {
    let unit = null;
    if( node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||    // only process text and dom for now
        hasScope( node ) ) {                                                          // has scope defined already
            // do nothing
    } else {
        for( let idx in _factories ) {
            let factory = _factories[idx];
            if( factory.when( node ) ) {
                unit = factory.createUnit( node, parser );
                break;
            }
        }
    }
    return unit && unit.hasVariable || !skipConstant ? unit : undefined;
}

export default {
    addFactory: ( factory ) => _factories.push( factory ),
    createUnit: _createUnit
};

