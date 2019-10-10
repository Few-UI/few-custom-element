/* eslint-env es6 */
// import _ from 'lodash';
import {
    hasScope,
    parseView
} from './few-utils';

import FewViewVarUnit from './few-view-var-unit';
import FewViewTextUnit from './few-view-text-unit';
import FewViewCondUnit from './few-view-cond-unit';
import FewViewEachUnit from './few-view-each-unit';
import FewViewNullUnit from './few-view-null-unit';


export class FewViewUnitFactory {
    constructor( exprTemplateParser ) {
        this._parser = exprTemplateParser;
    }

    /**
     * Create FewViewUnit structure based on input DOM
     * @param {Node} node DOM Node
     * @param {boolean} skipConstant if true result without input will not be returned
     * @returns {FewViewUnit} FewViewUnit object
     */
    createUnit( node, skipConstant ) {
        let unit = null;
        if( node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||    // only process text and dom for now
            hasScope( node ) ) {                                                          // has scope defined already
                // do nothing
        } else if( node.nodeType === Node.ELEMENT_NODE && node.hasAttribute( FewViewNullUnit.KEY ) ) {
            unit = new FewViewNullUnit( node, this._parser );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.hasAttribute( FewViewEachUnit.KEY ) ) {
            unit = new FewViewEachUnit( node, this._parser );
        } else if( node.nodeType === Node.ELEMENT_NODE && node.hasAttribute( FewViewCondUnit.KEY ) ) {
            unit = new FewViewCondUnit( node, this._parser );
        }else if ( node.nodeType === Node.TEXT_NODE ) {
            unit = new FewViewTextUnit( node, this._parser );
        }  else {
            unit = new FewViewVarUnit( node, this._parser );
        }
         return unit && unit.hasInput || !skipConstant ? unit : undefined;
    }
}

export class FewHtmlViewFactory {
    /**
     * View Parser for Few Component
     * @param {StringTemplateParser} exprTemplateParser Sting Expression Template Parser in Template
     */
    constructor( exprTemplateParser ) {
        this._parser = exprTemplateParser;
    }

    /**
     * Create View Node Object by pasing HTML Template
     * @param {string} templateString HTML Template as Sting
     * @returns {FewViewTemplate} View Node Object
     */
    createView( templateString ) {
        let templateNode = parseView( templateString );
        let factory = new FewViewUnitFactory( this._parser );
        return factory.createUnit( templateNode );
    }
}
