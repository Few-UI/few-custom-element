// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import http from '../src/http';
import FewView from '../src/few-view';
import { renderToSub } from './test-utils';

describe( 'Test few-view', () => {
    /**
     * Test util for wait specific time
     * @param {number} millionseconds wait time in ms
     * @returns {Promise} promise with result
     */
    function wait( millionseconds ) {
        return new Promise( ( resolve, reject ) => {
            setTimeout( () => {
                resolve( null );
            }, millionseconds );
        } );
    }

    it( 'Verify few-view will display error when testView cannot be loaded', async() => {
        let actualType = null;
        let actualUrl = null;
        let mockXHR = null;

        spyOn( window, 'XMLHttpRequest' ).and.callFake( () => {
            return mockXHR;
        } );

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
        let promise = renderToSub( FewView.tag, { src: 'testView' } );
        mockXHR.onloadend();
        const elem = await promise;

        expect( elem.outerHTML ).toEqual( '<few-view src="testView"><div><code style="color:red">testView.yml: httpGet(testView.yml) =&gt; 404: Not Found</code></div></few-view>' );
    } );

    it( 'Verify few-view will display error when component definition cannot be parsed', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            '    <div>${testVal}</div>',
            'model',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        // There is no way to error out - the error is in Custom Element call back
        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );
        expect( elem.outerHTML ).toMatch( /^<few-view src="testView"><div><code style="color:red">testView.yml: YAMLException:.*/ );
    } );

    it( 'Verify few-view can be rendered correctly for simple value in model', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        expect( elem.outerHTML ).toEqual( '<few-view src="testView"><div class="few-scope"><div>5</div></div></few-view>' );
    } );

    it( 'Verify few-view can be rendered correctly for simple value in model', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        expect( elem.outerHTML ).toEqual( '<few-view src="testView"><div class="few-scope"><div>5</div></div></few-view>' );
    } );

    it( 'Verify few-view can be rendered correctly for simple value in model', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        expect( elem.outerHTML ).toEqual( '<few-view src="testView"><div class="few-scope"><div>5</div></div></few-view>' );
    } );

    it( 'Verify few-view can be updated while changing view attribute', async() => {
        let firstViewContent = [
            'view:',
            '  template:',
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ];

        let secondViewContent = [
            'view:',
            '  template:',
            '    <code style="${newStyle}">${testVal}</div>',
            'model:',
            ' newStyle: "color:red"',
            ' testVal: 7'
        ];

        spyOn( http, 'get' ).and.callFake( ( url ) => {
            if ( url === 'firstView.yml' ) {
                return Promise.resolve( firstViewContent.join( '\n' ) );
            } else if ( url === 'secondView.yml' ) {
                return Promise.resolve( secondViewContent.join( '\n' ) );
            }
        } );

        const elem  = await renderToSub( FewView.tag, { src: 'firstView' } );

        expect( elem.outerHTML ).toEqual( '<few-view src="firstView"><div class="few-scope"><div>5</div></div></few-view>' );

        elem.setAttribute( 'src', 'secondView' );

        // TODO: No good way to assert for now, need to find a way later
        await wait( 1000 );

        expect( elem.outerHTML ).toEqual( '<few-view src="secondView"><div class="few-scope"><code style="color:red">7</code></div></few-view>' );
    } );

    it( 'Verify few-view can be rendered correctly with model from parent', async() => {
        let parentViewContent = [
            'view:',
            '  template:',
            '    <div>${ctx.testVal}</div>',
            '    <few-view src="subView" model="ctx"></few-view>',
            'model:',
            '  ctx:',
            '    testVal: 5'
        ];

        let subViewContent = [
            'view:',
            '  template:',
            '    <code>${testVal}</div>',
            'model:',
            '  dummy: 7'
        ];

        spyOn( http, 'get' ).and.callFake( ( url ) => {
            if ( url === 'parentView.yml' ) {
                return Promise.resolve( parentViewContent.join( '\n' ) );
            } else if ( url === 'subView.yml' ) {
                return Promise.resolve( subViewContent.join( '\n' ) );
            }
        } );

        const elem  = await renderToSub( FewView.tag, { src: 'parentView' } );

        expect( elem.outerHTML ).toEqual( '<few-view src="parentView"><div class="few-scope"><div>5</div> <few-view src="subView" model="ctx"><div class="few-scope"><code>5</code></div></few-view></div></few-view>' );
    } );
} );
