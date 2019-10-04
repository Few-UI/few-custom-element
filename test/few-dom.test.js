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
            reference: '<div></div>',
            props: {},
            values: {},
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: false,
                    reference: '',
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
            reference: '<div></div>',
            props: {},
            values: {},
            children: [
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    reference: '',
                    props: {},
                    values: {
                        id: 'ouch'
                    },
                    children:[
                        {
                            tagName: 'DIV',
                            hasExpr: true,
                            reference: '',
                            props: {},
                            values: {},
                            children: [
                                {
                                    tagName: '#text',
                                    hasExpr: true,
                                    reference: '${test1}',
                                    props: {
                                        textContent: 'test1'
                                    },
                                    values: {},
                                    children: []
                                }
                            ]
                        }
                    ]
                },
                {
                    tagName: 'CODE',
                    hasExpr: true,
                    reference: '<code id="${test2}"></code>',
                    props: {
                        id: 'test2'
                    },
                    values: {},
                    children: [
                        {
                            tagName: 'DIV',
                            hasExpr: false,
                            reference: '',
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
