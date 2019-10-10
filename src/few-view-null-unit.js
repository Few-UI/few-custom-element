/* eslint-env es6 */
let FewViewNullUnit = {
    KEY: 'f-ignore'
};

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE && domNode.hasAttribute( FewViewNullUnit.KEY ),
    createUnit: () => null
};
