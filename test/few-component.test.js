// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
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

        let component = new FewComponent( componentDef );

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
            '    then:',
            '      - action.testAction1',
            '      - action.testAction2'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

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

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        expect( await component.update( 'action.testAction' ) ).toEqual( 7 );

        expect( component._vm.model.testVal ).toEqual( 7 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>7</div>' );
    } );

    it( 'Test then action', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            '  testVal: 5',
            'action:',
            '  subAction1:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: 7',
            '  subAction2:',
            '    name: "$few_test.setValue"',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${scope + 1}',
            '    output:',
            '      testVal: ""',
            '  testAction:',
            '    then:',
            '      - subAction1',
            '      - subAction2'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        expect( await component.update( 'action.testAction' ) ).toEqual( 8 );

        expect( component._vm.model.testVal ).toEqual( 8 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>8</div>' );
    } );

    it( 'Test then action with condition', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            '  testVal: 5',
            'action:',
            '  subAction1:',
            '    name: "$few_test.setValue"',
            '    input:',
            '      val: 7',
            '  subAction2:',
            '    name: "$few_test.setValue"',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${scope + 1}',
            '    output:',
            '      testVal: ""',
            '  testAction:',
            // eslint-disable-next-line no-template-curly-in-string
            '    when: ${scope}',
            '    then:',
            '      - subAction1',
            '      - subAction2'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        expect( await component.update( 'action.testAction', false ) );

        expect( component._vm.model.testVal ).toEqual( 5 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>5</div>' );

        expect( await component.update( 'action.testAction', true ) ).toEqual( 8 );

        expect( component._vm.model.testVal ).toEqual( 8 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>8</div>' );
    } );

    it( 'Verify action with condition', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            '  testVal: 5',
            'action:',
            '  testAction:',
            '    name: $few_test.setValue',
            // eslint-disable-next-line no-template-curly-in-string
            '    when: ${scope.enable}',
            '    input:',
            '      val: 7',
            '    output:',
            '      testVal: ""'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        await component.update( 'testAction', { enable: false } );

        expect( component._vm.model.testVal ).toEqual( 5 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>5</div>' );

        expect( await component.update( 'testAction', { enable: true } ) ).toEqual( 7 );

        expect( component._vm.model.testVal ).toEqual( 7 );

        await wait( 100 );
        expect( docElem.innerHTML ).toEqual( '<div>7</div>' );
    } );

    it( 'Verify few-component will print correct error when action not found', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

        try {
            await component.update( 'action.testAction' );
        } catch( e ) {
            expect( e.message ).toEqual( 'FewComponent.update => action "action.testAction" not found!' );
        }
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

        let component = new FewComponent( componentDef );

        await component.render( componentDef.view, docElem );

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


