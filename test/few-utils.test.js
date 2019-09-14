/* eslint-env es6, jasmine */

import utils from '../src/few-utils';

describe( 'Test few-utils', () => {
  it( 'Verify parseView can parse DOM correctly', () => {
    let viewHtml = '' +
        '<button>Button1</button>' +
        '<button>Button2</button>';

    expect( utils.parseView( viewHtml ).outerHTML ).toEqual(
        '<div><button>Button1</button><button>Button2</button></div>' );
  } );
} );
