/* eslint-env es6 */


/**
 * Renders a given element with provided attributes
 * and returns a promise which resolves as soon as
 * rendered element becomes available.
 * @param {string} tag tags
 * @param {object} attributes attributes
 * @param {string} textContent attributes[]
 * @returns {Promise<HTMLElement>} Promise Object
 */
/*
export function render( tag, attributes = {}, textContent = '' ) {
    _renderToDocument( tag, attributes, textContent );
    return _waitForComponentToRender( tag );
}
*/


/**
 * Create tick to test async
 * @param {number} count tick count
 * @returns {Promise} promise
 */
export function printTick( count ) {
    let promises = [];
    for ( let i = 0; i < count; i++ ) {
        promises.push( new Promise( resolve => {
            setTimeout( () => {
                // lifecycleHook.push( `tick ${i + 1}` );
                resolve();
            } );
        } ) );
    }
    return Promise.all( promises );
}

/**
 * Test util for wait specific time
 * @param {number} millionseconds wait time in ms
 * @returns {Promise} promise with result
 */
export function wait( millionseconds ) {
    return new Promise(  resolve => {
        setTimeout( () => {
            resolve( null );
        }, millionseconds ? millionseconds : 0 );
    } );
}
