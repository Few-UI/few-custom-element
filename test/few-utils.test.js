/* eslint-env es6, jasmine */

import {
    parseView,
    parseViewToDiv,
    evalExpression,
    cloneDeepJsonObject,
    httpGet,
    getFormInput,
    // setComponent
    setComponent,
    getComponent,
    getViewElement
} from '../src/few-utils';

describe( 'Test parseView', () => {
    it( 'Verify parseView can parse DOM correctly', () => {
        let viewHtml = '' +
            '<button>Button1</button>' +
            '<button>Button2</button>';

        expect( parseView( viewHtml ).outerHTML ).toEqual(
            '<div><button>Button1</button><button>Button2</button></div>' );
    } );
} );

describe( 'Test parseViewToDiv', () => {
    it( 'Verify parseViewToDiv can parse view with multiple element', () => {
        let viewHtml = '' +
            '<button>Button1</button>' +
            '<button>Button2</button>';

        expect( parseViewToDiv( viewHtml ).outerHTML ).toEqual(
            '<div><button>Button1</button><button>Button2</button></div>' );
    } );
} );

describe( 'Test evalExpression', () => {
    it( 'Verify evalExpression can fetch value', () => {
        let obj = {
            b: {
                c: 'test'
            }
        };
        expect( evalExpression( 'a.b.c', { a: obj } ) ).toEqual( 'test' );
    } );

    it( 'Verify evalExpression can do basic calculation', () => {
        expect( evalExpression( 'a + b', {
            a: 3,
            b: 2
        } ) ).toEqual( 5 );
    } );

    it( 'Verify evalExpression can evaluate string template', () => {
        // eslint-disable-next-line no-template-curly-in-string
        expect( evalExpression( '`Hello ${val}`', {
            val: 'John'
        } ) ).toEqual( 'Hello John' );
    } );

    it( 'Verify evalExpression can evaluate condition', () => {
        let testObj = {
            prop: {
                user_name: 'Lucy',
                password: 'unset'
            }
        };

        expect( evalExpression( 'selected.prop[prop_name] === "Lucy"', {
            selected: testObj,
            prop_name: 'user_name'
        } ) ).toEqual( true );
    } );

    it( 'Verify evalExpression can error out if syntax error', () => {
        expect( () => evalExpression( 'selected.prop[prop_n', {} ) )
          .toThrowError( /evalExpression\('selected.prop\[prop_n'\) => Unexpected token/ );
    } );

    it( 'Verify evalExpression can error out if runtime error', () => {
        expect( () => evalExpression( 'a.b.c', {
            a: 3
        } ) ).toThrowError( 'evalExpression(\'a.b.c\') => Cannot read property \'c\' of undefined' );
    } );

    it( 'Verify evalExpression can run statement without input', () => {
        expect( evalExpression( '"3"' ) ).toEqual( '3' );
    } );
} );

describe( 'Test cloneDeepJsonObject', () => {
    it( 'Verify cloneDeepJsonObject works correctly with valid input', () => {
        let vm = {
            action: {
                input: '{aaa}',
                output: '{bbb}'
            },
            data: {
                test: {
                    test1: 'ccc'
                }
            }
        };

        expect( cloneDeepJsonObject( vm ) ).toEqual( vm );
    } );

    it( 'Verify cloneDeepJsonObject with undefined', () => {
        expect( cloneDeepJsonObject( undefined ) ).toEqual( undefined );
    } );

    it( 'Verify cloneDeepJsonObject with string', () => {
        expect( cloneDeepJsonObject( 'aaa' ) ).toEqual( 'aaa' );
    } );

    it( 'Verify cloneDeepJsonObject with number', () => {
        expect( cloneDeepJsonObject( 3 ) ).toEqual( 3 );
    } );

    it( 'Verify cloneDeepJsonObject with boolean', () => {
        expect( cloneDeepJsonObject( true ) ).toEqual( true );
    } );

    it( 'Verify cloneDeepJsonObject with array', () => {
        expect( cloneDeepJsonObject( [ 2, 3 ] ) ).toEqual( [ 2, 3 ] );
    } );
} );

