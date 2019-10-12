
/* eslint-env es6 */

let _directives = {};

/**
 * Register/define attribute directives in few
 * @param {string} name directive name
 * @param {FewDirective} directive attribute directive definition
 */
export function defineDirective( name, directive ) {
    _directives[name] = directive;
}

/**
 * Get attribute directive definition
 * @param {string} name directive name
 * @returns {FewDirective} attribute directive definition
 */
export function getDirective( name ) {
    return _directives[name];
}
