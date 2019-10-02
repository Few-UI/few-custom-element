// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import FewDom from '../src/few-dom';
import { parseViewToDiv } from '../src/few-utils';

xdescribe( 'Test few-dom', () => {
    it( 'Verify few-dom create node correct for simple DOM', async() => {
        expect( FewDom.createFewDom( parseViewToDiv( '' ) ) );
    } );
} );
