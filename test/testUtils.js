/* eslint-env es6 */
export class TestUtils {
  /**
   * Renders a given element with provided attributes
   * and returns a promise which resolves as soon as
   * rendered element becomes available.
   * @param {string} tag tags
   * @param {object} attributes attributes
   * @param {string} textContent attributes[]
   * @returns {Promise<HTMLElement>} Promise Object
   */
  static render( tag, attributes = {}, textContent = '' ) {
    TestUtils._renderToDocument( tag, attributes, textContent );
    return TestUtils._waitForComponentToRender( tag );
  }

  /**
   * Replaces document's body with provided element
   * including given attributes.
   * @param {string} tag tags
   * @param {object} attributes attributes[]
   * @param {string} textContent attributes[]
   */
  static _renderToDocument( tag, attributes, textContent ) {
    const htmlAttributes = TestUtils._mapObjectToHTMLAttributes( attributes );
    document.body.innerHTML = `<${tag} ${htmlAttributes}>${ textContent ? textContent : '' }</${tag}>`;
  }

  /**
   * Converts an object to HTML string representation of attributes.
   *
   * For example: `{ foo: "bar", baz: "foo" }`
   * becomes `foo="bar" baz="foo"`
   *
   * @param {object} attributes attributes
   * @returns {string} string as HTML attributes
   */
  static _mapObjectToHTMLAttributes( attributes ) {
    return Object.entries( attributes ).reduce( ( previous, current ) => {
      return previous + ` ${current[0]}="${current[1]}"`;
    }, '' );
  }

  /**
   * Returns a promise which resolves as soon as
   * requested element becomes available.
   * @param {string} tag HTML tag
   * @returns {Promise<HTMLElement>} promise object
   */
  static async _waitForComponentToRender( tag ) {
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
}
