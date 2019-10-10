/* eslint-env es6 */
import { evalExpression } from './few-utils';
import viewUnitFactory, { FewViewUnit } from './few-view-unit';

class FewViewCondUnit extends FewViewUnit {
    static get KEY() {
        return 'f-cond';
    }

    /**
     * compile dom node input to curren unit context
     * @param {Node} domNode DOM Node input
     * @returns {Node} DOM Node as anchor
     */
    _compile( domNode ) {
        let key = this.constructor.KEY;
        this.setInput( key, domNode.getAttribute( key ) );

        domNode.removeAttribute( key );
        this.addChild( viewUnitFactory.createUnit( domNode, this._parser ) );
        return domNode;
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

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE && domNode.hasAttribute( FewViewCondUnit.KEY ),
    createUnit: ( domNode, parser ) => new FewViewCondUnit( domNode, parser )
};
