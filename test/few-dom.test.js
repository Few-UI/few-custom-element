// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import FewDom from '../src/few-dom';
import { parseViewToDiv } from '../src/few-utils';
import StringTemplateParser from '../src/string-template-parser';

describe( 'Test few-dom', () => {
    it( 'Verify few-dom create node correct for simple DOM', async() => {
        expect( FewDom.createFewDom( parseViewToDiv( '<code id="ouch"></code>' ), new StringTemplateParser() ).toJson() ).toEqual( {
            tagName: 'DIV',
            hasExpr: false,
            _htmlDomReference: '<div></div>',
            props: {},
            values: {},
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: false,
                    _htmlDomReference: '',
                    props: {},
                    values: {
                        id: 'ouch'
                    },
                    children:[]
                }
            ]
        } );
    } );

    it( 'Verify few-dom create node correct for DOM with expression', async() => {
        expect( FewDom.createFewDom( parseViewToDiv( '<code id="ouch"><div>${test1}</div></code><code id="${test2}"><div></div></code>' ), new StringTemplateParser() ).toJson() ).toEqual( {
            tagName: 'DIV',
            hasExpr: true,
            _htmlDomReference: '<div></div>',
            props: {},
            values: {},
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    _htmlDomReference: '',
                    props: {},
                    values: {
                        id: 'ouch'
                    },
                    children:[
                        {
                            tagName: 'DIV',
                            hasExpr: true,
                            _htmlDomReference: '',
                            props: {},
                            values: {},
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
                                    },
                                    children: []
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
                            _htmlDomReference: '',
                            props: {},
                            values: {},
                            children: []
                        }
                    ]
                }
            ]
        } );
    } );
} );
