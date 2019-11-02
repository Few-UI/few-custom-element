// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import http from '../src/http';
import FewView from '../src/few-view';
import { wait } from './test-utils';
import { parseView } from '../src/few-utils';


describe( 'Test few-view element', () => {
    let docElem;
    beforeEach( () => {
       let mySpy = spyOn( FewView.prototype, 'attributeChangedCallback' ).and.callFake( async function( name, oldValue, newValue ) {
            try {
                // eslint-disable-next-line no-invalid-this
                return await mySpy.and.callThrough().apply( this, [ name, oldValue, newValue ] );
            } catch( e ) {
                // console.log( e );
            }
        } );

        docElem = document.createElement( 'div' );
        document.body.appendChild( docElem );
    } );

    afterEach( () => {
        document.body.removeChild( docElem );
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

        docElem.appendChild( parseView( [
            '<few-view src="testView"></few-view>'
        ].join( '' ) ) );

        await wait( 50 );
        mockXHR.onloadend();
        await wait( 50 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<few-view src="testView">',
              '<div>',
                '<code style="color:red">',
                  'testView.yml: httpGet(testView.yml) =&gt; 404: Not Found',
                '</code>',
              '</div>',
            '</few-view>'
        ].join( '' ) );
    } );

    it( 'Verify few-view will display error when component definition cannot be parsed', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model',
            ' testVal: 5'
        ].join( '\n' );

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent ) );

        docElem.appendChild( parseView( [
            '<few-view src="testView"></few-view>'
        ].join( '' ) ) );

        await wait( 50 );

        expect( docElem.firstChild.innerHTML ).toMatch( /^<few-view src="testView"><div><code style="color:red">testView.yml: YAMLException:.*/ );
    } );

    it( 'Verify few-view still display when value is undefined', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            ' testVal3: 5'
        ].join( '\n' );

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent ) );

        docElem.appendChild( parseView( [
            '<few-view src="testView"></few-view>'
        ].join( '' ) ) );

        await wait( 150 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<few-view src="testView" id="testView" class="few-scope">',
              '<div></div>',
            '</few-view>'
        ].join( '' ) );
    } );

    it( 'Verify few-view can be rendered correctly for simple value in model', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            ' testVal: 5'
        ].join( '\n' );

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent ) );

        docElem.appendChild( parseView( [
            '<few-view src="testView"></few-view>'
        ].join( '' ) ) );

        await wait( 150 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<few-view src="testView" id="testView" class="few-scope">',
              '<div>5</div>',
            '</few-view>'
        ].join( '' ) );
    } );

    it( 'Verify few-view will leave isolate scope not to be evaluated', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            [
                '    ',
                // eslint-disable-next-line no-template-curly-in-string
                '<div>${testVal}</div>',
                // eslint-disable-next-line no-template-curly-in-string
                '<div class="few-scope"><div>${testVal}</div></div>'
            ].join( '' ),
            'model:',
            ' testVal: 5'
        ].join( '\n' );

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent ) );

        docElem.appendChild( parseView( [
            '<few-view src="testView"></few-view>'
        ].join( '' ) ) );

        await wait( 150 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<few-view src="testView" id="testView" class="few-scope">',
              '<div>5</div>',
              '<div class="few-scope">',
                // eslint-disable-next-line no-template-curly-in-string
                '<div>${testVal}</div>',
              '</div>',
            '</few-view>' ].join( '' ) );
    } );

    it( 'Verify few-view will ignore element with f-ignore', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            [
                '    ',
                // eslint-disable-next-line no-template-curly-in-string
                '<div>${testVal}</div>',
                // eslint-disable-next-line no-template-curly-in-string
                '<div f-ignore><div>${testVal}</div></div>'
            ].join( '' ),
            'model:',
            '  testVal: 5'
        ].join( '\n' );

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent ) );

        docElem.appendChild( parseView( [
            '<few-view src="testView"></few-view>'
        ].join( '' ) ) );

        await wait( 150 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<few-view src="testView" id="testView" class="few-scope">',
              '<div>5</div>',
              '<div f-ignore="">',
                // eslint-disable-next-line no-template-curly-in-string
                '<div>${testVal}</div>',
              '</div>',
            '</few-view>' ].join( '' ) );
    } );

    it( 'Verify few-view can be updated while changing view attribute', async() => {
        let firstViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            '  testVal: 5'
        ].join( '\n' );

        let secondViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <code style="${newStyle}">${testVal}</div>',
            'model:',
            '  newStyle: "color:red"',
            '  testVal: 7'
        ].join( '\n' );

        spyOn( http, 'get' ).and.callFake( ( url ) => {
            if ( url === 'firstView.yml' ) {
                return Promise.resolve( firstViewContent );
            } else if ( url === 'secondView.yml' ) {
                return Promise.resolve( secondViewContent );
            }
        } );

        docElem.appendChild( parseView( [
            '<few-view src="firstView" id="change"></few-view>'
        ].join( '' ) ) );

        await wait( 150 );

        let elem = docElem.firstChild.firstChild;
        expect( elem.outerHTML ).toEqual( [
            '<few-view src="firstView" id="change" class="few-scope">',
              '<div>5</div>',
            '</few-view>'
        ].join( '' ) );

        elem.setAttribute( 'src', 'secondView' );
        await wait( 200 );

        expect( elem.outerHTML ).toEqual( [
            '<few-view src="secondView" id="change" class="few-scope">',
              '<code style="color:red">7</code>',
            '</few-view>'
        ].join( '' ) );
    } );

    // TODO: Cannot run properly because of polyfill
    xit( 'Verify few-view can be rendered correctly with model from parent', async() => {
        let parentViewContent = [
            'view:',
            '  template:',
            [
                '    ',
                // eslint-disable-next-line no-template-curly-in-string
                '<div>${ctx.testVal}</div>',
                // eslint-disable-next-line no-template-curly-in-string
                '<few-view src="subView" f-pval="${ctx.testVal}"></few-view>'
            ].join( '' ),
            'model:',
            '  ctx:',
            '    testVal: 5'
        ];

        let subViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <code>${pval}</div>',
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

        docElem.appendChild( parseView( [
            '<few-view src="parentView"></few-view>'
        ].join( '' ) ) );

        await wait( 200 );

        let elem = docElem.firstChild.firstChild;
        expect( elem.outerHTML ).toEqual( [
            '<few-view src="parentView" id="parentView" class="few-scope">',
              '<div>5</div>',
              '<few-view src="subView" id="subView" class="few-scope">',
                '<code>5</code>',
              '</few-view>',
            '</few-view>'
        ].join( '' ) );
    } );
} );
