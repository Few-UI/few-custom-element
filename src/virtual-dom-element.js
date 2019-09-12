/* eslint-env es6 */

import _ from 'lodash';
import { evalExpression } from './decl-utils';
// import NGElement from './ngElement';

export default class VirtualDomElement {
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
        // We can cut NGElement here or cut it at VDOM creation
        if( this.hasExpr /*&& !NGElement.isDefined( this.tagName )*/ ) {
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
