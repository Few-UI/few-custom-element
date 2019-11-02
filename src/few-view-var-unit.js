/* eslint-env es6 */
import { getDirective } from './few-view-directive';
import viewUnitFactory, { FewViewUnit } from './few-view-unit';
import {
    evalExpression,
    getComponentFromCurrentElement
} from './few-utils';

class FewViewVarUnit extends FewViewUnit {
    /**
     * compile dom node input to curren unit context
     * @param {Node} domNode DOM Node input
     * @returns {Node} DOM Node as anchor
     */
    _compile( domNode ) {
        for( let i = 0; i < domNode.attributes.length; i++ ) {
            let name = domNode.attributes[i].name;
            let value = domNode.attributes[i].value;

            let expr = this._parser.parse( value );

            // TODO: if it is directive
            if( getDirective( name ) ) {
                this.setDirective( name, value );
            } else if ( /^@.+/.test( name ) ) {
                let evtName = name.replace( /^@/, '' );
                domNode.addEventListener( evtName, ( e ) => {
                    // eslint-disable-next-line no-undef
                    few.handleEvent( domNode, value, e );
                } );
            }else if( expr ) {
                this.setInput( name, expr );
                if ( !/^\./.test( name ) ) {
                    domNode.setAttribute( name, '' );
                }
            } else {
                this.setValue( name, value );
            }
        }

        for ( let i = 0; i < domNode.childNodes.length; i++ ) {
            let childDomNode = domNode.childNodes[i];
            let childUnit = viewUnitFactory.createUnit( childDomNode, this._parser, true );
            if( childUnit ) {
                this.addChild( childUnit );
            }
        }


        return domNode;
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

                // If domNode.few_scope, call getComponent then update component
                // otherwise set attribute
                let component = getComponentFromCurrentElement( domNode );
                if ( component && /^\./.test( key ) ) {
                    // TODO: need to exclude OOTB attribute on few-view and few-route
                    let params = {};
                    params[key.substr( 1 )] = res;
                    component.updateModel( params );
                } else {
                    // If res is object, set it to attribute is useless
                    // But doing 'setProp if object' will make the behavior
                    // unpredictable. Always set both may be a waste too.
                    // For now blindly set attribute at least get consistent
                    // behavior
                    domNode.setAttribute( key, res );
                }
            }
        }

        for( let child of this.getChildren() ) {
            child.render( vm );
        }

        let directives = this.getDirectives();
        for( let key in directives ) {
            let last = this.getValue( key );
            let res = evalExpression( directives[key], vm, true );
            if ( !this.hasValue( key ) || last !== res ) {
                getDirective( key ).update( this, res );
                this.setValue( key, res );
            }
        }

        return domNode;
    }
}

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE,
    createUnit: ( domNode, parser ) => new FewViewVarUnit( domNode, parser )
};
