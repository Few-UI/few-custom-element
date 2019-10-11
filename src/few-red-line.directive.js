/* eslint-env es6 */

/**
 * process directive
 * @param {FewViewNode} node
 */
function process( node ) {
    let domNode = node.domNode;
    const shadow = domNode.shadowRoot || domNode.attachShadow( { mode: 'open' } );

    const style = document.createElement( 'style' );

    style.textContent = `
        * {
            color: red;
            text-decoration: underline;
        }
    `;

    shadow.appendChild( style );
}

export default {
    name: 'red-line',
    process: process
};
