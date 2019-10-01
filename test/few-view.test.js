// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import FewView from '../src/few-view';
import { renderToSub } from './test-utils';

describe( 'Test few-view', () => {
    let actualType;
    let actualUrl;
    let mockXHR;

    beforeEach( function() {
        actualType = null;
        actualUrl = null;
        spyOn( window, 'XMLHttpRequest' ).and.callFake( () => {
            return mockXHR;
        } );
    } );

    it( 'Verify few-view is not interpreted when testView cannot be loaded', async() => {
        mockXHR = {
            open: ( type, url, isAsync ) => {
                actualType = type;
                actualUrl = url;
            },
            send: () => null,
            readyState: 4,
            status: 404,
            statusText: 'Not Found'
        };

        // There is no way to error out - the error is in Custom Element call back
        let promise = renderToSub( FewView.tag, { view: 'testView' } );
        mockXHR.onloadend();
        const elem = await promise;

        expect( elem.outerHTML ).toEqual( '<few-view view="testView"><div><code style="color:red">testView.yml: httpGet(testView.yml) =&gt; 404: Not Found</code></div></few-view>' );
    } );
} );
