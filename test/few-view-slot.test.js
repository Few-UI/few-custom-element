// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import http from '../src/http';
import FewView from '../src/few-view';
import { wait } from './test-utils';
import { parseView, getComponent } from '../src/few-utils';

describe( 'Test slot feature in few-view element', () => {
    let docElem;
    beforeEach( () => {
       let mySpy = spyOn( FewView.prototype, 'attributeChangedCallback' ).and.callFake( async function( name, oldValue, newValue ) {
            try {
                // eslint-disable-next-line no-invalid-this
                return await mySpy.and.callThrough().apply( this, [ name, oldValue, newValue ] );
            } catch( e ) {
                // console.log( e );
            }
        } );

        docElem = document.createElement( 'div' );
        document.body.appendChild( docElem );
    } );

    afterEach( () => {
        document.body.removeChild( docElem );
    } );

    it( 'Verify slot function for plain dom element as slot', async() => {
        let ymlContent = [
            'view:',
            '  template:',
            [
                // do it this way so that in assert it will be no space
                // NOTE: 1st element needs enough space to follow yml syntax
                '    ',
                '<ul>',
                  '<li><slot name="slot1"></slot></li>',
                  // eslint-disable-next-line no-template-curly-in-string
                  '<li>${testVal}</li>',
                  '<li><slot></slot></li>',
                  '<li><slot name="slot2"></slot></li>',
                '</ul>'
            ].join( '' ),
            'model:',
            '  testVal: 5'
        ].join( '\n' );

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent ) );

        docElem.appendChild( parseView( [
            '<few-view src="testView">',
              '<div>slotDiv</div>',
              '<div slot="slot2">slot2</div>',
              'slotText',
              '<div slot="slot1">slot1</div>',
            '</few-view>'
        ].join( '' ) ) );

        await wait( 50 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<few-view src="testView" class="few-scope">',
              '<ul>',
                '<li><div>slot1</div></li>',
                '<li>5</li>',
                '<li><div>slotDiv</div>slotText</li>',
                '<li><div>slot2</div></li>',
              '</ul>',
            '</few-view>'
        ].join( '' ) );
    } );

   it( 'Verify slot model is outer view, not slot template view', async() => {
       let slotTemplateContent = [
            'view:',
            '  template:',
            [
                // do it this way so that in assert it will be no space
                // NOTE: 1st element needs enough space to follow yml syntax
                '    ',
                '<ul>',
                  '<li><slot name="slot1"></slot></li>',
                  // eslint-disable-next-line no-template-curly-in-string
                  '<li>${testVal}</li>',
                  '<li><slot></slot></li>',
                  '<li><slot name="slot2"></slot></li>',
                '</ul>'
            ].join( '' ),
            'model:',
            ' testVal: 4'
        ].join( '\n' );

       let mainViewContent = [
            'view:',
            '  template:',
            [
                // do it this way so that in assert it will be no space
                // NOTE: 1st element needs enough space to follow yml syntax
                '    ',
                '<few-view src="slotTemplate">',
                  // eslint-disable-next-line no-template-curly-in-string
                  '<code slot="slot2">${testVal2}</code>',
                  // eslint-disable-next-line no-template-curly-in-string
                  '<code>${testVal}</code>',
                  // eslint-disable-next-line no-template-curly-in-string
                  '<code slot="slot1">${testVal1}</code>',
                '</few-view>'
            ].join( '' ),
            'model:',
            '  testVal: 5',
            '  testVal1: 6',
            '  testVal2: 7',
            'action:',
            '  updateTestVal:',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${testVal + 1}',
            '    output:',
            '      testVal: val',
            '  updateTestVal1:',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${testVal1 + 1}',
            '    output:',
            '      testVal1: val',
            '  updateTestVal2:',
            '    input:',
            // eslint-disable-next-line no-template-curly-in-string
            '      val: ${testVal2 + 1}',
            '    output:',
            '      testVal2: val',
            '  updateData:',
            '    - updateTestVal',
            '    - updateTestVal1',
            '    - updateTestVal2'
        ].join( '\n' );

        spyOn( http, 'get' ).and.callFake( ( url ) => {
            if ( url === 'mainView.yml' ) {
                return Promise.resolve( mainViewContent );
            } else if ( url === 'slotTemplate.yml' ) {
                return Promise.resolve( slotTemplateContent );
            }
        } );

        docElem.appendChild( parseView( [
            '<few-view src="mainView">',
            '</few-view>'
        ].join( '' ) ) );

        await wait( 100 );

        let elem = docElem.firstChild.firstChild;
        expect( elem.outerHTML ).toEqual( [
            '<few-view src="mainView" class="few-scope">',
              '<few-view src="slotTemplate" class="few-scope">',
                '<ul>',
                  '<li>',
                    '<code>6</code>',
                  '</li>',
                  '<li>4</li>',
                  '<li><code>5</code></li>',
                  '<li>',
                    '<code>7</code>',
                  '</li>',
                '</ul>',
              '</few-view>',
            '</few-view>'
        ].join( '' ) );

        let component = getComponent( elem );

        await component.update( 'updateData' );

        await wait( 200 );

        expect( elem.outerHTML ).toEqual( [
            '<few-view src="mainView" class="few-scope">',
              '<few-view src="slotTemplate" class="few-scope">',
                '<ul>',
                  '<li>',
                    '<code>7</code>',
                  '</li>',
                  '<li>4</li>',
                  '<li><code>6</code></li>',
                  '<li>',
                    '<code>8</code>',
                  '</li>',
                '</ul>',
              '</few-view>',
            '</few-view>'
        ].join( '' ) );
    } );

   it( 'Verify slot function for few-view element as slot', async() => {
       let slotTemplateContent = [
            'view:',
            '  template:',
            [
                // do it this way so that in assert it will be no space
                // NOTE: 1st element needs enough space to follow yml syntax
                '    ',
                '<ul>',
                  '<li><slot name="slot1"></slot></li>',
                  // eslint-disable-next-line no-template-curly-in-string
                  '<li>${testVal}</li>',
                  '<li><slot name="slot2"></slot></li>',
                '</ul>'
            ].join( '' ),
            'model:',
            ' testVal: 5'
        ].join( '\n' );

        let firstViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <div>${testVal}</div>',
            'model:',
            '  testVal: 5'
        ].join( '\n' );

        let secondViewContent = [
            'view:',
            '  template:',
            // eslint-disable-next-line no-template-curly-in-string
            '    <code style="${newStyle}">${testVal}</div>',
            'model:',
            '  newStyle: "color:red"',
            '  testVal: 7'
        ].join( '\n' );

        spyOn( http, 'get' ).and.callFake( ( url ) => {
            if ( url === 'firstView.yml' ) {
                return Promise.resolve( firstViewContent );
            } else if ( url === 'secondView.yml' ) {
                return Promise.resolve( secondViewContent );
            } else if ( url === 'slotTemplate.yml' ) {
                return Promise.resolve( slotTemplateContent );
            }
        } );

        docElem.appendChild( parseView( [
            '<few-view src="slotTemplate">',
              '<few-view slot="slot2" src="secondView"></few-view>',
              '<few-view slot="slot1" src="firstView"></few-view>',
            '</few-view>'
        ].join( '' ) ) );

        await wait( 50 );

        let elem = docElem.firstChild.firstChild;
        expect( elem.outerHTML ).toEqual( [
            '<few-view src="slotTemplate" class="few-scope">',
              '<ul>',
                '<li>',
                  '<few-view src="firstView" class="few-scope">',
                    '<div>5</div>',
                  '</few-view>',
                '</li>',
                '<li>5</li>',
                '<li>',
                  '<few-view src="secondView" class="few-scope">',
                    '<code style="color:red">7</code>',
                  '</few-view>',
                '</li>',
              '</ul>',
            '</few-view>'
        ].join( '' ) );
    } );
} );
