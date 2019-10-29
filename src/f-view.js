/* eslint-env es6 */

import yaml from 'js-yaml';
import FewComponent from './few-component';
import fewViewFactory from './few-view-factory';
import http from './http';
import { getComponent, getViewElement, parseView, resolvePath } from './few-utils';

export default class FewView extends HTMLElement {
    static get tag() {
        return 'f-view';
    }

    static get observedAttributes() {
        return [ 'src', 'model' ];
    }

    constructor() {
        super();

        /**
         * component
         */
        this._component = null;

        /**
         * view path
         */
        this._currentView = null;
    }

    getViewPath() {
        if ( /\//.test( this._currentView ) ) {
            return this._currentView.replace( /\/[^/]+$/, '' );
        }
    }

    async attributeChangedCallback( name, oldValue, newValue ) {
        // console.log( `${name}: ${oldValue} => ${newValue}` );

        if ( name === 'src' && newValue && oldValue !== newValue ) {
            let newViewPath = resolvePath( getViewElement( this ) ? getViewElement( this ).getViewPath() : '', newValue );

            this._currentView = newViewPath;


            try {
                let parentComponent = getComponent( this );

                // TODO: clean up model except attribute defined by parent
                // also need to destroy its ref in parent
                // this._component.model = _.filter( modelPath );
                // this._component.parent.remove(this._component);

                let modelPath = this.getAttribute( 'model' );

                // load component definition
                let componentDef = yaml.safeLoad( await http.get( `${newViewPath}.yml` ) );

                if ( this._currentView !== newViewPath ) {
                    return;
                }

                this._component = new FewComponent( parentComponent, componentDef, modelPath );

                // Load model
                await this._component.init();

                // TODO: need to refactor
                if( componentDef.view.import ) {
                    componentDef.view.import = componentDef.view.import.map( path => resolvePath(  this.getViewPath(), path ) );
                }

                this._component.setView( await fewViewFactory.createView( componentDef.view, this._component._strTplParser ) );

                if ( this._currentView !== newViewPath ) {
                    return;
                }

                // SLOT: get all children and save at slot as template
                // TODO: we can do it outside and passin unit which will be better
                let size = this.childNodes.length;
                if ( size > 0 ) {
                    this._slot = {
                        domFragement: document.createDocumentFragment(),
                        nameSlotMap: {}
                    };
                    for( let i = 0; i < size; i++ ) {
                        let domNode = this.firstChild;
                        if ( domNode.getAttribute && domNode.getAttribute( 'slot' ) ) {
                            this._slot.nameSlotMap[domNode.getAttribute( 'slot' )] = domNode;
                            // remove slot attribute to avoid complication
                            domNode.removeAttribute( 'slot' );
                        }
                        this._slot.domFragement.appendChild( domNode );
                    }
                }

                // clean up
                // TODO: this is conflict with slot processing, need to diff them with condition
                this.innerHTML = '';

                // SLOT: apply slot to current DOM
                // TODO: we can do it before atttachViewPage to save performance later
                let slotElements = this._component.getDomNode().getElementsByTagName( 'SLOT' );
                size = slotElements.length;
                if ( size > 0 ) {
                    let unNamedSlot = null;
                    for( let i = size; i > 0; i-- ) {
                        let slotElem = slotElements[i - 1];  // <-- HTMLCollection is a dynamic list
                        let slotName = slotElem.getAttribute( 'name' );
                        if ( slotName && this._slot.nameSlotMap[slotName] ) {
                            slotElem.parentElement.replaceChild( this._slot.nameSlotMap[slotName], slotElem );
                        } else if( !unNamedSlot ) {
                            // match thi 1st unnamed slot
                            unNamedSlot = slotElem;
                        }
                    }

                    // if we have unname slot, put all the rest into unname slot
                    if ( unNamedSlot ) {
                        unNamedSlot.parentElement.replaceChild( this._slot.domFragement, unNamedSlot );
                    }
                }

                // One time apply, no dynamic featue
                delete this._slot;


                this._component.attachViewToPage( this );

                // delete this._pendingView;
            } catch ( e ) {
                if ( this._currentView === newViewPath ) {
                    this.appendChild( parseView( `<code style="color:red" >${newViewPath}.yml: ${e}</code>` ) );
                }
                throw e;
            }
        }
    }
}
customElements.define( FewView.tag, FewView );
