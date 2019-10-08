/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    evalExpression,
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

    _createTextTemplateNode( node ) {
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
        return obj;
    }


    _createCondTemplateNode( node ) {
        let obj = new FewDom( node.nodeName );
        let vIfExpr = node.getAttribute( 'f-cond' );
        obj.hasExpr = true;

        node.removeAttribute( 'f-cond' );
        let vIfStatementObj = this._createTemplate( node );
        // node.addAttribute( 'f-cond' , vIfExpr );

        obj.render = ( vm ) => {
            let vIfRes = evalExpression( vIfExpr, vm, true );
            let vIfLast = obj.getAttrValue( 'f-cond' );
            if ( vIfLast === undefined || vIfLast !== Boolean( vIfRes ) ) {
                let currNode = obj._htmlDomReference;
                let parentNode = currNode.parentNode;
                if( vIfRes ) {
                    let newNode = vIfStatementObj.render( vm );
                    parentNode.replaceChild( newNode, currNode );
                    obj._htmlDomReference = newNode;
                } else {
                   let newNode = document.createComment( `f-cond ${vIfExpr} = ${vIfRes}` );
                    parentNode.replaceChild( newNode, currNode );
                    obj._htmlDomReference = newNode;
                }
            }
            obj.setAttrValue( 'f-cond', Boolean( vIfRes ) );
            return obj._htmlDomReference;
        };

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        obj._htmlDomReference = node;

        return obj;
    }

    _createLoopTemplateNode( node ) {
        let obj = new FewDom( node.nodeName );
        obj.hasExpr = true;

        // Process f-each clause
        let vForExpr = node.getAttribute( 'f-each' );
        let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );
        let vVarName = match[1];
        let vSetName = match[3];

        // create f-each statement template
        node.removeAttribute( 'f-each' );
        // let vForStatementTemplate = this._createTemplate( node );

        // TODO: couple with HTML/DOM, can be abstract later
        // Backup node input for for purpose
        let comment = document.createComment( `f-each(${vForExpr})` );
        if ( node.parentNode ) {
            node.parentNode.replaceChild( comment, node );
        }
        let vForStatementTemplates = [];
        let vForRawNode = node;

        // node.addAttribute( 'f-each', vForExpr );

        obj.render = ( vm ) => {
            let currNode = obj._htmlDomReference;
            let parentNode = currNode.parentNode;
            let vForLst = vForStatementTemplates.length;
            let vForRes = vm[vSetName] ? vm[vSetName].length : 0;

            // TODO:we can do either length check, order check, shallow compare...
            if ( vForLst  > vForRes ) {
                // Remove exceeded template
                // TODO: Make sure no memory leak later
                vForStatementTemplates.splice( vForRes );

                // Update DOM
                for( let i = vForRes; i < vForLst; i++ ) {
                    let prevNode = currNode.previousSibling;
                    parentNode.removeChild( currNode );
                    currNode = prevNode;
                }
            } else if ( vForLst < vForRes ) {
                // Append new template
                for( let i = vForLst; i < vForRes; i++ ) {
                    let newNode = vForRawNode.cloneNode( true );
                    vForStatementTemplates.push( this._createTemplate( newNode ) );
                    parentNode.insertBefore( newNode, currNode.nextSibling );
                    currNode = newNode;
                }
            } else {
                // No change and do nothing
            }
            obj._htmlDomReference = currNode;

            // Re-render template set
            if ( vForRes > 0 ) {
                let iCount = 0;
                vm[vSetName].map( ( o ) => {
                    let vVar = {};
                    vVar[vVarName] = o;
                    return vForStatementTemplates[iCount++].render( Object.assign( Object.assign( {}, vm ), vVar ) );
                } );
            }

            // This is not really required since f-each will be the top processor
            return obj._htmlDomReference;
        };

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        obj._htmlDomReference = comment;

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
            } else {
                obj.setAttrValue( name, value );
            }
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
            // f-ignore
            node.nodeType === Node.ELEMENT_NODE && node.hasAttribute( 'f-ignore' ) ||
            // has scope defined already
            hasScope( node ) ) {
            return;
        }

        let obj = null;

        if ( node.nodeType === Node.TEXT_NODE ) {
            obj = this._createTextTemplateNode( node );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'f-each' ) ) {
            obj = this._createLoopTemplateNode( node );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'f-cond' ) ) {
            obj = this._createCondTemplateNode( node );
        }  else {
            obj = this._createSimpleTemplateNode( node );
        }

        for ( let i = 0; i < node.childNodes.length; i++ ) {
            let child = node.childNodes[i];
            let childNode = this._createTemplate( child );
            if( childNode ) {
                obj.addChild( childNode );
            }
        }

        return obj;
    }
}
