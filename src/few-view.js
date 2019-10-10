/* eslint-env es6 */
import { parseView } from './few-utils';
import viewUnitFactory from './few-view-unit';

import varUnitFactory from './few-view-var-unit';
import textUnitFactory from './few-view-text-unit';
import condUnitFactory from './few-view-cond-unit';
import eachUnitFactory from './few-view-each-unit';
import nullUnitFactory from './few-view-null-unit';

viewUnitFactory.register( textUnitFactory );
viewUnitFactory.register( nullUnitFactory );
viewUnitFactory.register( eachUnitFactory );
viewUnitFactory.register( condUnitFactory );
viewUnitFactory.register( varUnitFactory );

export default {
    createView: ( templateString, parser ) => viewUnitFactory.createUnit( parseView( templateString ), parser )
};
