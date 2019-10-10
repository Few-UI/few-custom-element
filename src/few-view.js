/* eslint-env es6 */
// import _ from 'lodash';
import {
    hasScope,
    evalExpression,
    parseView
} from './few-utils';

class FewViewNode {
    /**
     * Create VirtualDomElement
     * @param {string} nodeName name of DOM node
     */
    constructor( nodeName ) {
        /**
         * type name
         */
        this.type = nodeName;

        // For typical ES6 practice, we better put all member variable
        // in constructor as a good practice. But for thi atom type, we
        // break the rule for better performance. But still we list here
        // for better readability


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
         * this.domNode = <DOMNode>
         */
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
    }

    getChildren() {
        return this.children || [];
    }

    /**
     * Check if current FewViewUnit object is text node
     * @returns {boolean} return true if the FewViewUnit object is for text node
     */
    isTextNode() {
        return this.type === '#text';
    }

    /**
     * Print object for test purpose
     * @returns {JSON} JSON object that presents the content of FewViewUnit
     */
    toJSON() {
        let obj = Object.assign( {}, this );
        if ( this.children ) {
            obj.children = this.children.map( ( o ) => o.toJSON() );
        }
        delete obj.domNode;
        delete obj._parser;

        // wash out methods
        return obj;
    }

    /**
     * Refresh/create HTML DOM for current FewDOM
     * NOTE: no usage for now
     * @param {FewComponent} vm view model object
     * @returns {Node} HTML dom Node
     */
    createHtmlDom( vm ) {
        let newNode = null;
        if( this.isTextNode() ) {
            newNode = document.createTextNode( this.data.textContent );
        } else {
            newNode = document.createElement( this.type );
            for ( let attr in this.data ) {
                newNode.setAttribute( attr, this.data[attr] );
            }
            this.children.forEach( ( c ) => {
                newNode.appendChild( c.createHtmlDom( vm ) );
            } );
        }

        return newNode;
    }
}

class FewViewUnit extends FewViewNode {
    /**
     * Create FewViewUnit
     * @param {string} nodeName name of DOM node
     * @param {StringTemplateParser} parser string template parser
     */
    constructor( nodeName, parser ) {
        super( nodeName );

        /**
         * string template parser
         */
        this._parser = parser;

        /**
         * variable attributes
         * this.input = {};
         */
    }

    get hasInput() {
        return Boolean( this.input || this.children );
    }

    /**
     * Add variable attribute
     * @param {string} name attribute name
     * @param {string} val attribute value
     */
    setInput( name, val ) {
        // var shuld be string
        if ( val ) {
            this.input = this.input || {};
            this.input[name] = val;
        }
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
    getInputScope() {
        return this.input || {};
    }

    /**
     * general render function
     * @param {Object} vm view model object
     * @returns {Node} dom element as result
     */
    render( vm ) {
        let newNode = this._update( this.domNode, vm );
        this.domNode = newNode;
        return newNode;
    }

    /**
     * update dom node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
    _update( domNode, vm ) {
        return domNode;
    }
     */
}

class FewViewTextUnit extends FewViewUnit {
    static get TEXT_PROP_NAME() {
        return 'textContent';
    }

    /**
     * Create FewViewUnit
     * @param {string} node DOM node
     * @param {StringTemplateParser} stringTemplateParser string template parser
     */
    constructor( node, stringTemplateParser ) {
        super( node.nodeName, stringTemplateParser );

        let name = this.constructor.TEXT_PROP_NAME;

        // TODO: we can do it better later by supporting "aaa {bbb} ccc"
        this.setInput( name, this._parser.parse( node[name] ) );

        this.domNode = node;
    }

    /**
     * update dom node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
     * @returns {Node} updated dom node
     */
    _update( domNode, vm ) {
        let name = this.constructor.TEXT_PROP_NAME;
        let expr = this.getInput( name );
        if ( expr ) {
            let name = this.constructor.TEXT_PROP_NAME;
            let res = evalExpression( this.getInput( name ), vm, true );
            let last = this.getValue( name );
            // string. TODO: error handling
            if ( last === undefined || last !== res ) {
                this.setValue( name, res );
                domNode[name] = res;
            }
        }
        return domNode;
    }
}

class FewViewCondUnit extends FewViewUnit {
    static get KEY() {
        return 'f-cond';
    }

    /**
     * Create FewViewUnit
     * @param {string} node DOM node
     * @param {StringTemplateParser} parser string template parser
     */
    constructor( node, parser ) {
        super( node.nodeName, parser );

        let name = this.constructor.KEY;

        this.setInput( name, node.getAttribute( name ) );

        node.removeAttribute( name );
        let factory = new FewViewUnitFactory( this._parser );
        this.addChild( factory.createUnit( node ) );

        // Use current node as anchor
        this.domNode = node;
    }

    /**
     * update dom node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
     * @returns {Node} updated dom node
     */
    _update( domNode, vm ) {
        let newNode = domNode;
        let name = this.constructor.KEY;

        let vExpr = this.getInput( name );
        let vIfRes = evalExpression( vExpr, vm, true );
        let vIfLst = this.getValue( name );
        if ( vIfLst === undefined || vIfLst !== Boolean( vIfRes ) ) {
            let parentNode = domNode.parentNode;
            if( vIfRes ) {
                newNode = this.getChildren()[0].render( vm );
                parentNode.replaceChild( newNode, domNode );
            } else {
                newNode = document.createComment( `f-cond ${vExpr} = ${vIfRes}` );
                parentNode.replaceChild( newNode, domNode );
            }
        }
        this.setValue( name, Boolean( vIfRes ) );

        return newNode;
    }
}


class FewViewEachUnit extends FewViewUnit {
    static get EACH_VAR_NAME() {
        return 'f-var';
    }

