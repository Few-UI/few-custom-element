// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import http from '../src/http';
import FewView from '../src/f-view';
import { wait } from './test-utils';
import { parseView } from '../src/few-utils';

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

    it( 'Verify slot function works fine for simple dom element as slot', async() => {
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
            ' testVal: 5'
        ];

        spyOn( http, 'get' ).and.returnValue( Promise.resolve( ymlContent.join( '\n' ) ) );

        docElem.appendChild( parseView( [
            '<f-view src="testView">',
              '<div>slotDiv</div>',
              '<div slot="slot2">slot2</div>',
              'slotText',
              '<div slot="slot1">slot1</div>',
            '</f-view>'
        ].join( '' ) ) );

        await wait( 50 );

        expect( docElem.firstChild.innerHTML ).toEqual( [
            '<f-view src="testView">',
              '<div class="few-scope">',
                '<ul>',
                  '<li><div slot="slot1">slot1</div></li>',
                  '<li>5</li>',
                  '<li><div>slotDiv</div>slotText</li>',
                  '<li><div slot="slot2">slot2</div></li>',
                '</ul>',
              '</div>',
            '</f-view>'
        ].join( '' ) );
    } );
} );
