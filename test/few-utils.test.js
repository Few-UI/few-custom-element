/* eslint-env es6, jasmine */

import { parseView } from '../src/few-utils';

describe( 'Test few-utils', () => {
  it( 'Verify parseView can parse DOM correctly', () => {
    let viewHtml = '' +
        '<button>Button1</button>' +
        '<button>Button2</button>';

    expect( parseView( viewHtml ).outerHTML ).toEqual(
        '<div><button>Button1</button><button>Button2</button></div>' );
  } );
} );
