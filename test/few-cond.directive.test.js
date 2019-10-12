// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import YAML from 'yaml';
import FewComponent from '../src/few-component';
import { wait } from './test-utils';

describe( 'Test f-cond in few-view', () => {
    let rootElem;

    beforeEach( () =>{
        window.$few_test = {
            setValue: ( val ) => {
                return val;
            },
            plusOne: ( val ) => {
                return val + 1;
            }
        };

        rootElem = document.createElement( 'div' );
        document.body.appendChild( rootElem );
    } );

    afterEach( () => {
        delete window.$few_test;
        document.body.removeChild( rootElem );
    } );

    it( 'Verify f-cond works corretly for simple element', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div f-cond="testBoolean">Hello</div>',
            'model:',
            '  testBoolean: false',
            'action:',
            '  testAction:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: "${!testBoolean}"',
            '    output:',
            '      testBoolean: ""'
        ];

        let componentDef = YAML.parse( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        await component.createView( componentDef.view );

        component.attachViewToPage( rootElem );

        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-cond testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( rootElem.firstChild.innerHTML ).toEqual( '<div>Hello</div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-cond testBoolean = false-->' );
    } );

    it( 'Verify f-cond works corretly for element with expression', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div f-cond="testBoolean">${testVal}</div>',
            'model:',
            '  testBoolean: true',
            '  testVal: 5',
            'action:',
            '  toggle:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: "${!testBoolean}"',
            '    output:',
            '      testBoolean: ""',
            '  updateVal:',
            '    name: "$few_test.plusOne"',
            '    input:',
            '      val: "${testVal}"',
            '    output:',
            '      testVal: ""',
            '  testAction:',
            '    - updateVal',
            '    - toggle'
        ];

        let componentDef = YAML.parse( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        await component.createView( componentDef.view );

        component.attachViewToPage( rootElem );

        expect( rootElem.firstChild.innerHTML ).toEqual( '<div>5</div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-cond testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( rootElem.firstChild.innerHTML ).toEqual( '<div>7</div>' );
    } );

    it( 'Verify f-cond works corretly for nested element', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div f-cond="testBoolean"><code style="color:blue">${testMsg}</code></div>',
            'model:',
            '  testBoolean: false',
            '  testMsg: hello',
            'action:',
            '  testAction:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: "${!testBoolean}"',
            '    output:',
            '      testBoolean: ""'
        ];

        let componentDef = YAML.parse( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        await component.createView( componentDef.view );

        component.attachViewToPage( rootElem );

        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-cond testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( rootElem.firstChild.innerHTML ).toEqual( '<div><code style="color:blue">hello</code></div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-cond testBoolean = false-->' );
    } );
} );
