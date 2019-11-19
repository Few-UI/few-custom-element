/* eslint-env es6 */
import { getDirective } from './few-view-directive';
import viewUnitFactory, { FewViewUnit } from './few-view-unit';
import {
    evalExpression,
    getComponent,
    cloneDeepJsonObject,
    deepEqual
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

            let directive = getDirective( name );
            if( directive ) {
                this.setDirective( name, value );
                if( directive.compile ) {
                    directive.compile( domNode, value );
                }
            // TODO: move it as separate unit later
            } else if ( name === 'f-bind' ) {
                // blindly bind with .value for now
                this.setInput( 'value', value );
                // domNode.setAttribute( 'value', '' );
                domNode.addEventListener( 'input', ( e ) => {
                    let component = getComponent( e.target );
                    let params = {};
                    params[value] = e.target.value;
                    component.updateModel( params );
                } );
            }else if ( /^@.+/.test( name ) ) {
                let evtName = name.replace( /^@/, '' );
                domNode.addEventListener( evtName, ( e ) => {
                    // eslint-disable-next-line no-undef
                    few.handleEvent( domNode, value, e );
                } );
            }else if( expr ) {
                this.setInput( name, expr );
                domNode.setAttribute( name, '' );
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
            // Supports object too
            if ( !deepEqual( last, res ) ) {
                if( key.startsWith( ':' ) ) {
                    this.setValue( key, cloneDeepJsonObject( res ) );
                    domNode[key.substr( 1 )] = res;
                } else {
                    this.setValue( key, res );
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
                let directive = getDirective( key );
                if ( directive.update ) {
                    directive.update( this, res );
                    this.setValue( key, res );
                }
            }
        }

        return domNode;
    }
}

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE,
    createUnit: ( domNode, parser ) => new FewViewVarUnit( domNode, parser )
};
