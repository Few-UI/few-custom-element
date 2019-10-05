/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    evalExpression,
    parseView
} from './few-utils';

class FewViewNode {
    /**
     * Create FewViewNode
     * @param {string} nodeName DOM Element tag name
     * @param {Object} props DOM attributes
     * @param {Array} children child elements
     */
    constructor( nodeName ) {
        this.nodeName = nodeName;
        this.variables = {};
        this.constants = {};
        this.children = [];
        this.hasExpr = false;
    }

    /**
     * Add variable expression
     * @param {string} name variable name
     * @param {string} expr variable expression
     */
    addVariable( name, expr ) {
        this.variables[name] = expr;
        this.hasExpr = true;
    }

    /**
     * Add constant value
     * @param {string} name  constant name
     * @param {string} value constant value
     */
    addConstant( name, value ) {
        this.constants[name] = value;
    }

    /**
     * Add child element
     * @param {VirtualDomElement} child child element
     */
    addChild( child ) {
        this.children.push( child );
    }

    /**
     * Add child elements
     * @param {VirtualDomElement} children child elements
     */
    addChildren( children ) {
        this.children = this.children.concat( children );
    }

    /**
     * get DOM element for current view element
     * @returns {Element} DOM element for current view element
     */
    getDomElement() {
        return this._htmlDomReference;
    }

    /**
     * Check if current FewDom object is text node
     * @returns {boolean} return true if the FewDom object is for text node
     */
    isTextNode() {
        return this.nodeName === '#text';
    }

    /**
     * Print object for test purpose
     * @returns {JSON} JSON object that presents the content of FewDom
     */
    toJson() {
        let obj = Object.assign( {}, this );
        obj.children = this.children.map( ( o ) => o.toJson() );

        // wash out methods
        return obj;
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
     * @returns {FewViewNode} View Node Object
     */
    createView( templateString ) {
        let templateNode = parseView( templateString );
        return this._createViewNode( templateNode );
    }

    _createViewNode( node, level = 0 ) {
        if(  node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // has scope defined already
            hasScope( node ) ) {
            return;
        }

        let vNode = new FewViewNode( node.nodeName );
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
            let childNode = this._createViewNode( child, level + 1 );
            if( childNode ) {
                vNode.addChild( childNode );
                vNode.hasExpr = vNode.hasExpr ? vNode.hasExpr : childNode.hasExpr;
            }
        }

        return vNode;
    }
}
