/* eslint-env es6 */

import few from './few-global';
import { parseView } from './few-utils';
import viewUnitFactory from './few-view-unit';

import varUnitFactory from './few-view-var-unit';
import textUnitFactory from './few-view-text-unit';
import condUnitFactory from './few-view-cond-unit';
import eachUnitFactory from './few-view-each-unit';
import nullUnitFactory from './few-view-null-unit';


// Unit
viewUnitFactory.addFactory( textUnitFactory );
viewUnitFactory.addFactory( nullUnitFactory );
viewUnitFactory.addFactory( eachUnitFactory );
viewUnitFactory.addFactory( condUnitFactory );
viewUnitFactory.addFactory( varUnitFactory );

/**
 * create view for current view model
 * @param {Object} view view input
 * @param {Object} parser String parser
 * @returns {Promise} promise with view element
 */
async function createView( view, parser ) {
    await few.load( view.import ? view.import : [] );

    return viewUnitFactory.createUnit( parseView( view.template ), parser );
}

export default {
    createUnit: ( templateString, parser ) => viewUnitFactory.createUnit( parseView( templateString ), parser ),
    createView
};
