/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    evalExpression,
    parseViewToDiv,
    parseView
} from './few-utils';

class FewDom {
    /**
     * Create VirtualDomElement
     * @param {string} tagName DOM Element tag name
     * @param {Object} props DOM attributes
     * @param {Array} children child elements
     */
    constructor( tagName ) {
        /**
         * type name
         */
        this.tagName = tagName;

        /**
         * if true, means current node or its children has variable attributes
         */
        this.hasExpr = false;

        /**
         * default render function
         * @param {Object} vm model object
         */
        this.render = ( vm ) => {};

        // For typical ES6 practice, we better put all member variable
        // in constructor as a good practice. But for thi atom type, we
        // break the rule for better performance. But still we list here
        // for better readability

        /**
         * variable attributes
         * this.props = {};
         */

        /**
         * constant attributes or evaluation result for variable attrbutes
         * this.values = {};
         */

        /**
         * child nodes
         * this.children = [];
         */

        /**
         * reference to actual DOM Element
         * this._htmlDomReference = <DOMElement>;
         */
    }

    /**
     * Add DOM Attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    addProperty( name, val ) {
        this.props = this.props || {};
        this.props[name] = val;
        this.hasExpr = true;
    }

    /**
     * Set value for constant attribute or evaluation result of variable attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    setAttrValue( name, val ) {
        this.values = this.values || {};
        this.values[name] = val;
    }

    /**
     * Get value for constant attribute or evaluation result of variable attribute
     * @param {string} name attribute name
     * @returns {string} return value
     */
    getAttrValue( name ) {
        return this.values ? this.values[name] : undefined;
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
        return this.tagName === '#text';
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

        this._htmlDomReference = newNode;
        return newNode;
    }

