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
         * this.input = {};
         */

        /**
         * domNode reference
         */
        this.domNode = this._compile( domNode );

        return this.domNode ? this : undefined;
    }

    get hasInput() {
        return Boolean( this.input || this.children );
    }

    /**
     * Add variable attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    setInput( name, val ) {
        // var shuld be string
        if ( val ) {
            this.input = this.input || {};
            this.input[name] = val;
        }
    }

    /**
     * Get attribute expression by name
     * @param {string} name attribute name
     * @returns {string} expression as string
     */
    getInput( name ) {
        return this.input ? this.input[name] : undefined;
    }

    /**
     * Get the all definition for variable attributes
     * @returns {object} expression as string
     */
    getInputScope() {
        return this.input || {};
    }

    /**
     * general render function
     * @param {Object} vm view model object
     * @returns {Node} dom element as result
     */
    render( vm ) {
        let newNode = this._update( this.domNode, vm );
        this.domNode = newNode;
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
    return unit && unit.hasInput || !skipConstant ? unit : undefined;
}

export default {
    register: ( factory ) => _factories.push( factory ),
    createUnit: _createUnit
};