    static get EACH_SET_NAME() {
        return 'f-set';
    }

    static get KEY() {
        return 'f-each';
    }

    static get EACH_TEMPLATE() {
        return 'f-template';
    }

    /**
     * Create FewViewUnit
     * @param {string} node DOM node
     * @param {StringTemplateParser} parser string template parser
     */
    constructor( node, parser ) {
        super( node.nodeName, parser );

        let name = this.constructor.KEY;
        let varKey = this.constructor.EACH_VAR_NAME;
        let setKey = this.constructor.EACH_SET_NAME;

        // Process f-each clause
        let vForExpr = node.getAttribute( name );
        let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );

        // TODO: Error handling
        this.setInput( varKey, match[1] );
        this.setInput( setKey, match[3] );


        // TODO: couple with HTML/DOM, can be abstract later
        // Backup node input for for purpose
        let commentNode = document.createComment( `f-each(${vForExpr})` );
        if ( node.parentNode ) {
            node.parentNode.replaceChild( commentNode, node );
        } else {
            // TODO: we should error out - the top root div is required
        }

        // TODO: put template DOM at child unit #0, need a better solution later
        node.removeAttribute( name );
        this.addChild( { domNode: node } );

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        this.domNode = commentNode;
    }

    /**
     * update dom node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
     * @returns {Node} updated dom node
     */
    _update( domNode, vm ) {
        let newNode = domNode;
        let parentNode = domNode.parentNode;
        let varKey = this.constructor.EACH_VAR_NAME;
        let setKey = this.constructor.EACH_SET_NAME;
        let childUnits = this.getChildren();

        let varName = this.getInput( varKey );
        let setName = this.getInput( setKey );
        let vForLst = childUnits.length;
        let vForRes = vm[setName] ? vm[setName].length + 1 : 1;

        // TODO:we can do either length check, order check, shallow compare...
        if ( vForLst  > vForRes ) {
            // Remove exceeded template
            // TODO: Make sure no memory leak later
            childUnits.splice( vForRes );

            // Update DOM
            for( let i = vForRes; i < vForLst; i++ ) {
                let prevNode = newNode.previousSibling;
                parentNode.removeChild( newNode );
                newNode = prevNode;
            }
        } else if ( vForLst < vForRes ) {
            // Append new template
            let fragment = document.createDocumentFragment();
            let factory = new FewViewUnitFactory( this._parser );
            for( let i = vForLst; i < vForRes; i++ ) {
                let newNode = childUnits[0].domNode.cloneNode( true );
                this.addChild( factory.createUnit( newNode ) );
                fragment.appendChild( newNode );
            }
            newNode = fragment.lastChild;
            parentNode.insertBefore( fragment, domNode.nextSibling );
        } else {
            // No change and do nothing
        }

        // Re-render template set
        if ( vForRes > 1 ) {
            let iCount = 0;
            vm[setName].map( ( o ) => {
                let vVar = {};
                vVar[varName] = o;
                return childUnits[++iCount].render( Object.assign( Object.assign( {}, vm ), vVar ) );
            } );
        }

        return newNode;
    }
}

class FewViewVarUnit extends FewViewUnit {
    /**
     * Create FewViewUnit
     * @param {string} node DOM node
     * @param {StringTemplateParser} parser string template parser
     */
    constructor( node, parser ) {
        super( node.nodeName, parser );

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
                    this.setInput( name, expr );
                }
            } else {
                this.setValue( name, value );
            }
        }

        let factory = new FewViewUnitFactory( this._parser );
        for ( let i = 0; i < node.childNodes.length; i++ ) {
            let childDomNode = node.childNodes[i];
            let childUnit = factory.createUnit( childDomNode, true );
            if( childUnit ) {
                this.addChild( childUnit );
            }
        }

        this.domNode = node;
    }

    /**
     * update dom node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
     * @returns {Node} updated dom node
     */
    _update( domNode, vm ) {
        let inputScope = this.getInputScope();
        for( let key in inputScope ) {
            let res = evalExpression( inputScope[key], vm, true );
            let last = this.getValue( key );
            // TODO: should be string or primitive value. But still need error handling
            if ( last !== res ) {
                this.setValue( key, res );
                domNode.setAttribute( key, res );
            }
        }

        for( let child of this.getChildren() ) {
            child.render( vm );
        }
        return domNode;
    }
}

class FewViewUnitFactory {
    constructor( exprTemplateParser ) {
        this._parser = exprTemplateParser;
    }

    /**
     * Create FewViewUnit structure based on input DOM
     * @param {Node} node DOM Node
     * @param {boolean} skipConstant if true result without input will not be returned
     * @returns {FewViewUnit} FewViewUnit object
     */
    createUnit( node, skipConstant ) {
        let unit = null;
        if ( node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||
            // f-ignore
            node.nodeType === Node.ELEMENT_NODE && node.hasAttribute( 'f-ignore' ) ||
            // has scope defined already
            hasScope( node ) ) {
                // do nothing
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( FewViewEachUnit.KEY ) ) {
            unit = new FewViewEachUnit( node, this._parser );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.getAttribute( FewViewCondUnit.KEY ) ) {
            unit = new FewViewCondUnit( node, this._parser );
        }else if ( node.nodeType === Node.TEXT_NODE ) {
            unit = new FewViewTextUnit( node, this._parser );
        }  else {
            unit = new FewViewVarUnit( node, this._parser );
        }
         return unit && unit.hasInput || !skipConstant ? unit : undefined;
    }
}

export class FewHtmlViewFactory {
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
    createView( templateString ) {
        let templateNode = parseView( templateString );
        let factory = new FewViewUnitFactory( this._parser );
        return factory.createUnit( templateNode );
    }
}
