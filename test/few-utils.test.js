/* eslint-env es6, jasmine */

import {
    parseView,
    parseViewToDiv
} from '../src/few-utils';

describe( 'Test parseView', () => {
    it( 'Verify parseView can parse DOM correctly', () => {
        let viewHtml = '' +
            '<button>Button1</button>' +
            '<button>Button2</button>';

        expect( parseView( viewHtml ).outerHTML ).toEqual(
            '<div><button>Button1</button><button>Button2</button></div>' );
    } );
} );

describe( 'Test parseViewToDiv', () => {
    it( 'Verify parseViewToDiv can parse view with multiple element', () => {
        let viewHtml = '' +
            '<button>Button1</button>' +
            '<button>Button2</button>';

        expect( parseViewToDiv( viewHtml ).outerHTML ).toEqual(
            '<div><button>Button1</button><button>Button2</button></div>' );
    } );
} );
