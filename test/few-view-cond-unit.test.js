// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
import fewViewFactory from '../src/few-view-factory';
import { wait } from './test-utils';

describe( 'Test f-when in few-view', () => {
    let docElem;

    beforeEach( () =>{
        window.$few_test = {
            setValue: ( val ) => {
                return val;
            },
            plusOne: ( val ) => {
                return val + 1;
            }
        };

        docElem = document.createElement( 'div' );
        document.body.appendChild( docElem );
    } );

    afterEach( () => {
        delete window.$few_test;
        document.body.removeChild( docElem );
    } );

    it( 'Verify f-when works corretly for simple element', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div f-when="testBoolean">Hello</div>',
            'model:',
            '  testBoolean: false',
            'action:',
            '  testAction:',
            '    name: "$few_test.setValue"',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: "${!testBoolean}"',
            '    output:',
            '      testBoolean: ""'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        expect( docElem.innerHTML ).toEqual( '<!--f-when testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<div>Hello</div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<!--f-when testBoolean = false-->' );
    } );

    it( 'Verify f-when works corretly for element with expression', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div f-when="testBoolean">${testVal}</div>',
            'model:',
            '  testBoolean: true',
            '  testVal: 5',
            'action:',
            '  toggle:',
            '    name: "$few_test.setValue"',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${!testBoolean}',
            '    output:',
            '      testBoolean: ""',
            '  updateVal:',
            '    name: "$few_test.plusOne"',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${testVal}',
            '    output:',
            '      testVal: ""',
            '  testAction:',
            '    then:',
            '      - updateVal',
            '      - toggle'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<div>5</div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<!--f-when testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<div>7</div>' );
    } );

    it( 'Verify f-when works corretly for nested element', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div f-when="testBoolean"><code style="color:blue">${testMsg}</code></div>',
            'model:',
            '  testBoolean: false',
            '  testMsg: hello',
            'action:',
            '  testAction:',
            '    name: "$few_test.setValue"',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: "${!testBoolean}"',
            '    output:',
            '      testBoolean: ""'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        expect( docElem.innerHTML ).toEqual( '<!--f-when testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<div><code style="color:blue">hello</code></div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( docElem.innerHTML ).toEqual( '<!--f-when testBoolean = false-->' );
    } );
} );
