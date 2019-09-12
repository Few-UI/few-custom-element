/* eslint-env es6, jasmine */

import utils from '../src/decl-utils';

describe( 'Test decl-utils', () => {
  it( 'Verify createView can render DOM correctly', async() => {
    let mock = {
        view: '<button>{{data.testMsg}}</button>',
        data: JSON.parse( `
            {
                "schemaVersion": "1.0.0",
                "data": {
                    "testMsg": "Hello World!"
                }
            }
        ` )
    };
    expect( utils.createView( mock.view ).reference.outerHTML ).toEqual(
        '<div><button>{{data.testMsg}}</button></div>' );
  } );
} );
