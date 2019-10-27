/* eslint-env es6 */
// https://stackoverflow.com/questions/48498581/textcontent-empty-in-connectedcallback-of-a-custom-htmlelement

class HTMLBaseElement extends HTMLElement {
  constructor( ...args ) {
    const self = super( ...args );
    self.parsed = false; // guard to make it easy to do certain stuff only once
    self.parentNodes = [];
    return self;
  }

  setup() {
    // collect the parentNodes
    let el = this;
    while ( el.parentNode ) {
      el = el.parentNode;
      this.parentNodes.push( el );
    }

    // check if the parser has already passed the end tag of the component
    // in which case this element, or one of its parents, should have a nextSibling
    // if not (no whitespace at all between tags and no nextElementSiblings either)
    // resort to DOMContentLoaded or load having triggered
    if ( [ this, ...this.parentNodes ].some( el=> el.nextSibling ) || document.readyState !== 'loading' ) {
      this.childrenAvailableCallback();
    } else {
      this.mutationObserver = new MutationObserver( () => {
        if ( [ this, ...this.parentNodes ].some( el=> el.nextSibling ) || document.readyState !== 'loading' ) {
          this.childrenAvailableCallback();
          this.mutationObserver.disconnect();
        }
      } );

      this.mutationObserver.observe( this, { childList: true } );
    }
  }
}

class MyComponent extends HTMLBaseElement {
  constructor( ...args ) {
    const self = super( ...args );
    return self;
  }

  connectedCallback() {
    // when connectedCallback has fired, call super.setup()
    // which will determine when it is safe to call childrenAvailableCallback()
    super.setup();
  }

  childrenAvailableCallback() {
    // this is where you do your setup that relies on child access
    console.log( this.innerHTML );

    // when setup is done, make this information accessible to the element
    this.parsed = true;
    // this is useful e.g. to only ever attach event listeners to child
    // elements once using this as a guard
  }
}

customElements.define( 'my-component', MyComponent );
