/* eslint-env es6 */

import _ from 'lodash';
import FewBridge from './few-bridge';
import { evalExpression } from './few-utils';

export default class FewDom {
    /**
     * Create FewDom structure based on input DOM
     * @param {Element} elem DOM Element
     * @param {Function} parse string template parser function
     * @param {number} level level for current element input
     * @returns {Object} FewDom object
     */
    static createFewDom( elem, parse, level = 0 ) {
        if(  elem.nodeType !== Node.TEXT_NODE && elem.nodeType !== Node.ELEMENT_NODE || FewBridge.hasBridgeClass( elem ) ) {
            return;
        }

        let node = new FewDom( elem.nodeName );
        node.hasExpr = false;
        if ( elem.nodeType === Node.ELEMENT_NODE ) {
            for( let i = 0; i < elem.attributes.length; i++ ) {
                let name = elem.attributes[i].name;
                let value = elem.attributes[i].value;
                // TODO: we can do it better later
                let expr = parse( value );
                if( expr ) {
                    // if name is event like onclick
                    // TODO: make it as expression later
                    if ( /^on.+/.test( name ) ) {
                        elem.setAttribute( name, `few.handleEvent(this, '${expr}', event)` );
                    } else {
                        node.addProperty( name, expr );
                        node.hasExpr = true;
                    }
                }
            }
        } else if ( elem.nodeType === Node.TEXT_NODE ) {
            let attr = 'textContent';
            let value = elem[attr];
            // TODO: we can do it better later
            let expr = parse( value );
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
            let childNode = FewDom.createFewDom( child, parse, level + 1 );
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

    /**
     * get DOM element for current view element
     * @returns {Element} DOM element for current view element
     */
    getDomElement() {
        return this.reference;
    }

    /**
     * render view based on view model object
     * @param {FewComponent} vm view model object
     */
    render( vm ) {
        // We can cut FewBridge here or cut it at VDOM creation
        if( this.hasExpr /*&& !FewBridge.isBridge( this.reference )*/ ) {
            _.forEach( this.props, ( value, name ) => {
                let res = evalExpression( value, vm );
                // TODO: maybe string comparison will be better?
                if ( !_.isEqual( this.values[name], res ) ) {
                    this.values[name] = res;
                    this.reference[name] = res;
                }
            } );

            for( let child of this.children ) {
                child.render( vm );
            }
        }
    }
}
