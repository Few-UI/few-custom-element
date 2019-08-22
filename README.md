[![Build Status](https://travis-ci.org/jesse23/decl.svg?branch=master)](https://travis-ci.org/jesse23/decl)

# DECL
Practice to create a Declarative UI

## Getting started
### Debug in Test Site
```bash
npm install
npm start
```

### Unit test
```bash
# run unit test
npm test

# debug unit test
npm test -- -debug
```

### Framework Introduction
The `public/index.html` file contains a `<script src='bundle.js'>` tag, which means we need to create `public/bundle.js`. The `rollup.config.js` file tells Rollup how to create this bundle, starting with `src/main.js` and including all its dependencies, including [date-fns](https://date-fns.org).

`npm run build` builds the application to `public/bundle.js`, along with a sourcemap file for debugging.

`npm start` launches a server, using [serve](https://github.com/zeit/serve). Navigate to [localhost:3000](http://localhost:3000).

`npm run watch` will continually rebuild the application as your source files change.
