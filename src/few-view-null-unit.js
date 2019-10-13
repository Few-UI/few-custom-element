/* eslint-env es6 */
let FewViewNullUnit = {
    KEY: 'f-ignore'
};

let _filterElements = {

};

/**
 * Register/define element which will be
 * @param {string} nodeName Element name all in upper case
 */
export function excludeElement( nodeName ) {
    _filterElements[nodeName] = true;
}

/**
 * Check if element is excluded by few
 * @param {string} nodeName element name all in uppercase
 * @returns {boolean} if true few will ignore the element
 */
function isExcluded( nodeName ) {
    return _filterElements[nodeName];
}

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE &&
                ( isExcluded( domNode.nodeName ) ||
                  domNode.hasAttribute( FewViewNullUnit.KEY ) ),
    createUnit: () => null
};