    /**
     * Print object for test purpose
     * @returns {JSON} JSON object that presents the content of FewDom
     */
    toJSON() {
        let refStr = '';
        if( this._htmlDomReference ) {
            if( this.isTextNode() ) {
                refStr = this._htmlDomReference.nodeValue;
            } else {
                let node = this._htmlDomReference.cloneNode();
                if( this._htmlDomReference.children && this._htmlDomReference.children.length > 0 ) {
                    node.innerHTML = '';
                }
                // nodeValue
                refStr = node.outerHTML;
            }
        }

        let obj = Object.assign( {}, this );
        obj._htmlDomReference = refStr;
        if ( this.children ) {
            obj.children = this.children.map( ( o ) => o.toJSON() );
        }
        delete obj.render;

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
     * @returns {FewViewTemplate} View Node Object
     */
    parse( templateString ) {
        let templateNode = parseView( templateString );
        return this._createTemplate( templateNode );
    }

    /**
     * Create FewDom structure based on input DOM
     * @param {Node} node DOM Node
     * @param {number} level level for current element input
     * @returns {FewDom} FewDom object
     */
    _createTemplate( node, level = 0 ) {
        if(  node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // has scope defined already
            hasScope( node ) ) {
            return;
        }

        let obj = new FewDom( node.nodeName );
        obj.hasExpr = false;

        // TODO: need to refactor
        let skipChild = false;

        if ( obj.isTextNode() ) {
            let name = 'textContent';
            let value = node[name];
            // TODO: we can do it better later
            let expr = this._parser.parse( value );
            if( expr ) {
                obj.addProperty( name, expr );
                obj.hasExpr = true;

                obj.render = ( vm ) => {
                    let res = evalExpression( obj.props[name], vm, true );
                    let last = obj.getAttrValue( name );
                    if ( last === undefined || !_.isEqual( last, res ) ) {
                        obj.setAttrValue( name, res );
                        obj._htmlDomReference[name] = res;
                    }
                };
            }
            obj.setAttrValue( name, value );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'v-for' ) ) {
            let vForExpr = node.getAttribute( 'v-for' );
            let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );
            let vVarName = match[1];
            let vSetName = match[3];
            node.removeAttribute( 'v-for' );
            // obj._renderFuncExpr = `${vSetName}.map((${vVarName}) => { return \`` + node.outerHTML + '`; }).join("");';
            obj.hasExpr = true;
            skipChild = true;
            obj.render = ( vm ) => {
                let content = vm[vSetName].map( ( o ) => {
                    let vVar = {};
                    vVar[vVarName] = o;
                    // TODO: If the pattern is not ${}, it will break. Need to use this.createHtmlDom( vm )
                    return evalExpression( '`' + node.outerHTML + '`', Object.assign( Object.assign( {}, vm ), vVar ), true );
                } ).join( '' );

                content = content ? content : '<!-- v-for is empty -->';
                let parent = obj._htmlDomReference.parentNode;
                let oldHtml = parent.innerHTML;
                if ( !_.isEqual( oldHtml, content ) ) {
                    parent.innerHTML = content;
                    obj._htmlDomReference = parent.firstChild;
                }
            };
            // For now not set hasExpr = true.
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'v-if' ) ) {
            let vIfExpr = node.getAttribute( 'v-if' );
            node.removeAttribute( 'v-if' );
            obj.hasExpr = true;
            skipChild = true;
            obj.render = ( vm ) => {
                let currNode = obj._htmlDomReference;
                let parentNode = currNode.parentNode;
                let vIfRes = evalExpression( vIfExpr, vm, true );
                let vIfLast = obj.getAttrValue( 'v-if' );
                if ( vIfLast === undefined || vIfLast !== Boolean( vIfRes ) ) {
                    if( vIfRes ) {
                        // TODO: If the pattern is not ${}, it will break. Need to use this.createHtmlDom( vm )
                        let content = evalExpression( '`' + node.outerHTML + '`', vm, true );
                        let newNode = parseViewToDiv( content ).firstChild;
                        parentNode.replaceChild( newNode, currNode );
                        obj._htmlDomReference = newNode;
                    } else {
                       let newNode = document.createComment( `v-if ${vIfExpr} = ${vIfRes}` );
                        parentNode.replaceChild( newNode, currNode );
                        obj._htmlDomReference = newNode;
                    }
                }
                obj.setAttrValue( 'v-if', Boolean( vIfRes ) );
            };
            obj._htmlDomReference = node;
        }  else {
            for( let i = 0; i < node.attributes.length; i++ ) {
                let name = node.attributes[i].name;
                let value = node.attributes[i].value;
                // TODO: we can do it better later
                let expr = this._parser.parse( value );
                if( expr ) {
                    // if name is event like onclick
                    // TODO: make it as expression later
                    if ( /^on.+/.test( name ) ) {
                        node.setAttribute( name, `few.handleEvent(this, '${expr}', event)` );
                    } else {
                        obj.addProperty( name, expr );
                        obj.hasExpr = true;
                    }
                }
                obj.setAttrValue( name, value );
            }

            obj.render = ( vm ) => {
                if ( obj.hasExpr ) {
                    _.forEach( obj.props, ( value, name ) => {
                        let res = evalExpression( value, vm, true );
                        let last = obj.getAttrValue( name );
                        // TODO: maybe string comparison will be better?
                        if ( !_.isEqual( last, res ) ) {
                            obj.setAttrValue( name, res );
                            obj._htmlDomReference.setAttribute( name, res );
                        }
                    } );

                    for( let child of obj.children ) {
                        child.render( vm );
                    }
                }
            };
        }

        if ( obj.hasExpr || level === 0 ) {
            obj._htmlDomReference = node;
        }

        for ( let i = 0; !skipChild && i < node.childNodes.length; i++ ) {
            let child = node.childNodes[i];
            let childNode = this._createTemplate( child, level + 1 );
            if( childNode ) {
                obj.addChild( childNode );
            }
        }

        return obj;
    }
}
