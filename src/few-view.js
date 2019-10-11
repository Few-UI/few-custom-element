/* eslint-env es6 */
import { parseView } from './few-utils';
import viewUnitFactory from './few-view-unit';

import varUnitFactory from './few-view-var-unit';
import textUnitFactory from './few-view-text-unit';
import condUnitFactory from './few-view-cond-unit';
import eachUnitFactory from './few-view-each-unit';
import nullUnitFactory from './few-view-null-unit';

import popupDirective from './few-pop-up.directive';
import redLineDirective from './few-red-line.directive';

// Unit
viewUnitFactory.addFactory( textUnitFactory );
viewUnitFactory.addFactory( nullUnitFactory );
viewUnitFactory.addFactory( eachUnitFactory );
viewUnitFactory.addFactory( condUnitFactory );
viewUnitFactory.addFactory( varUnitFactory );

// Directive
viewUnitFactory.addDirective( redLineDirective );
viewUnitFactory.addDirective( popupDirective );

export default {
    createView: ( templateString, parser ) => viewUnitFactory.createUnit( parseView( templateString ), parser )
};
