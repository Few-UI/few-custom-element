// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { FewHtmlViewParser } from '../src/few-view';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test FewHtmlViewParser', () => {
    it( 'Verify FewHtmlViewParser can proceed simple dom', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.createView( '<div id="test"></div>' ).toJson() ).toEqual( {
            nodeName: 'DIV',
            variables: {},
            constants: {
            },
            children: [
                {
                    nodeName: 'DIV',
                    variables: {},
                    constants: {
                        id: 'test'
                    },
                    children: [],
                    hasExpr: false
                }
            ],
            hasExpr: false
        } );
    } );

    it( 'Verify FewHtmlViewParser can proceed simple dom with expression', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.createView( '<div id="${test}"></div><code>${test2}</code>' ).toJson() ).toEqual( {
            nodeName: 'DIV',
            variables: {},
            constants: {},
            children: [
                {
                    nodeName: 'DIV',
                    variables: {
                        id: 'test'
                    },
                    constants: {
                    },
                    children: [],
                    hasExpr: true
                },
                {
                    nodeName: 'CODE',
                    variables: {
                    },
                    constants: {
                    },
                    children: [
                        {
                            nodeName: '#text',
                            variables: {
                                textContent: 'test2'
                            },
                            constants:{},
                            children: [],
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
        expect( parser.createView( '<div><button onclick="${update}"></button></div><code>test</code>' ).toJson() ).toEqual( {
            nodeName: 'DIV',
            variables: {},
            constants: {},
            children: [
                {
                    nodeName: 'DIV',
                    variables: {
                    },
                    constants: {
                    },
                    children: [
                        {
                            nodeName: 'BUTTON',
                            variables: {
                                onclick: 'update'
                            },
                            constants:{
                            },
                            children: [],
                            hasExpr: true
                        }
                    ],
                    hasExpr: true
                },
                {
                    nodeName: 'CODE',
                    variables: {
                    },
                    constants: {
                    },
                    children: [
                        {
                            nodeName: '#text',
                            variables: {
                            },
                            constants:{
                                textContent: 'test'
                            },
                            children: [],
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
