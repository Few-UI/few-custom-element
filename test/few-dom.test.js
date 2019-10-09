// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { FewViewHtmlParser } from '../src/few-dom';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-dom', () => {
    it( 'Verify few-dom create node correct for simple DOM', async() => {
        let parser = new FewViewHtmlParser( new StringTemplateParser() );
        expect( parser.parse( '<code id="ouch"></code>' ).toJSON() ).toEqual( {
            type: 'DIV'
        } );
    } );

    it( 'Verify few-dom create node correct for DOM with expression', async() => {
        let parser = new FewViewHtmlParser( new StringTemplateParser() );
        expect( parser.parse( '<code id="ouch"><div>${test1}</div></code><code id="${test2}"><div></div></code>' ).toJSON() ).toEqual( {
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
