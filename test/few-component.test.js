// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
import fewViewFactory from '../src/few-view-factory';
import { wait } from './test-utils';

describe( 'Test few-component', () => {
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

    afterEach( () =>{
        delete window.$few_test;
        document.body.removeChild( docElem );
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
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent();

        await component.initComponent( componentDef );

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
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${scope}',
            '    output:',
            '      testVal: ""',
            '  testAction:',
            '    - action.testAction1',
            '    - action.testAction2'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent();

        await component.initComponent( componentDef );

        expect( await component.update( 'action.testAction' ) ).toEqual( 8 );

        expect( component._vm.model.testVal ).toEqual( 8 );

        // verify the default scope is not overwritten
        expect( component._vm.model.scope ).toEqual( 9 );
    } );

    it( 'Verify few-component can execute action and update view', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
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
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent();

        await component.initComponent( componentDef );

        component.attachViewToPage( docElem );

        expect( await component.update( 'action.testAction' ) ).toEqual( 7 );

        expect( component._vm.model.testVal ).toEqual( 7 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>7</div>' );
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
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent();

        await component.initComponent( componentDef );

        component.attachViewToPage( docElem );

        expect( await component.update( 'testAction' ) ).toEqual( 6 );

        expect( component._vm.model.testVal ).toEqual( 6 );

        await wait( 100 );

        expect( docElem.outerHTML ).toEqual( [
            '<div class="few-scope">',
              '<div>6</div>',
            '</div>'
        ].join( '' ) );
    } );
} );
