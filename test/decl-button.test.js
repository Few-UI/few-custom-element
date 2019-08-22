// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import { DeclButton } from '../src/decl-button';
import { TestUtils } from './testUtils';

describe( 'Test decl-button', () => {
  it( 'Verify decl-button can apply text content', async() => {
    const elem = await TestUtils.render( DeclButton.tag, {}, 'Ouch' );
    expect( elem.outerHTML ).toEqual(
        '<decl-button>Ouch</decl-button>' );
  } );
} );
