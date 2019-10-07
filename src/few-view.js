/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    parseView
} from './few-utils';

class FewViewTemplate {
    /**
     * Create FewViewTemplate
     * @param {string} nodeName DOM Element tag name
     * @param {Object} props DOM attributes
     * @param {Array} children child elements
     */
    constructor( nodeName ) {
        /**
         * node type
         */
        this.nodeName = nodeName;

        /**
         * boolean
         */
        this.hasExpr = false;

        // For typical ES6 practice, we should put all member variable
        // in constructor as a good practice. But for thi atom type, we
        // break the rule for better performance. But still we list here
        // for better readability

        /**
         * directive attributes
         * this.directives = {}
         */

        /**
         * variables attributes
         * this.variables = {}
         */

        /**
         * constant attributes
         * this.constants = {};
         */

        /**
         * child nodes
         * this.children = [];
         */

        /**
         * reference to source snippet
         * this.reference = <dom?>
         */
    }

    /**
     * Add variable expression
     * @param {string} name variable name
     * @param {string} expr variable expression
     */
    addVariable( name, expr ) {
        this.variables = this.variables || {};
        this.variables[name] = expr;
        this.hasExpr = true;
    }

    /**
     * Add constant value
     * @param {string} name  constant name
     * @param {string} value constant value
     */
    addConstant( name, value ) {
        this.constants = this.constants || {};
        this.constants[name] = value;
    }

    /**
     * Add child element
     * @param {VirtualDomElement} child child element
     */
    addChild( child ) {
        this.children = this.children || [];
        this.children.push( child );
        this.hasExpr = this.hasExpr || child.hasExpr;
    }

    /**
     * Check if current object is text node
     * @returns {boolean} return true if the object is for text node
     */
    isTextNode() {
        return this.nodeName === '#text';
    }

    /**
     * Print object for test purpose
     * @returns {JSON} JSON object that presents the content of
     */
    toJSON() {
        let res = Object.assign( {}, this );
        if ( this.children ) {
            res.children = this.children.map( ( o ) => o.toJSON() );
        }
        return res;
    }
}

export class FewHtmlViewParser {
    /**
     * View Parser for Few Component
     * @param {StringTemplateParser} exprTemplateParser Sting Expression Template Parser in Template
     */
    constructor( exprTemplateParser ) {
        this._parser = exprTemplateParser;
    }

    /**
     * Create View Node Object by pasing HTML Template
     * @param {string} templateString HTML Template as Sting
     * @returns {FewViewTemplate} View Node Object
     */
    parse( templateString ) {
        let templateNode = parseView( templateString );
        return this._createTemplate( templateNode );
    }

    _createTemplate( node, level = 0 ) {
        if(  node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // has scope defined already
            hasScope( node ) ) {
            return;
        }

        let vNode = new FewViewTemplate( node.nodeName );
        vNode.hasExpr = false;

        if( vNode.isTextNode() ) {
            let name = 'textContent';
            let value = node[name];
            let expr = this._parser.parse( value );
            if( expr ) {
                vNode.addVariable( name, expr );
            } else {
                vNode.addConstant( name, value );
            }
        } else {
            // normal node
            for( let i = 0; i < node.attributes.length; i++ ) {
                let name = node.attributes[i].name;
                let value = node.attributes[i].value;
                // TODO: we can do it better later
                let expr = this._parser.parse( value );
                if( expr ) {
                    vNode.addVariable( name, expr );
                } else {
                    vNode.addConstant( name, value );
                }
            }
        }

        for ( let i = 0; i < node.childNodes.length; i++ ) {
            let child = node.childNodes[i];
            let childNode = this._createTemplate( child, level + 1 );
            if( childNode ) {
                vNode.addChild( childNode );
            }
        }

        return vNode;
    }
}
