# Approach
- Last thing in pocket
  - First class should be native framework for sure
- Runtime integration, not build time
  - Get functionality by paying performance trade off
- No/low adption to actual app to container
- Separate dev and separate deploy strategy
- Proper routing and lifecycle hook
- Provide both
  - Component level solution
  - iframe level solution
  - Solution/Doc for CSS

## Load approach
- Dynamic import JS
- Append new HTML Element, interpret through HTML Engine

## Cross communication approach between container
- Eventbus (need adopt)
- Hijack and Event Delegation
- Href

# Reference
https://martinfowler.com/articles/micro-frontends.html
https://github.com/phodal/microfrontends/blob/master/english.md
https://github.com/phodal/microfrontends

# Existing Project
https://single-spa.js.org
https://github.com/phodal/mooa
