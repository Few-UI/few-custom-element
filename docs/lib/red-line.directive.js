/* eslint-env es6 */

/*
global
*/

define( [ ], ( ) => {
    let exports = {};

    /**
     * Attribute directive example: red-line
     * update all contents to red line
     * @param {FewViewUnit} unit few unit object
     */
    exports.update = function( unit ) {
        let domNode = unit.domNode;
        const shadow = domNode.shadowRoot || domNode.attachShadow( { mode: 'open' } );

        const style = document.createElement( 'style' );

        style.textContent = `
            * {
                color: red;
                text-decoration: underline;
            }
        `;

        shadow.appendChild( style );
    };


    few.directive( 'red-line', exports );
} );

