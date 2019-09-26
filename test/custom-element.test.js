/* eslint-env es6, jasmine */

import {
    parseViewToDiv
} from '../src/few-utils';

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
    } );

    it( 'Verify Custom Element lifecycle for sibling', async() => {
        // Parse
        lifecycleHook = [];
        //// duplicate id and view for easy test
        let viewHtml = `<${TestElem.tag()} id="testView" view="testView" scope="testScope">testText</${TestElem.tag()}>
                        <${TestElem.tag()} id="testView2" view="testView2" scope="testScope2">testText2</${TestElem.tag()}>`;

        let elem = parseViewToDiv( viewHtml );
        lifecycleHook.push( 'last if sync' );

        expect( elem.outerHTML ).toEqual( `<div>${viewHtml}</div>` );
        expect( lifecycleHook ).toEqual( [
            'constructor() => testView',
            'attributeChangedCallback( view, null, testView)',
            'attributeChangedCallback( scope, null, testScope)',
            'constructor() => testView2',
            'attributeChangedCallback( view, null, testView2)',
            'attributeChangedCallback( scope, null, testScope2)',
            'last if sync'
        ] );

        // Attach
        lifecycleHook = [];
        document.body.appendChild( elem );
        lifecycleHook.push( 'last if sync' );
        expect( lifecycleHook ).toEqual( [
            'connectedCallback() => testView',
            'connectedCallback() => testView2',
            'last if sync'
        ] );

        // Move
        lifecycleHook = [];
        let newElem = document.createElement( 'div' );
        document.body.appendChild( newElem );
        newElem.appendChild( elem );
        lifecycleHook.push( 'last if sync' );
        expect( lifecycleHook ).toEqual( [
            'disconnectedCallback() => testView',
            'connectedCallback() => testView',
            'disconnectedCallback() => testView2',
            'connectedCallback() => testView2',
            'last if sync'
        ] );

        // Detach
        lifecycleHook = [];
        document.body.removeChild( newElem );
        lifecycleHook.push( 'last if sync' );
        expect( lifecycleHook ).toEqual( [
            'disconnectedCallback() => testView',
            'disconnectedCallback() => testView2',
            'last if sync'
        ] );
    } );

    it( 'Verify Custom Element lifecycle for hierarchy', () => {
        // Parse
        lifecycleHook = [];
        //// duplicate id and view for easy test
        let viewHtml = '' +
            `<${TestElem.tag()} id="testView" view="testView" scope="testScope">` +
                `<${TestElem.tag()} id="testView1" view="testView1" scope="testScope1">testText1</${TestElem.tag()}>` +
                    `<${TestElem.tag()} id="testView11" view="testView11" scope="testScope11">testText11</${TestElem.tag()}>` +
                `<${TestElem.tag()} id="testView2" view="testView2" scope="testScope2">testText2</${TestElem.tag()}>` +
            `</${TestElem.tag()}>`;

        let elem = parseViewToDiv( viewHtml );
        expect( elem.outerHTML ).toEqual( `<div>${viewHtml}</div>` );

        //// depth first
        expect( lifecycleHook ).toEqual( [
            'constructor() => testView',
            'attributeChangedCallback( view, null, testView)',
            'attributeChangedCallback( scope, null, testScope)',
            'constructor() => testView1',
            'attributeChangedCallback( view, null, testView1)',
            'attributeChangedCallback( scope, null, testScope1)',
            'constructor() => testView11',
            'attributeChangedCallback( view, null, testView11)',
            'attributeChangedCallback( scope, null, testScope11)',
            'constructor() => testView2',
            'attributeChangedCallback( view, null, testView2)',
            'attributeChangedCallback( scope, null, testScope2)'
        ] );

        // Attach
        lifecycleHook = [];
        document.body.appendChild( elem );
        expect( lifecycleHook ).toEqual( [
            'connectedCallback() => testView',
            'connectedCallback() => testView1',
            'connectedCallback() => testView11',
            'connectedCallback() => testView2'
        ] );

        // Move
        lifecycleHook = [];
        let newElem = document.createElement( 'div' );
        document.body.appendChild( newElem );
        newElem.appendChild( elem );
        expect( lifecycleHook ).toEqual( [
            'disconnectedCallback() => testView',
            'connectedCallback() => testView',
            'disconnectedCallback() => testView1',
            'connectedCallback() => testView1',
            'disconnectedCallback() => testView11',
            'connectedCallback() => testView11',
            'disconnectedCallback() => testView2',
            'connectedCallback() => testView2'
        ] );

        // Detach
        lifecycleHook = [];
        document.body.removeChild( newElem );
        expect( lifecycleHook ).toEqual( [
            'disconnectedCallback() => testView',
            'disconnectedCallback() => testView1',
            'disconnectedCallback() => testView11',
            'disconnectedCallback() => testView2'
        ] );
    } );
} );
