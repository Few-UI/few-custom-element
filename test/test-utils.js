/* eslint-env es6 */

/**
 * Converts an object to HTML string representation of attributes.
 *
 * For example: `{ foo: "bar", baz: "foo" }`
 * becomes `foo="bar" baz="foo"`
 *
 * @param {object} attributes attributes
 * @returns {string} string as HTML attributes
 */
function _mapObjectToHTMLAttributes( attributes ) {
    return Object.entries( attributes ).reduce( ( previous, current ) => {
        return previous + ` ${current[0]}="${current[1]}"`;
    }, '' );
}


/**
 * Replaces document's body with provided element
 * including given attributes.
 * @param {string} tag tags
 * @param {object} attributes attributes[]
 * @param {string} textContent attributes[]
 */
function _renderToDocument( tag, attributes, textContent ) {
    const htmlAttributes = _mapObjectToHTMLAttributes( attributes );
    document.body.innerHTML = `<${tag} ${htmlAttributes}>${ textContent ? textContent : '' }</${tag}>`;
}

/**
 * Returns a promise which resolves as soon as
 * requested element becomes available.
 * @param {string} tag HTML tag
 * @returns {Promise<HTMLElement>} promise object
 */
async function _waitForComponentToRender( tag ) {
    return new Promise( resolve => {
        /**
         * test function
         */
        function requestComponent() {
            const element = document.querySelector( tag );
            if ( element ) {
                resolve( element );
            } else {
                window.requestAnimationFrame( requestComponent );
            }
        }
        requestComponent();
    } );
}


/**
 * Renders a given element with provided attributes
 * and returns a promise which resolves as soon as
 * rendered element becomes available.
 * @param {string} tag tags
 * @param {object} attributes attributes
 * @param {string} textContent attributes[]
 * @returns {Promise<HTMLElement>} Promise Object
 */
export function render( tag, attributes = {}, textContent = '' ) {
    _renderToDocument( tag, attributes, textContent );
    return _waitForComponentToRender( tag );
}

/**
 * Create tick to test async
 * @param {number} count tick count
 * @returns {Promise} promise
 */
export function printTick( count ) {
    let promises = [];
    for ( let i = 0; i < count; i++ ) {
        promises.push( new Promise( ( resolve, reject ) => {
            setTimeout( () => {
                // lifecycleHook.push( `tick ${i + 1}` );
                resolve();
            } );
        } ) );
    }
    return Promise.all( promises );
}
