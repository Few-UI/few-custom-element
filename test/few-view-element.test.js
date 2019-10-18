// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import http from '../src/http';
import FewView from '../src/few-view-element';
import { renderToSub, wait } from './test-utils';

describe( 'Test few-view', () => {
    beforeEach( () => {
       let mySpy = spyOn( FewView.prototype, 'attributeChangedCallback' ).and.callFake( async function( name, oldValue, newValue ) {
            try {
                // eslint-disable-next-line no-invalid-this
                return await mySpy.and.callThrough().apply( this, [ name, oldValue, newValue ] );
            } catch( e ) {
                // console.log( e );
            }
        } );
    } );

    it( 'Verify few-view will display error when testView cannot be loaded', async() => {
        // let actualType = null;
        // let actualUrl = null;
        let mockXHR = null;

        spyOn( window, 'XMLHttpRequest' ).and.callFake( () => {
            return mockXHR;
        } );


        mockXHR = {
            open: ( /*type, url*/ ) => {
                // actualType = type;
                // actualUrl = url;
            },
            send: () => null,
            readyState: 4,
            status: 404,
            statusText: 'Not Found'
        };

        // There is no way to error out - the error is in Custom Element call back
        let promise = renderToSub( FewView.tag, { src: 'testView' } );
        // NOTE: this is not needed before when use native browser
        await wait( 200 );
        mockXHR.onloadend();
        await wait( 200 );
        let elem = await promise;

        expect( elem.outerHTML ).toEqual( '<few-view src="testView"><div><code style="color:red">testView.yml: httpGet(testView.yml) =&gt; 404: Not Found</code></div></few-view>' );
    } );

    it( 'Verify few-view will display error when component definition cannot be parsed', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        // There is no way to error out - the error is in Custom Element call back
        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );
        expect( elem.outerHTML ).toMatch( /^<few-view src="testView"><div><code style="color:red">testView.yml: YAMLSemanticError:.*/ );
    } );

    it( 'Verify few-view still display when value is undefined', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            ' testVal3: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        // There is no way to error out - the error is in Custom Element call back
        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        await wait( 500 );
        expect( elem.outerHTML ).toMatch( '<few-view src="testView"><div class="few-scope"><div></div></div></few-view>' );
    } );

    it( 'Verify few-view can be rendered correctly for simple value in model', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        expect( elem.outerHTML ).toEqual( '<few-view src="testView"><div class="few-scope"><div>5</div></div></few-view>' );
    } );

    it( 'Verify few-view will leave isolate scope not to be evaluated', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div class="few-scope"><div>${testVal}</div></div>',
            'model:',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        // eslint-disable-next-line no-template-curly-in-string
        expect( elem.firstChild.innerHTML ).toEqual( '<div>5</div> <div class="few-scope"><div>${testVal}</div></div>' );
    } );

    it( 'Verify few-view will ignore element with f-ignore', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div f-ignore><div>${testVal}</div></div>',
            'model:',
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        const elem  = await renderToSub( FewView.tag, { src: 'testView' } );

        // eslint-disable-next-line no-template-curly-in-string
        expect( elem.firstChild.innerHTML ).toEqual( '<div>5</div> <div f-ignore=""><div>${testVal}</div></div>' );
    } );

    it( 'Verify few-view can be updated while changing view attribute', async() => {
        let firstViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ];

        let secondViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
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

        // TODO: No good way to assert for now, need to find a way to avoid using wait later
        await wait( 1000 );
        expect( elem.outerHTML ).toEqual( '<few-view src="secondView"><div class="few-scope"><code style="color:red">7</code></div></few-view>' );
    } );

    it( 'Verify few-view can be rendered correctly with model from parent', async() => {
        let parentViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${ctx.testVal}</div>',
            '    <few-view src="subView" model="ctx"></few-view>',
            'model:',
            '  ctx:',
            '    testVal: 5'
        ];

        let subViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
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

        await wait( 200 );

        expect( elem.outerHTML ).toEqual( '<few-view src="parentView"><div class="few-scope"><div>5</div> <few-view src="subView" model="ctx"><div class="few-scope"><code>5</code></div></few-view></div></few-view>' );
    } );
} );
