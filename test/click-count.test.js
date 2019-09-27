/* eslint-env es6, jasmine */

import { ClickCountComponent } from '../src/click-count';
import { render } from './test-utils';

describe( 'Click Count Component', () => {
  it( 'displayed click count starts from 0', async() => {
    const { _root } = await render( ClickCountComponent.tag );
    expect( _root.innerHTML.includes( 'Clicks: 0' ) ).toBeTruthy();
  } );

  it( 'clicking the button increments displayed click count', async() => {
    const { _root } = await render( ClickCountComponent.tag );
    _root.querySelector( 'button' ).click();
    _root.querySelector( 'button' ).click();
    expect( _root.innerHTML.includes( 'Clicks: 2' ) ).toBeTruthy();
  } );

  describe( 'onClick()', () => {
    it( 'increments click count', () => {
      const component = new ClickCountComponent();
      component.onClick();
      component.onClick();
      component.onClick();
      expect( component.clickCount ).toEqual( 3 );
    } );
  } );
} );
