// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
import { wait } from './test-utils';

describe( 'Test f-each in few-view', () => {
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

    it( 'Verify f-each can render data array correctly', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div f-each="item of items">${item.type}</div>',
            'model:',
            '  items:',
            '    - type: apple',
            '    - type: banana'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( viewElem.innerHTML ).toEqual( '<div>apple</div><div>banana</div>' );
    } );

    xit( 'Verify f-each can be rendered with siblings', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div f-each="item of items">${item.type}</div>',
            '    <div>${testText}</div>',
            'model:',
            '  items:',
            '    - type: apple',
            '    - type: banana',
            '  testText: sibling'
        ];

        let componentDef = yaml.load( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        let viewElem = await component.createView( componentDef.view );

        expect( viewElem.innerHTML ).toEqual( '<div>apple</div><div>banana</div><div>sibling</div>' );
    } );
} );
