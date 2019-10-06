// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { FewHtmlViewParser } from '../src/few-view';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test FewHtmlViewParser', () => {
    it( 'Verify FewHtmlViewParser can proceed simple dom', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.parse( '<div id="test"></div>' ).toJSON() ).toEqual( {
            nodeName: 'DIV',
            children: [
                {
                    nodeName: 'DIV',
                    constants: {
                        id: 'test'
                    },
                    hasExpr: false
                }
            ],
            hasExpr: false
        } );
    } );

    it( 'Verify FewHtmlViewParser can proceed simple dom with expression', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.parse( '<div id="${test}"></div><code>${test2}</code>' ).toJSON() ).toEqual( {
            nodeName: 'DIV',
            children: [
                {
                    nodeName: 'DIV',
                    variables: {
                        id: 'test'
                    },
                    hasExpr: true
                },
                {
                    nodeName: 'CODE',
                    children: [
                        {
                            nodeName: '#text',
                            variables: {
                                textContent: 'test2'
                            },
                            hasExpr: true
                        }
                    ],
                    hasExpr: true
                }
            ],
            hasExpr: true
        } );
    } );

    it( 'Verify FewHtmlViewParser can proceed nested with expression', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.parse( '<div><button onclick="${update}"></button></div><code>test</code>' ).toJSON() ).toEqual( {
            nodeName: 'DIV',
            children: [
                {
                    nodeName: 'DIV',
                    children: [
                        {
                            nodeName: 'BUTTON',
                            variables: {
                                onclick: 'update'
                            },
                            hasExpr: true
                        }
                    ],
                    hasExpr: true
                },
                {
                    nodeName: 'CODE',
                    children: [
                        {
                            nodeName: '#text',
                            constants:{
                                textContent: 'test'
                            },
                            hasExpr: false
                        }
                    ],
                    hasExpr: false
                }
            ],
            hasExpr: true
        } );
    } );
} );
