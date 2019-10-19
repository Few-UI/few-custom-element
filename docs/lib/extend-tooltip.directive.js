/* eslint-env es6 */

/*
global
*/

define( [ 'few' ], ( few ) => {
    let exports = {};

    /**
     * Attribute directive example: extend-tooltip
     * show a tooltip with specific content
     * @param {FewViewUnit} unit few unit object
     * @param {string} value value that needs to be render
     */
    exports.update = function( unit, value ) {
        let infoElem = unit.getValue( 'few-pop-up-element' );
        if ( !infoElem ) {
            let domNode = unit.domNode;
            // Create a shadow root
            // const shadow = domNode.attachShadow( { mode: 'open' } );
            const shadow = domNode.shadowRoot || domNode.attachShadow( { mode: 'open' } );

            // Create spans
            const wrapper = document.createElement( 'span' );
            wrapper.setAttribute( 'class', 'wrapper' );

            const mainDom = document.createElement( 'code' );
            mainDom.classList.add( 'few-popup' );
            mainDom.appendChild( document.createElement( 'slot' ) );

            infoElem = document.createElement( 'span' );
            infoElem.setAttribute( 'class', 'info' );

            unit.setValue( 'few-pop-up-element', infoElem );

            // NOTE: without polyfill do it here is useless, not getting the attribute here
            // msg = this.msg;

            // Create some CSS to apply to the shadow dom
            const style = document.createElement( 'style' );

            style.textContent = `
                .wrapper {
                    position: relative;
                }
                .info {
                    font-size: 1.5rem;
                    width: 200px;
                    display: inline-block;
                    border: 1px solid black;
                    padding: 10px;
                    background: white;
                    border-radius: 10px;
                    opacity: 0;
                    transition: 0.6s all;
                    position: absolute;
                    bottom: 20px;
                    left: 10px;
                    z-index: -1;
                }
                img {
                    width: 1.2rem;
                }
                .few-popup:hover + .info, .few-popup:focus + .info {
                    opacity: 1;
                    z-index: 3;
                }
            `;

            // wrapper
            wrapper.appendChild( mainDom );
            wrapper.appendChild( infoElem );

            // Attach the created elements to the shadow dom
            shadow.appendChild( style );

            let firstSlot = null;
            let children = shadow.children;
            for ( let i = 0; i < children.length; i++ ) {
                let childDomNode = children[i];
                let slots = childDomNode.getElementsByTagName( 'SLOT' );
                if( slots.length > 0 ) {
                    firstSlot = slots[0];
                    break;
                }
            }

            if ( firstSlot ) {
                firstSlot.parentNode.replaceChild( wrapper, firstSlot );
            } else {
                shadow.appendChild( wrapper );
            }
        }
        infoElem.textContent = value;
    };
    few.directive( 'extend-tooltip', exports );
} );
