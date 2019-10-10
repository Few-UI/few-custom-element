// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { FewHtmlViewFactory } from '../src/few-view';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-view', () => {
    it( 'Verify few-view create node correct for simple DOM', async() => {
        let factory = new FewHtmlViewFactory( new StringTemplateParser() );
        expect( factory.createView( '<code id="ouch"></code>' ).toJSON() ).toEqual( {
            type: 'DIV'
        } );
    } );

    it( 'Verify few-view create node correct for DOM with expression', async() => {
        let factory = new FewHtmlViewFactory( new StringTemplateParser() );
        expect( factory.createView( '<code id="ouch"><div>${test1}</div></code><code id="${test2}"><div></div></code>' ).toJSON() ).toEqual( {
            type: 'DIV',
            children: [
                {
                    type: 'CODE',
                    data: {
                        id: 'ouch'
                    },
                    children:[
                        {
                            type: 'DIV',
                            children: [
                                {
                                    type: '#text',
                                    input: {
                                        textContent: 'test1'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'CODE',
                    input: {
                        id: 'test2'
                    }
                }
            ]
        } );
    } );
} );
