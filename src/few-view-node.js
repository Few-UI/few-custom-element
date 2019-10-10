/* eslint-env es6 */

export default class FewViewNode {
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
