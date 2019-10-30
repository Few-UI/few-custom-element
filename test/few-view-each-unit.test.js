// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import yaml from 'js-yaml';
import FewComponent from '../src/few-component';
import fewViewFactory from '../src/few-view-factory';

describe( 'Test f-each in few-view', () => {
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

    it( 'Verify f-each can render data array correctly', async() => {
        let componentContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div f-each="item of items">${item.type}</div>',
            'model:',
            '  items:',
            '    - type: apple',
            '    - type: banana'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent();

        await component.initComponent( componentDef );

        component.attachViewToPage( docElem );

        expect( docElem.innerHTML ).toEqual( [
            '<!--f-each(item of items)-->',
            '<div>apple</div>',
            '<div>banana</div>'
        ].join( '' ) );
    } );

    it( 'Verify f-each can be rendered with siblings', async() => {
        let componentContent = [
            'view:',
            '  template:',
            [
                '    ',
                // eslint-disable-next-line no-template-curly-in-string
                '<div f-each="item of items">${item.type}</div>',
                // eslint-disable-next-line no-template-curly-in-string
                '<div>${testText}</div>'

            ].join( '' ),
            'model:',
            '  items:',
            '    - type: apple',
            '    - type: banana',
            '  testText: sibling'
        ].join( '\n' );

        let componentDef = yaml.safeLoad( componentContent );

        let component = new FewComponent();

        await component.initComponent( componentDef );

        component.attachViewToPage( docElem );

        expect( docElem.innerHTML ).toEqual( [
            '<!--f-each(item of items)-->',
            '<div>apple</div>',
            '<div>banana</div>',
            '<div>sibling</div>'
        ].join( '' ) );
    } );
} );
