// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { FewViewHtmlParser } from '../src/few-dom';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-dom', () => {
    it( 'Verify few-dom create node correct for simple DOM', async() => {
        let parser = new FewViewHtmlParser( new StringTemplateParser() );
        expect( parser.parse( '<code id="ouch"></code>' ).toJSON() ).toEqual( {
            tagName: 'DIV',
            hasExpr: false,
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: false,
                    data: {
                        id: 'ouch'
                    }
                }
            ]
        } );
    } );

    it( 'Verify few-dom create node correct for DOM with expression', async() => {
        let parser = new FewViewHtmlParser( new StringTemplateParser() );
        expect( parser.parse( '<code id="ouch"><div>${test1}</div></code><code id="${test2}"><div></div></code>' ).toJSON() ).toEqual( {
            tagName: 'DIV',
            hasExpr: true,
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    data: {
                        id: 'ouch'
                    },
                    children:[
                        {
                            tagName: 'DIV',
                            hasExpr: true,
                            children: [
                                {
                                    tagName: '#text',
                                    hasExpr: true,
                                    input: {
                                        textContent: 'test1'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    input: {
                        id: 'test2'
                    },
                    children: [
                        {
                            tagName: 'DIV',
                            hasExpr: false
                        }
                    ]
                }
            ]
        } );
    } );
} );
