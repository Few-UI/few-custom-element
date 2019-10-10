// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import htmlViewFactory from '../src/few-view';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-view', () => {
    it( 'Verify few-view create node correct for simple DOM', async() => {
        expect( htmlViewFactory.createView( '<code id="ouch"></code>', new StringTemplateParser() ).toJSON() ).toEqual( {
            type: 'DIV'
        } );
    } );

    it( 'Verify few-view create node correct for DOM with expression', async() => {
        expect( htmlViewFactory.createView( '<code id="ouch"><div>${test1}</div></code><code id="${test2}"><div></div></code>', new StringTemplateParser() ).toJSON() ).toEqual( {
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
