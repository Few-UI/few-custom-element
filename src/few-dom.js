/* eslint-env es6 */

import _ from 'lodash';
import {
    hasScope,
    evalExpression,
    parseView
} from './few-utils';

class FewNode {
    /**
     * Create VirtualDomElement
     * @param {string} nodeName name of DOM node
     * @param {Object} props DOM attributes
     * @param {Array} children child elements
     */
    constructor( nodeName ) {
        /**
         * type name
         */
        this.type = nodeName;

        /**
         * if true, means current node or its children has variable attributes
         */
        //this.hasInput = false;


        // For typical ES6 practice, we better put all member variable
        // in constructor as a good practice. But for thi atom type, we
        // break the rule for better performance. But still we list here
        // for better readability

        /**
         * variable attributes
         * this.input = {};
         */

        /**
         * constant attributes or evaluation result for variable attrbutes
         * this.data = {};
         */

        /**
         * child nodes
         * this.children = [];
         */

        /**
         * correcponding dom node as anchor
         * this.ref = <DOMNode>
         */
    }

    get hasInput() {
        return Boolean( this.input || this.children );
    }

    /**
     * Add DOM Attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    setInput( name, val ) {
        this.input = this.input || {};
        this.input[name] = val;
        // this.hasInput = true;
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
    getScope() {
        return this.input || {};
    }

    /**
     * Set value for constant attribute or evaluation result of variable attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    setValue( name, val ) {
        this.data = this.data || {};
        this.data[name] = val;
    }

    /**
     * Get value for constant attribute or evaluation result of variable attribute
     * @param {string} name attribute name
     * @returns {string} return value
     */
    getValue( name ) {
        return this.data ? this.data[name] : undefined;
    }

    /**
     * Add child element
     * @param {VirtualDomElement} child child element
     */
    addChild( child ) {
        this.children = this.children || [];
        this.children.push( child );
        // this.hasInput = this.hasInput || child.hasInput;
    }

    getChildren() {
        return this.children || [];
    }

    /**
     * Check if current FewNode object is text node
     * @returns {boolean} return true if the FewNode object is for text node
     */
    isTextNode() {
        return this.type === '#text';
    }

    get node() {
        return this.ref;
    }

    set node( node ) {
        this.ref = node;
    }

    /**
     * Refresh/create HTML DOM for current FewDOM
     * @param {FewComponent} vm view model object
     * @returns {Node} HTML dom Node
     */
    createHtmlDom( vm ) {
        let newNode = null;
        if( this.isTextNode() ) {
            newNode = document.createTextNode( this.data.textContent );
        } else {
            newNode = document.createElement( this.type );
            _.forEach( this.data, ( expr, attr ) => {
                newNode.setAttribute( attr, this.data[attr] );
            } );
            _.forEach( this.children, ( c ) => {
                newNode.appendChild( c.createHtmlDom( vm ) );
            } );
        }

        return newNode;
    }

    /**
     * Print object for test purpose
     * @returns {JSON} JSON object that presents the content of FewNode
     */
    toJSON() {
        let obj = Object.assign( {}, this );
        if ( this.children ) {
            obj.children = this.children.map( ( o ) => o.toJSON() );
        }
        delete obj.ref;

        // wash out methods
        return obj;
    }
}

class FewViewAbstractTemplate {
    /**
     * View Parser for Few Component
     * @param {StringTemplateParser} exprTemplateParser Sting Expression Template Parser in Template
     */
    constructor( exprTemplateParser ) {
        this._parser = exprTemplateParser;
    }

    // TODO: remove me
    get hasInput() {
        return this._node.hasInput;
    }

    /**
     * general render function
     * @param {Object} vm view model object
     * @returns {Node} dom element as result
     */
    render( vm ) {
        let newNode = this.update( this._node.node, vm );
        this._node.node = newNode;
        return newNode;
    }


    toJSON() {
        return this._node.toJSON();
    }
}

class FewViewTextTemplate extends FewViewAbstractTemplate {
    static get TEXT_PROP_NAME() {
        return 'textContent';
    }

    setupFromDom( node ) {
        let obj = new FewNode( node.nodeName );

        let name = this.constructor.TEXT_PROP_NAME;

        // TODO: we can do it better later by supporting "aaa {bbb} ccc"
        let expr = this._parser.parse( node[name] );

        if( expr ) {
            obj.setInput( name, expr );
        }

        this._node = obj;
        this._node.node = node;

        return this;
    }

    update( currNode, vm ) {
        let obj = this._node;
        let newNode = currNode;
        if ( obj.hasInput ) {
            let name = this.constructor.TEXT_PROP_NAME;
            let res = evalExpression( obj.getInput( name ), vm, true );
            let last = obj.getValue( name );
            if ( last === undefined || !_.isEqual( last, res ) ) {
                obj.setValue( name, res );
                newNode[name] = res;
            }
        }
        return newNode;
    }
}
class FewViewCondTemplate extends FewViewAbstractTemplate {
    setupFromDom( node ) {
        let obj = new FewNode( node.nodeName );
        // obj.hasInput = true;

        obj.setInput( 'f-cond', node.getAttribute( 'f-cond' ) );

        node.removeAttribute( 'f-cond' );
        let factory = new FewViewTemplateFactory( this._parser );
        this.vIfStatementObj = factory.createTemplate( node );


        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        this._node = obj;
        this._node.node = node;

        return this;
    }

