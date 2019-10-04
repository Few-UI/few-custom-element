/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    evalExpression
} from './few-utils';

export default class FewDom {
    /**
     * Create FewDom structure based on input DOM
     * @param {Node} node DOM Node
     * @param {StringTemplateParser} parser string template parser function
     * @param {number} level level for current element input
     * @returns {Object} FewDom object
     */
    static createFewDom( node, parser, level = 0 ) {
        if(  node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // has scope defined already
            hasScope( node ) ) {
            return;
        }

        let obj = new FewDom( node.nodeName );
        obj.hasExpr = false;
        if ( obj.isTextNode() ) {
            let attr = 'textContent';
            let value = node[attr];
            // TODO: we can do it better later
            let expr = parser.parse( value );
            if( expr ) {
                obj.addProperty( attr, expr );
                obj.hasExpr = true;
            } /*else {*/
                obj.values[attr] = value;
            //}
        } else {
            for( let i = 0; i < node.attributes.length; i++ ) {
                let name = node.attributes[i].name;
                let value = node.attributes[i].value;
                // TODO: we can do it better later
                let expr = parser.parse( value );
                if( expr ) {
                    // if name is event like onclick
                    // TODO: make it as expression later
                    if ( /^on.+/.test( name ) ) {
                        node.setAttribute( name, `few.handleEvent(this, '${expr}', event)` );
                    } else {
                        obj.addProperty( name, expr );
                        obj.hasExpr = true;
                    }
                } /*else {*/
                    obj.values[name] = value;
                //}
            }
        }

        if ( obj.hasExpr || level === 0 ) {
            obj.reference = node;
        }

        for ( let i = 0; i < node.childNodes.length; i++ ) {
            let child = node.childNodes[i];
            let childNode = FewDom.createFewDom( child, parser, level + 1 );
            if( childNode ) {
                obj.addChild( childNode );
                obj.hasExpr = obj.hasExpr ? obj.hasExpr : childNode.hasExpr;
            }
        }

        return obj;
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
                let res = evalExpression( value, vm, true );
                // TODO: maybe string comparison will be better?
                if ( !_.isEqual( this.values[name], res ) ) {
                    this.values[name] = res;

                    if( name === 'textContent' ) {
                        this.reference[name] = res;
                    } else if ( name === 'v-if' ) {
                        let currNode = this.reference;
                        let parentNode = currNode.parentNode;
                        if( res ) {
                            parentNode.replaceChild( this.createHtmlDom( vm ), currNode );
                        } else {
                           let newNode = document.createComment( `v-if ${value} = ${res}` );
                            parentNode.replaceChild( newNode, currNode );
                            this.reference = newNode;
                        }
                    } else {
                        this.reference.setAttribute( name, res );
                    }
                }
            } );

            for( let child of this.children ) {
                child.render( vm );
            }
        }
    }

    /**
     * Refresh/create HTML DOM for current FewDOM
     * @param {FewComponent} vm view model object
     * @returns {Node} HTML dom Node
     */
    createHtmlDom( vm ) {
        let newNode = null;
        if( this.isTextNode() ) {
            newNode = document.createTextNode( this.values.textContent );
        } else {
            newNode = document.createElement( this.tagName );
            _.forEach( this.values, ( expr, attr ) => {
                newNode.setAttribute( attr, this.values[attr] );
            } );
            _.forEach( this.children, ( c ) => {
                newNode.appendChild( c.createHtmlDom( vm ) );
            } );
        }

        this.reference = newNode;
        return newNode;
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
