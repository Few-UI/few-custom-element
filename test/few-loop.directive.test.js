// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
import { wait } from './test-utils';

describe( 'Test v-for in few-view', () => {
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

    it( 'Verify v-for can render data array correctly', async() => {
        let componentContent = [
            'view:',
            '  template:',
            '    <div v-for="item of items">${item.type}</div>',
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
} );
