/* eslint-env es6 */
// Default module loader for few, for difference case user may need to implement
// there own

/**
 * load single module
 * @param {string} moduleName module name or rel path as key
 * @returns {Promise} promise with module object
 */
export function loadModule( moduleName ) {
    /*
    if ( /few-button$/.test( moduleName ) ) {
        return import( './few-button' );
    }
    */
    return import( moduleName );
}

/**
 * load single module
 * @param {Array} moduleNames array of name or rel path for modules as key
 * @returns {Promise} promise with module objects
 */
export function loadModules( moduleNames ) {
    return Promise.all( moduleNames.map( ( key ) => {
        return import( key );
    } ) );
}

export default {
    loadModule,
    loadModules
};
