// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';

describe( 'Test f-each in few-view', () => {
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

        let componentDef = yaml.safeLoad( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        await component.createView( componentDef.view );

        component.attachViewToPage( rootElem );

        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-each(item of items)--><div>apple</div><div>banana</div>' );
    } );

    it( 'Verify f-each can be rendered with siblings', async() => {
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

        let componentDef = yaml.safeLoad( componentContent.join( '\n' ) );

        let component = new FewComponent( null, componentDef );

        await component.createView( componentDef.view );

        component.attachViewToPage( rootElem );

        expect( rootElem.firstChild.innerHTML ).toEqual( '<!--f-each(item of items)--><div>apple</div><div>banana</div> <div>sibling</div>' );
    } );
} );
