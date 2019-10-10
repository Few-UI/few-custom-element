/* eslint-env es6 */
import FewViewUnit from './few-view-unit';

export default class FewViewNullUnit extends FewViewUnit {
    static get KEY() {
        return 'f-ignore';
    }

    /**
     * Bypass by returning undefined
     * @returns {Node} it is undefined in this case
     */
    _compile( /*node*/ ) {
        return undefined && this.domNode;
    }
}
