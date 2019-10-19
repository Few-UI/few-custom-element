/* eslint-env es6, jasmine */
// NOTE: this is for polyfill document-register-element which is completely different
// with native browser

import {
    parseView
} from '../src/few-utils';
import { wait } from './test-utils';

// lifecycle record
let lifecycleHook = [];

// define custom element
class TestElem extends HTMLElement {
    static tag() {
        return 'few-unit-test-element';
    }

    static get observedAttributes() {
        lifecycleHook.push( 'observedAttributes()' );
        return [ 'view', 'scope' ];
    }

    get view() {
        let val = this.getAttribute( 'view' );
        lifecycleHook.push( `get view() => ${val}` );
        return val;
    }

    get scope() {
        let val = this.getAttribute( 'scope' );
        lifecycleHook.push( `get scope() => ${val}` );
        return val;
    }

    set view( val ) {
        lifecycleHook.push( `set view(${val})` );
        this.setAttribute( 'view', val );
    }

    set scope( val ) {
        lifecycleHook.push( `set scope(${val})` );
        this.setAttribute( 'scope', val );
    }

    constructor() {
        super();
        // NOTE: OOTB attribute will be there forever, custom attribute will be added later
        lifecycleHook.push( `constructor() => ${this.id}` );
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        this._dummy;
        lifecycleHook.push( `attributeChangedCallback( ${name}, ${oldValue}, ${newValue})` );
        // NOTE: this call back does not exist in base HTMLElement
        // super.attributeChangedCallback( name, oldValue, newValue );
    }

    connectedCallback() {
        // NOTE: this call back does not exist in base HTMLElement
        // super.connectedCallback();
        lifecycleHook.push( `connectedCallback() => ${this.id}` );
    }

    disconnectedCallback() {
        // NOTE: this call back does not exist in base HTMLElement
        // super.disconnectedCallback();
        lifecycleHook.push( `disconnectedCallback() => ${this.id}` );
    }

    adoptedCallback() {
        // TODO: write a case for this
        super.adoptedCallback();
        lifecycleHook.push( `adoptedCallback() => ${this.id}` );
    }
}

describe( 'Test Custom Element Life Cycle', () => {
    let rootElem;
    beforeAll( () =>{
        // registartion
        lifecycleHook = [];
        customElements.define( TestElem.tag(), TestElem );
        expect( lifecycleHook ).toEqual( [
            'observedAttributes()'
        ] );
    } );

    beforeEach( () => {
        lifecycleHook = [];
        rootElem = document.createElement( 'div' );
        document.body.appendChild( rootElem );
    } );

    afterEach( () =>{
        document.body.removeChild( rootElem );
    } );

    it( 'Verify Custom Element lifecycle for sibling', async() => {
        // Parse
        lifecycleHook = [];
        //// duplicate id and view for easy test
        let viewHtml = `<${TestElem.tag()} id="testView" view="testView" scope="testScope">testText</${TestElem.tag()}>
                        <${TestElem.tag()} id="testView2" view="testView2" scope="testScope2">testText2</${TestElem.tag()}>`;

        let elem = parseView( viewHtml );
        rootElem.appendChild( elem );
        lifecycleHook.push( 'last if sync' );

        await wait( 200 );

        // NOTE: in this polyfill document-register-element + jsDOM:
        // - if not connected, custom-element is not triggered
        // - this.id cannot be used in constructor
        expect( elem.outerHTML ).toEqual( `<div>${viewHtml}</div>` );
        expect( lifecycleHook ).toEqual( [
            'last if sync',
            'constructor() => ',
            'attributeChangedCallback( scope, null, testScope)',
            'attributeChangedCallback( view, null, testView)',
            'connectedCallback() => testView',
            'constructor() => ',
            'attributeChangedCallback( scope, null, testScope2)',
            'attributeChangedCallback( view, null, testView2)',
            'connectedCallback() => testView2'
        ] );

        // Move
        lifecycleHook = [];
        let newElem = document.createElement( 'div' );
        document.body.appendChild( newElem );
        newElem.appendChild( elem );
        lifecycleHook.push( 'last if sync' );
        await wait( 200 );
        expect( lifecycleHook ).toEqual( [
            'last if sync',
            'disconnectedCallback() => testView',
            'disconnectedCallback() => testView2',
            'connectedCallback() => testView',
            'connectedCallback() => testView2'
        ] );

        // Detach
        lifecycleHook = [];
        document.body.removeChild( newElem );
        lifecycleHook.push( 'last if sync' );
        await wait( 200 );
        expect( lifecycleHook ).toEqual( [
            'last if sync',
            'disconnectedCallback() => testView',
            'disconnectedCallback() => testView2'
        ] );
    } );

    it( 'Verify Custom Element lifecycle for hierarchy', async() => {
        // Parse
        lifecycleHook = [];
        //// duplicate id and view for easy test
        let viewHtml = '' +
            `<${TestElem.tag()} id="testView" view="testView" scope="testScope">` +
                `<${TestElem.tag()} id="testView1" view="testView1" scope="testScope1">testText1</${TestElem.tag()}>` +
                    `<${TestElem.tag()} id="testView11" view="testView11" scope="testScope11">testText11</${TestElem.tag()}>` +
                `<${TestElem.tag()} id="testView2" view="testView2" scope="testScope2">testText2</${TestElem.tag()}>` +
            `</${TestElem.tag()}>`;

        let elem = parseView( viewHtml );
        rootElem.appendChild( elem );
        expect( elem.outerHTML ).toEqual( `<div>${viewHtml}</div>` );

        await wait( 200 );

        //// depth first
        expect( lifecycleHook ).toEqual( [
            'constructor() => ',
            'attributeChangedCallback( scope, null, testScope)',
            'attributeChangedCallback( view, null, testView)',
            'connectedCallback() => testView',
            'constructor() => ',
            'attributeChangedCallback( scope, null, testScope1)',
            'attributeChangedCallback( view, null, testView1)',
            'connectedCallback() => testView1',
            'constructor() => ',
            'attributeChangedCallback( scope, null, testScope11)',
            'attributeChangedCallback( view, null, testView11)',
            'connectedCallback() => testView11',
            'constructor() => ',
            'attributeChangedCallback( scope, null, testScope2)',
            'attributeChangedCallback( view, null, testView2)',
            'connectedCallback() => testView2'
        ] );

        // Move
        lifecycleHook = [];
        let newElem = document.createElement( 'div' );
        document.body.appendChild( newElem );
        newElem.appendChild( elem );
        await wait( 200 );
        expect( lifecycleHook ).toEqual( [
            'disconnectedCallback() => testView',
            'disconnectedCallback() => testView1',
            'disconnectedCallback() => testView11',
            'disconnectedCallback() => testView2',
            'connectedCallback() => testView',
            'connectedCallback() => testView1',
            'connectedCallback() => testView11',
            'connectedCallback() => testView2'
        ] );

        // Detach
        lifecycleHook = [];
        document.body.removeChild( newElem );
        await wait( 200 );
        expect( lifecycleHook ).toEqual( [
            'disconnectedCallback() => testView',
            'disconnectedCallback() => testView1',
            'disconnectedCallback() => testView11',
            'disconnectedCallback() => testView2'
        ] );
    } );
} );
