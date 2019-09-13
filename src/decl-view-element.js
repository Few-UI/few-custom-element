/* eslint-env es6 */

import _ from 'lodash';
import DeclBridge from './decl-bridge';
import { getExpressionFromTemplate, evalExpression } from './decl-utils';

export default class DeclViewElement {
    /**
     * Create DeclViewElement structure based on input DOM
     * @param {Element} elem DOM Element
     * @returns {Object} DeclViewElement
     */
    static createView( elem, level = 0 ) {
        if( elem.nodeType !== Node.TEXT_NODE && elem.nodeType !== Node.ELEMENT_NODE ) {
            return;
        }

        let node = new DeclViewElement( elem.nodeName );
        node.hasExpr = false;
        if ( elem.nodeType === Node.ELEMENT_NODE ) {
            for( let i = 0; i < elem.attributes.length; i++ ) {
                let name = elem.attributes[i].name;
                let value = elem.attributes[i].value;
                // TODO: we can do it better later
                let expr = getExpressionFromTemplate( value );
                if( expr ) {
                    node.addProperty( name, expr );
                    node.hasExpr = true;
                }
            }
        } else if ( elem.nodeType === Node.TEXT_NODE ) {
            let attr = 'textContent';
            let value = elem[attr];
            // TODO: we can do it better later
            let expr = getExpressionFromTemplate( value );
            if( expr ) {
                node.addProperty( attr, expr );
                node.hasExpr = true;
            }
        } else {
            // do nothing
        }

        if ( node.hasExpr || level === 0 ) {
            node.reference = elem;
        }

        for ( let i = 0; i < elem.childNodes.length; i++ ) {
            let child = elem.childNodes[i];
            let childNode = DeclViewElement.createView( child, level + 1 );
            if( childNode ) {
                node.addChild( childNode );
                node.hasExpr = node.hasExpr ? node.hasExpr : childNode.hasExpr;
            }
        }

        return node;
    }

    /**
     * Create VirtualDomElement
     * @param {string} tagName DOM Element tag name
     * @param {Object} props DOM attributes
     * @param {Array} children child elements
     */
    constructor( tagName, props = {}, children = [] ) {
        this.tagName = tagName;
        this.props = props;
        this.values = {};
        this.children = children;
        this.hasExpr = false;
        this.reference = null;
    }

    /**
     * Add DOM Attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    addProperty( name, val ) {
        this.props[name] = val;
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

    updateView( vm ) {
        // We can cut DeclBridge here or cut it at VDOM creation
        if( this.hasExpr && !DeclBridge.isBridge( this.reference ) ) {
            _.forEach( this.props, ( value, name ) => {
                let res = evalExpression( value, vm );
                if ( this.values[name] !== res ) {
                    this.values[name] = res;
                    this.reference[name] = res;
                }
            } );

            for( let child of this.children ) {
                child.updateView( vm );
            }
        }
    }
}
