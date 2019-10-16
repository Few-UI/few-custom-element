/* eslint-env es6 */
import { evalExpression } from './few-utils';
import { FewViewUnit } from './few-view-unit';

class FewViewTextUnit extends FewViewUnit {
    static get TEXT_PROP_NAME() {
        return 'textContent';
    }

    /**
     * compile dom node input to curren unit context
     * @param {Node} domNode DOM Node input
     * @returns {Node} DOM Node as anchor
     */
    _compile( domNode ) {
        let name = this.constructor.TEXT_PROP_NAME;

        // TODO: we can do it better later by supporting "aaa {bbb} ccc"
        this.setInput( name, this._parser.parse( domNode[name] ) );
        return domNode;
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
                domNode[name] = res ? res : '';
            }
        }
        return domNode;
    }
}

export default {
    when: ( domNode ) => domNode.nodeType === Node.TEXT_NODE,
    createUnit: ( domNode, parser ) => new FewViewTextUnit( domNode, parser )
};
