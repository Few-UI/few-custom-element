/* eslint-env es6, jasmine */

import http from '../src/http';

describe( 'Test embbed http utility', () => {
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


    it( 'Verify httpGet works fine for 200', async() => {
        mockXHR = {
            open: ( type, url, isAsync ) => {
                actualType = type;
                actualUrl = url;
            },
            send: () => null,
            readyState: 4,
            status: 200,
            responseText: 'testResponse'
        };

        let promise = http.get( 'test' );
        mockXHR.onreadystatechange();
        let actualResponse = await promise;

        expect( actualType ).toEqual( 'GET' );
        expect( actualUrl ).toEqual( 'test' );
        expect( actualResponse ).toEqual( 'testResponse' );
    } );


    it( 'Verify httpGet will error out for 401', async() => {
        mockXHR = {
            open: ( type, url, isAsync ) => {
                actualType = type;
                actualUrl = url;
            },
            send: () => null,
            readyState: 1,
            status: 401,
            statusText: 'Not Found'
        };

        let msg;
        let promise = http.get( 'test' );
        mockXHR.onerror();
        try {
            await promise;
        } catch ( e ) {
            msg = e;
        }
        expect( msg ).toEqual( 'httpGet(test) => 401: Not Found' );
    } );

    it( 'Verify httpGet will error out for 404', async() => {
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

        let msg;
        let promise = http.get( 'test' );
        mockXHR.onreadystatechange();
        mockXHR.onloadend();
        try {
            await promise;
        } catch ( e ) {
            msg = e;
        }
        expect( msg ).toEqual( 'httpGet(test) => 404: Not Found' );
    } );
} );
