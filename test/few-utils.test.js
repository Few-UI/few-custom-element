/* eslint-env es6, jasmine */

import {
    parseView,
    parseViewToDiv,
    evalExpression,
    cloneDeepJsonObject,
    httpGet
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
    let actualType, actualUrl, mockXHR;
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