    update( currNode, vm ) {
        let obj = this._node;
        let newNode = currNode;
        let vExpr = obj.getInput( 'f-cond' );
        let vIfRes = evalExpression( vExpr, vm, true );
        let vIfLast = obj.getValue( 'f-cond' );
        if ( vIfLast === undefined || vIfLast !== Boolean( vIfRes ) ) {
            let parentNode = currNode.parentNode;
            if( vIfRes ) {
                newNode = this.vIfStatementObj.render( vm );
                parentNode.replaceChild( newNode, currNode );
            } else {
                newNode = document.createComment( `f-cond ${vExpr} = ${vIfRes}` );
                parentNode.replaceChild( newNode, currNode );
            }
        }
        obj.setValue( 'f-cond', Boolean( vIfRes ) );

        return newNode;
    }
}

class FewViewEachTemplate extends FewViewAbstractTemplate {
    setupFromDom( node ) {
        let obj = new FewNode( node.nodeName );
        // obj.hasInput = true;

        // Process f-each clause
        let vForExpr = node.getAttribute( 'f-each' );
        let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );

        obj.setInput( 'f-var', match[1] );
        obj.setInput( 'f-set', match[3] );

        // create f-each statement template
        node.removeAttribute( 'f-each' );

        // TODO: couple with HTML/DOM, can be abstract later
        // Backup node input for for purpose
        let comment = document.createComment( `f-each(${vForExpr})` );
        if ( node.parentNode ) {
            node.parentNode.replaceChild( comment, node );
        } else {
            // TODO: we should error out - the top root div is required
        }

        this.statementTemplates = [];
        this.templateNode = node;

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        this._node = obj;
        this._node.node = comment;

        return this;
    }

    update( currNode, vm ) {
        let newNode = currNode;
        let parentNode = currNode.parentNode;
        let vVarName = this._node.getInput( 'f-var' );
        let vSetName = this._node.getInput( 'f-set' );
        let vForLst = this.statementTemplates.length;
        let vForRes = vm[vSetName] ? vm[vSetName].length : 0;

        // TODO:we can do either length check, order check, shallow compare...
        if ( vForLst  > vForRes ) {
            // Remove exceeded template
            // TODO: Make sure no memory leak later
            this.statementTemplates.splice( vForRes );

            // Update DOM
            for( let i = vForRes; i < vForLst; i++ ) {
                let prevNode = newNode.previousSibling;
                parentNode.removeChild( newNode );
                newNode = prevNode;
            }
        } else if ( vForLst < vForRes ) {
            // Append new template
            let fragment = document.createDocumentFragment();
            let factory = new FewViewTemplateFactory( this._parser );
            for( let i = vForLst; i < vForRes; i++ ) {
                let newNode = this.templateNode.cloneNode( true );
                this.statementTemplates.push( factory.createTemplate( newNode ) );
                fragment.appendChild( newNode );
            }
            newNode = fragment.lastChild;
            parentNode.insertBefore( fragment, currNode.nextSibling );
        } else {
            // No change and do nothing
        }

        // Re-render template set
        if ( vForRes > 0 ) {
            let iCount = 0;
            vm[vSetName].map( ( o ) => {
                let vVar = {};
                vVar[vVarName] = o;
                return this.statementTemplates[iCount++].render( Object.assign( Object.assign( {}, vm ), vVar ) );
            } );
        }

        return newNode;
    }
}
class FewViewSimpleTemplate extends FewViewAbstractTemplate {
    setupFromDom( node ) {
        let obj = new FewNode( node.nodeName );

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
                    obj.setInput( name, expr );
                    // obj.hasInput = true;
                }
            } else {
                obj.setValue( name, value );
            }
        }

        let factory = new FewViewTemplateFactory( this._parser );
        for ( let i = 0; i < node.childNodes.length; i++ ) {
            let child = node.childNodes[i];
            let childNode = factory.createTemplate( child );
            if( childNode && childNode.hasInput ) {
                obj.addChild( childNode );
            }
        }

        this._node = obj;
        this._node.node = node;

        return this;
    }

    update( currNode, vm ) {
        let obj = this._node;
        let newNode = currNode;
        if ( obj.hasInput ) {
            _.forEach( obj.getScope(), ( value, name ) => {
                let res = evalExpression( value, vm, true );
                let last = obj.getValue( name );
                // TODO: maybe string comparison will be better?
                if ( !_.isEqual( last, res ) ) {
                    obj.setValue( name, res );
                    newNode.setAttribute( name, res );
                }
            } );

            for( let child of obj.getChildren() ) {
                child.render( vm );
            }
        }
        return newNode;
    }
}

class FewViewTemplateFactory {
    constructor( exprTemplateParser ) {
        this._parser = exprTemplateParser;
    }

    /**
     * Create FewNode structure based on input DOM
     * @param {Node} node DOM Node
     * @param {number} level level for current element input
     * @returns {FewNode} FewNode object
     */
    createTemplate( node ) {
        if ( node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // f-ignore
            node.nodeType === Node.ELEMENT_NODE && node.hasAttribute( 'f-ignore' ) ||
            // has scope defined already
            hasScope( node ) ) {
                // do nothing
        }else if ( node.nodeType === Node.TEXT_NODE ) {
            return new FewViewTextTemplate( this._parser ).setupFromDom( node );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'f-each' ) ) {
            return new FewViewEachTemplate( this._parser ).setupFromDom( node );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( 'f-cond' ) ) {
            return new FewViewCondTemplate( this._parser ).setupFromDom( node );
        }  else {
            return new FewViewSimpleTemplate( this._parser ).setupFromDom( node );
        }
    }
}

export class FewViewHtmlParser {
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
        let factory = new FewViewTemplateFactory( this._parser );
        return factory.createTemplate( templateNode );
    }
}
