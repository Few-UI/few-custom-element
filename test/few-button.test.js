// NOTE: Example code from google, will be deleted later
/* eslint-env es6, jasmine */

import FewButton from '../src/few-button';
import { TestUtils } from './test-utils';

describe( 'Test few-button', () => {
  it( 'Verify few-button can apply text content', async() => {
    const elem = await TestUtils.render( FewButton.tag, {}, 'Ouch' );
    expect( elem.outerHTML ).toEqual(
        '<few-button>Ouch</few-button>' );
  } );
} );
