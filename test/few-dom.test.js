// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import FewDom from '../src/few-dom';
import { parseViewToDiv } from '../src/few-utils';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-dom', () => {
    it( 'Verify few-dom create node correct for simple DOM', async() => {
        expect( FewDom.createFewDom( parseViewToDiv( '' ), new StringTemplateParser() ).toJson() ).toEqual( {
            tagName: 'DIV',
            props: {},
            values: {},
            children: [],
            hasExpr: false,
            reference: '<div></div>'
        } );
    } );
} );