describe( 'Test httpGet', () => {
    let actualType;
    let actualUrl;
    let mockXHR;

    beforeEach( function() {
        actualType = null;
        actualUrl = null;

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
        spyOn( window, 'XMLHttpRequest' ).and.returnValue( mockXHR );
    } );


    it( 'Verify httpGet works fine for 200', async() => {
        let promise = httpGet( 'test' );
        mockXHR.onreadystatechange();
        let actualResponse = await promise;

        expect( actualType ).toEqual( 'GET' );
        expect( actualUrl ).toEqual( 'test' );
        expect( actualResponse ).toEqual( 'testResponse' );
    } );
} );

describe( 'Test getFormInput', () => {
    it( 'Verify getFormInput can get text value back', () => {
        expect( getFormInput( parseViewToDiv( '' +
        '<form>' +
          '<input type="text" name="attrA" value="valueA"></input>' +
          '<input type="text" name="attrB" value="valueB"></input>' +
        '</form>'
         ).firstChild ) ).toEqual( {
             attrA: 'valueA',
             attrB: 'valueB'
         } );
    } );
} );

describe( 'Test getComponent/setComponent', () => {
    it( 'Verify setComponent will error out when no input is undefined for element with id', () => {
        let elem = parseViewToDiv( '<div id="test"></div>' ).firstChild;

        expect( () => setComponent( elem ) )
          .toThrowError( 'setComponent(id:test) => componentObj is undefined' );
    } );

    it( 'Verify setComponent will error out when no input is undefined for element without id', () => {
        let elem = parseViewToDiv( '<test-e></test-e>' ).firstChild;

        expect( () => setComponent( elem ) )
          .toThrowError( 'setComponent(TEST-E) => componentObj is undefined' );
    } );

    it( 'Verify setComponent/getComonent works correctly when componentObj is defined', () => {
        let elem = parseViewToDiv( '<test-e><sub-e></sub-e></test-e>' ).firstChild;
        let subElem = elem.firstChild;

        setComponent( elem, { a: 3 } );

        expect( getComponent( elem ) ).toEqual( { a: 3 } );
        expect( getComponent( subElem ) ).toEqual( { a: 3 } );
    } );

    it( 'Verify getComonent works correctly will get nothing for elem which is not setup correctly', () => {
        let elem = parseViewToDiv( '<test-e><sub-e></sub-e></test-e>' ).firstChild;
        expect( getComponent( elem ) ).not.toBeDefined();
    } );

    it( 'Verify setComponent/getComonent works correctly for multi level component', () => {
        let topComponent = parseViewToDiv( '' +
        '<top-component>' +
            '<top-div></top-div>' +
            '<sub-component>' +
                '<sub-div></sub-div>' +
            '</sub-component>' +
        '</top-component>'
        ).firstChild;
        let topDiv = topComponent.firstChild;
        let subComponent = topComponent.lastChild;
        let subDiv = subComponent.firstChild;

        setComponent( topComponent, { a: 3 } );
        setComponent( subComponent, { b: 4 } );

        expect( getComponent( topDiv ) ).toEqual( { a: 3 } );
        expect( getComponent( subDiv ) ).toEqual( { b: 4 } );
    } );

    it( 'Verify getViewElement works correctly will get nothing for elem which is not setup correctly', () => {
        let elem = parseViewToDiv( '<test-e><sub-e></sub-e></test-e>' ).firstChild;
        expect( getViewElement( elem ) ).not.toBeDefined();
    } );

    it( 'Verify getViewElement works correctly for multi level component', () => {
        let topView = parseViewToDiv( '' +
        '<few-view>' +
            '<div>' +
                '<top-div></top-div>' +
                '<few-view>' +
                    '<div>' +
                        '<sub-div></sub-div>' +
                    '</div>' +
                '</few-view>' +
            '</div>' +
        '</few-view>'
        ).firstChild;
        let topComponent = topView.firstChild;
        let topDiv = topComponent.firstChild;

        let subView = topComponent.lastChild;
        let subComponent = subView.lastChild;
        let subDiv = subComponent.firstChild;

        setComponent( topComponent, { a: 3 } );
        setComponent( subComponent, { b: 4 } );

        expect( getViewElement( subDiv ) ).toEqual( subView );
        expect( getViewElement( subView ) ).toEqual( topView );
        expect( getViewElement( topDiv ) ).toEqual( topView );
    } );
} );
