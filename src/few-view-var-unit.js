/* eslint-env es6 */
import { evalExpression } from './few-utils';
import viewUnitFactory, { FewViewUnit } from './few-view-unit';

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
            // TODO: we can do it better later
            let expr = this._parser.parse( value );
            if( expr ) {
                // if name is event like onclick
                // TODO: make it as expression later
                if ( /^on.+/.test( name ) ) {
                    domNode.setAttribute( name, `few.handleEvent(this, '${expr}', event)` );
                } else {
                    this.setInput( name, expr );
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
        if ( !this.firstUpdateDone ) {
            // TODO: temp hack
            if( domNode.hasAttribute( 'few-popup' ) ) {
                const shadow = domNode.shadowRoot || domNode.attachShadow( { mode: 'open' } );

                const style = document.createElement( 'style' );

                style.textContent = `
                    button {
                        color: red;
                        text-decoration: underline;
                    }
                `;

                shadow.appendChild( style );
            }
            this.firstUpdateDone = true;
        }


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

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE,
    createUnit: ( domNode, parser ) => new FewViewVarUnit( domNode, parser )
};
