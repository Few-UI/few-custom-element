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
            '      testVal: 7'
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
            'action:',
            '  testAction1:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: 7',
            '    output:',
            '      testVal: 7',
            '  testAction2:',
            '    name: "$few_test.plusOne"',
            '    input:',
            '      val: ${scope}',
            '    output:',
            '      testVal: 7',
            '  testAction:',
            '    - action.testAction1',
            '    - action.testAction2'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        expect( await component.update( 'action.testAction' ) ).toEqual( 8 );

        expect( component._vm.model.testVal ).toEqual( 8 );
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
            '      testVal: 7'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        // View has too be initialized separately since it is async
        let viewElem = await component.createView( componentDef.view );

        expect( await component.update( 'action.testAction' ) ).toEqual( 7 );

        expect( component._vm.model.testVal ).toEqual( 7 );

        // TODO: No good way to assert for now, need to find a way to avoid using wait later
        await wait( 500 );
        expect( viewElem.firstChild.outerHTML ).toEqual( '<div>7</div>' );
    } );
} );
