/* eslint-env es6 */
// Simple http implementation

/**
 * simple http get
 * @param {string} theUrl url as string
 * @returns {Promise} promise
 */
export function httpGet( theUrl ) {
    return new Promise( ( resolve, reject ) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if ( xhr.readyState === 4 && xhr.status !== 404 ) {
                resolve( xhr.responseText );
            } else {
                // reject( `httpGet(${theUrl}) => ${xhr.status}:${xhr.responseText}` );
            }
        };

        xhr.onerror = () => {
            reject( `httpGet(${theUrl}) => ${xhr.status}: ${xhr.statusText}` );
        };

        xhr.onloadend = function() {
            if ( xhr.status === 404 ) {
                reject( `httpGet(${theUrl}) => ${xhr.status}: ${xhr.statusText}` );
            }
        };

        xhr.open( 'GET', theUrl, true ); // true for asynchronous
        xhr.send( null );
    } );
}

export default {
    get: httpGet
};
