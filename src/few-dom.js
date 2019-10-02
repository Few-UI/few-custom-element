/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    evalExpression,
    cloneDeepJsonObject
} from './few-utils';

export default class FewDom {
    /**
     * Create FewDom structure based on input DOM
     * @param {Element} elem DOM Element
     * @param {StringTemplateParser} parser string template parser function
     * @param {number} level level for current element input
     * @returns {Object} FewDom object
     */
    static createFewDom( elem, parser, level = 0 ) {
        if(  elem.nodeType !== Node.TEXT_NODE && elem.nodeType !== Node.ELEMENT_NODE ||
            // has scope defined already
            hasScope( elem ) ) {
            return;
        }

        let node = new FewDom( elem.nodeName );
        node.hasExpr = false;
        if ( node.isTextNode() ) {
            let attr = 'textContent';
            let value = elem[attr];
            // TODO: we can do it better later
            let expr = parser.parse( value );
            if( expr ) {
                node.addProperty( attr, expr );
                node.hasExpr = true;
            }
        } else {
            for( let i = 0; i < elem.attributes.length; i++ ) {
                let name = elem.attributes[i].name;
                let value = elem.attributes[i].value;
                // TODO: we can do it better later
                let expr = parser.parse( value );
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
        }

        if ( node.hasExpr || level === 0 ) {
            node.reference = elem;
        }

        for ( let i = 0; i < elem.childNodes.length; i++ ) {
            let child = elem.childNodes[i];
            let childNode = FewDom.createFewDom( child, parser, level + 1 );
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
     * Check if current FewDom object is text node
     * @returns {boolean} return true if the FewDom object is for text node
     */
    isTextNode() {
        return this.tagName === '#text';
    }


    /**
     * render view based on view model object
     * @param {FewComponent} vm view model object
     */
    render( vm ) {
        if( this.hasExpr ) {
            _.forEach( this.props, ( value, name ) => {
                let res = evalExpression( value, vm );
                // TODO: maybe string comparison will be better?
                if ( !_.isEqual( this.values[name], res ) ) {
                    this.values[name] = res;

                    // For text node we only have text content currently and it is property
                    this.isTextNode() ? this.reference[name] = res : this.reference.setAttribute( name, res );
                }
            } );

            for( let child of this.children ) {
                child.render( vm );
            }
        }
    }

    /**
     * Print object for test purpose
     * @returns {JSON} JSON object that presents the content of FewDom
     */
    toJson() {
        let refStr = '';
        if( this.reference ) {
            if( this.isTextNode() ) {
                refStr = this.reference.nodeValue;
            } else {
                let node = this.reference.cloneNode();
                if( this.reference.children && this.reference.children.length > 0 ) {
                    node.innerHTML = '';
                }
                // nodeValue
                refStr = node.outerHTML;
            }
        }

        let obj = Object.assign( {}, this );
        obj.reference = refStr;
        obj.children = this.children.map( ( o ) => o.toJson() );

        // wash out methods
        return obj;
    }
}
