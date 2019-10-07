// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { FewHtmlViewParser } from '../src/few-dom';
import { parseViewToDiv } from '../src/few-utils';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-dom', () => {
    it( 'Verify few-dom create node correct for simple DOM', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.parse( '<code id="ouch"></code>' ).toJSON() ).toEqual( {
            tagName: 'DIV',
            hasExpr: false,
            _htmlDomReference: '<div></div>',
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: false,
                    _htmlDomReference: '<code id="ouch"></code>',
                    values: {
                        id: 'ouch'
                    }
                }
            ]
        } );
    } );

    it( 'Verify few-dom create node correct for DOM with expression', async() => {
        let parser = new FewHtmlViewParser( new StringTemplateParser() );
        expect( parser.parse( '<code id="ouch"><div>${test1}</div></code><code id="${test2}"><div></div></code>' ).toJSON() ).toEqual( {
            tagName: 'DIV',
            hasExpr: true,
            _htmlDomReference: '<div></div>',
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    _htmlDomReference: '<code id="ouch"></code>',
                    values: {
                        id: 'ouch'
                    },
                    children:[
                        {
                            tagName: 'DIV',
                            hasExpr: true,
                            _htmlDomReference: '<div></div>',
                            children: [
                                {
                                    tagName: '#text',
                                    hasExpr: true,
                                    _htmlDomReference: '${test1}',
                                    props: {
                                        textContent: 'test1'
                                    },
                                    values: {
                                        textContent: '${test1}'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    _htmlDomReference: '<code id="${test2}"></code>',
                    props: {
                        id: 'test2'
                    },
                    values: {
                        id: '${test2}'
                    },
                    children: [
                        {
                            tagName: 'DIV',
                            hasExpr: false,
                            _htmlDomReference: '<div></div>'
                        }
                    ]
                }
            ]
        } );
    } );
} );
