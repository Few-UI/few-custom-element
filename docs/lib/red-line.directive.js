/* eslint-env es6 */

/*
global
few
*/

define( [], () => {
    let exports = {};

    /**
     * Attribute directive example: red-line
     * update all contents to red line
     * @param {FewViewUnit} unit few unit object
     */
    exports.update = function( node ) {
        let domNode = node.domNode;
        const shadow = domNode.shadowRoot || domNode.attachShadow( { mode: 'open' } );

        const style = document.createElement( 'style' );

        style.textContent = `
            *:not(.info) {
                color: red;
                text-decoration: underline;
            }
        `;

        shadow.appendChild( style );
    };


    few.directive( 'red-line', exports );
} );

