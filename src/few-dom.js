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

        // this._htmlDomReference = newNode;
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

    _createTextTemplateNote( node ) {
        let obj = new FewDom( node.nodeName );
        let name = 'textContent';
        let value = node[name];
        // TODO: we can do it better later by supporting "aaa {bbb} ccc"
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
        obj._htmlDomReference = node;
        obj.setAttrValue( name, value );
        return obj;
    }


    _createCondTemplateNode( node ) {
        let obj = new FewDom( node.nodeName );
        let vIfExpr = node.getAttribute( 'v-if' );
        node.removeAttribute( 'v-if' );
        obj.hasExpr = true;

        let vIfStatementObj = this._createTemplate( node );

        obj.render = ( vm ) => {
            let currNode = obj._htmlDomReference;
            let parentNode = currNode.parentNode;
            let vIfRes = evalExpression( vIfExpr, vm, true );
            let vIfLast = obj.getAttrValue( 'v-if' );
            if ( vIfLast === undefined || vIfLast !== Boolean( vIfRes ) ) {
                if( vIfRes ) {
                    let newNode = vIfStatementObj.render( vm );
                    parentNode.replaceChild( newNode, currNode );
                    obj._htmlDomReference = newNode;
                } else {
                   let newNode = document.createComment( `v-if ${vIfExpr} = ${vIfRes}` );
                    parentNode.replaceChild( newNode, currNode );
                    obj._htmlDomReference = newNode;
                }
            }
            obj.setAttrValue( 'v-if', Boolean( vIfRes ) );
            return obj._htmlDomReference;
        };

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        obj._htmlDomReference = node;

        // TODO: skip lint for now
        this._parser;

        return obj;
    }

    _createLoopTemplateNode( node ) {
        let obj = new FewDom( node.nodeName );
        let vForExpr = node.getAttribute( 'v-for' );
        let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );
        let vVarName = match[1];
        let vSetName = match[3];
        node.removeAttribute( 'v-for' );

        let vForStatementObj = this._createTemplate( node );

        obj.hasExpr = true;
        obj.render = ( vm ) => {
            let fragment = document.createDocumentFragment();

            // TODO: This is where we really need vDOM
            vm[vSetName].forEach( ( o ) => {
                let vVar = {};
                vVar[vVarName] = o;
                let newNode = vForStatementObj.render( Object.assign( Object.assign( {}, vm ), vVar ) );
                fragment.appendChild( newNode.cloneNode( true ) );
            } );

            // TODO: assume no sibling for now, need to be ehance to support <div v-for="xxx"></div><div id="other"></div>
            if ( fragment.children.length === 0 ) {
                fragment.appendChild( document.createComment( 'v-for is empty ' ) );
            }

            let parent = obj._htmlDomReference.parentNode;
            if ( !_.isEqual( parent.innerHTML, fragment.innerHTML ) ) {
                parent.innerHTML = '';
                parent.appendChild( fragment );
                obj._htmlDomReference = parent.firstChild;
            }
        };

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        obj._htmlDomReference = node;

        return obj;
        // For now not set hasExpr = true.
    }

    /**
     * create Simple Template Node
     * @param {Node} node DOM Node in input template
     * @returns {FewDom} Template Node
     */
    _createSimpleTemplateNode( node ) {
        let obj = new FewDom( node.nodeName );
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
            return obj._htmlDomReference;
        };

        obj._htmlDomReference = node;

        for ( let i = 0; i < node.childNodes.length; i++ ) {
            let child = node.childNodes[i];
            let childNode = this._createTemplate( child );
            if( childNode ) {
                obj.addChild( childNode );
            }
        }

        return obj;
    }

    /**
     * Create FewDom structure based on input DOM
     * @param {Node} node DOM Node
     * @param {number} level level for current element input
     * @returns {FewDom} FewDom object
     */
    _createTemplate( node ) {
        if(  node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // has scope defined already
            hasScope( node ) ) {
            return;
        }

        let obj = null;

        if ( node.nodeType === Node.TEXT_NODE ) {
            obj = this._createTextTemplateNote( node );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'v-for' ) ) {
            obj = this._createLoopTemplateNode( node );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'v-if' ) ) {
            obj = this._createCondTemplateNode( node );
        }  else {
            obj = this._createSimpleTemplateNode( node );
        }

        return obj;
    }
}
