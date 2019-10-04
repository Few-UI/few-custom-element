// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
import { wait } from './test-utils';

describe( 'Test few-component', () => {
    beforeEach( () =>{
        window.$few_test = {
            setValue: ( val ) => {
                return val;
            },
            plusOne: ( val ) => {
                return val + 1;
            }
        };
    } );

    afterEach( () =>{
        delete window.$few_test;
    } );

    it( 'Verify few-component can execute action without view', async() => {
        let componentContent = [
            'model:',
            '  testVal: 5',
            'action:',
            '  testAction:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: 7',
            '    output:',
            '      testVal: ""'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        expect( await component.update( 'action.testAction' ) ).toEqual( 7 );

        expect( component._vm.model.testVal ).toEqual( 7 );
    } );

    it( 'Verify few-component can execute action with scope', async() => {
        let componentContent = [
            'model:',
            '  testVal: 5',
            '  scope: 9',
            'action:',
            '  testAction1:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: 7',
            '    output:',
            '      testVal: ""',
            '  testAction2:',
            '    name: "$few_test.plusOne"',
            '    input:',
            '      val: ${scope}',
            '    output:',
            '      testVal: ""',
            '  testAction:',
            '    - action.testAction1',
            '    - action.testAction2'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        expect( await component.update( 'action.testAction' ) ).toEqual( 8 );

        expect( component._vm.model.testVal ).toEqual( 8 );

        // verify the default scope is not overwritten
        expect( component._vm.model.scope ).toEqual( 9 );
    } );

    it( 'Verify few-component can execute action and update view', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div>${testVal}</div>',
            'model:',
            '  testVal: 5',
            'action:',
            '  testAction:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: 7',
            '    output:',
            '      testVal: ""'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( await component.update( 'action.testAction' ) ).toEqual( 7 );

        expect( component._vm.model.testVal ).toEqual( 7 );

        // TODO: No good way to assert for now, need to find a way to avoid using wait later
        await wait( 500 );
        expect( viewElem.innerHTML ).toEqual( '<div>7</div>' );
    } );

    it( 'Verify few-component can execute action with different options', async() => {
        let pattern = '/^\\s*{{\\s*([\\S\\s\\r\\n]*)\\s*}}\\s*$/m';
        let componentContent = [
            'view:',
            '  template:',
            '    <div>{{testVal}}</div>',
            'model:',
            '  testVal: 5',
            'provider:',
            '  testAction:',
            '    name: "$few_test.plusOne"',
            '    input:',
            '      val: "{{testVal}}"',
            '    output:',
            '      testVal: ""',
            'option:',
            '  stringTemplate:',
            `    pattern: '${pattern}'`,
            '    index: 1',
            '  actionPaths:',
            '    - action',
            '    - provider'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( await component.update( 'testAction' ) ).toEqual( 6 );

        expect( component._vm.model.testVal ).toEqual( 6 );

        // TODO: No good way to assert for now, need to find a way to avoid using wait later
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<div>6</div>' );
    } );
} );

describe( 'Test v-if in few-view', () => {
    beforeEach( () =>{
        window.$few_test = {
            setValue: ( val ) => {
                return val;
            },
            plusOne: ( val ) => {
                return val + 1;
            }
        };
    } );

    it( 'Verify v-if works corretly for simple element', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div v-if="testBoolean">Hello</div>',
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

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( viewElem.innerHTML ).toEqual( '<!--v-if testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<div>Hello</div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<!--v-if testBoolean = false-->' );
    } );

    it( 'Verify v-if works corretly for element with expression', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div v-if="testBoolean">${testVal}</div>',
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

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( viewElem.innerHTML ).toEqual( '<div>5</div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<!--v-if testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<div>7</div>' );
    } );

    it( 'Verify v-if works corretly for nested element', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div v-if="testBoolean"><code style="color:blue">${testMsg}</code></div>',
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

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( viewElem.innerHTML ).toEqual( '<!--v-if testBoolean = false-->' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( true );
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<div><code style="color:blue">hello</code></div>' );

        // toggle
        expect( await component.update( 'testAction' ) ).toEqual( false );
        await wait( 200 );
        expect( viewElem.innerHTML ).toEqual( '<!--v-if testBoolean = false-->' );
    } );
} );
