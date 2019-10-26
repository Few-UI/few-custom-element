/* eslint-env es6 */
import _get from 'lodash/get';
import viewUnitFactory, { FewViewUnit } from './few-view-unit';

class FewViewEachUnit extends FewViewUnit {
    static get KEY() {
        return 'f-each';
    }

    static get EACH_VAR_NAME() {
        return 'f-var';
    }

    static get EACH_SET_NAME() {
        return 'f-set';
    }

    static get EACH_TEMPLATE() {
        return 'f-template';
    }

    /**
     * compile dom node input to curren unit context
     * @param {Node} domNode DOM Node input
     * @returns {Node} DOM Node as anchor
     */
    _compile( domNode ) {
        let name = this.constructor.KEY;
        let varKey = this.constructor.EACH_VAR_NAME;
        let setKey = this.constructor.EACH_SET_NAME;
        let templKey = this.constructor.EACH_TEMPLATE;

        // Process f-each clause
        let vForExpr = domNode.getAttribute( name );
        let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );

        // TODO: Error handling
        // TODO: put template DOM at child unit #0, need a better solution later
        domNode.removeAttribute( name );
        this.setInput( varKey, match[1] );
        this.setInput( setKey, match[3] );
        this.setInput( templKey, domNode );


        // TODO: couple with HTML/DOM, can be abstract later
        // Backup node input for for purpose
        let commentNode = document.createComment( `${name}(${vForExpr})` );
        if ( domNode.parentNode ) {
            domNode.parentNode.replaceChild( commentNode, domNode );
        } else {
            // TODO: we should error out - the top root div is required
        }


        // this.addChild( { domNode: node } );

        // Use current node as anchor
        // TODO: we can put a global comment anchor later rather than use node
        return commentNode;
    }

    /**
     * update dom node based on vm
     * @param {Node} domNode input dom node
     * @param {Object} vm model
     * @returns {Node} updated dom node
     */
    _update( domNode, vm ) {
        let newNode = domNode;
        let parentNode = domNode.parentNode;
        let varKey = this.constructor.EACH_VAR_NAME;
        let setKey = this.constructor.EACH_SET_NAME;
        let templKey = this.constructor.EACH_TEMPLATE;
        let childUnits = this.getChildren();

        let varName = this.getInput( varKey );
        let setName = this.getInput( setKey );
        let templNode = this.getInput( templKey );
        let vForLst = childUnits.length;
        // let vForRes = vm[setName] ? vm[setName].length + 1 : 1;
        let vForRes = _get( vm, setName );
        // let vForRes = vm[setName];
        let vForResLength = vForRes ? vForRes.length || Object.keys( vForRes ).length : 0;

        // TODO:we can do either length check, order check, shallow compare...
        if ( vForLst  > vForResLength ) {
            // Remove exceeded template
            // TODO: Make sure no memory leak later
            childUnits.splice( vForResLength );

            // Update DOM
            for( let i = vForResLength; i < vForLst; i++ ) {
                let prevNode = newNode.previousSibling;
                parentNode.removeChild( newNode );
                newNode = prevNode;
            }
        } else if ( vForLst < vForResLength ) {
            // Append new template
            let fragment = document.createDocumentFragment();
            for( let i = vForLst; i < vForResLength; i++ ) {
                let newNode = templNode.cloneNode( true );
                this.addChild( viewUnitFactory.createUnit( newNode, this._parser ) );
                fragment.appendChild( newNode );
            }
            newNode = fragment.lastChild;
            parentNode.insertBefore( fragment, domNode.nextSibling );
        } else {
            // No change and do nothing
        }

        // Re-render template set
        if ( vForResLength > 0 ) {
            let iCount = 0;
            let keys = Object.keys( vForRes );
            // re-fetch children because of one side effect
            this.getChildren().map( ( ch ) => {
                let vVar = {};
                vVar[varName] = vForRes[keys[iCount++]];
                return ch.render( Object.assign( Object.assign( {}, vm ), vVar ) );
            } );
        }

        return newNode;
    }
}

export default {
    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE && domNode.hasAttribute( FewViewEachUnit.KEY ),
    createUnit: ( domNode, parser ) => new FewViewEachUnit( domNode, parser )
};
