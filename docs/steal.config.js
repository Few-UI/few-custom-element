/* eslint-env es6, node */
/*
 global
 steal,
 */
steal.config( {
    // current stealjs has a bug - baseURL will be overwritten by the path of steal.config
    // Sould be able to play it with config but let us not over engineering this for now
    // baseURL: '../lib/',
    babelOptions: {
        // https://stealjs.com/docs/config.babelOptions.html
        presets: [ 'react' ]
    },
    paths: {
        // github site is using https
        // steal has an issue that by default // will applied as http
        // For now use workaround below to match to https
        '//cdn.jsdelivr.net/*' : 'https://cdn.jsdelivr.net/*.js',

        // For stealJSX
        'steal-jsx': 'https://cdn.jsdelivr.net/npm/steal-react-jsx@0.0.4/steal-react-jsx.js',

        // lit-element
        'lit-element': 'https://cdn.jsdelivr.net/npm/lit-element@2.2.1/lit-element.js',
        'lit-element/*': 'https://cdn.jsdelivr.net/npm/lit-element@2.2.1/*.js',
        /*
        'lib/updating-element': '//cdn.jsdelivr.net/npm/lit-element@2.2.1/lib/updating-element.js',
        'lib/decorators': '//cdn.jsdelivr.net/npm/lit-element@2.2.1/lib/decorators.js',
        'lib/css-tag': '//cdn.jsdelivr.net/npm/lit-element@2.2.1/lib/css-tag.js',
        */
        // lit-html
        'lit-html/*': 'https://cdn.jsdelivr.net/npm/lit-html@1.1.2/*.js',
        'lit-html': 'https://cdn.jsdelivr.net/npm/lit-html@1.1.2/lit-html.js'
    },
    meta: {
      'lit-element': {
        deps: [ 'lit-html' ]
      }
    },
    map: {
        // react
        react: '//cdn.jsdelivr.net/npm/react@16.11.0/umd/react.development',

        // lit-element
        'lib/updating-element': 'lit-element/lib/updating-element',
        'lib/decorators': 'lit-element/lib/decorators',
        'lib/css-tag': 'lit-element/lib/css-tag',

        // lit-html
        'lit-html/lit-html': 'lit-html',
        'lib/dom': 'lit-html/lib/dom',
        'lib/part': 'lit-html/lib/part',
        'lib/render': 'lit-html/lib/render',
        'lib/parts': 'lit-html/lib/parts',
        'lib/template': 'lit-html/lib/template',
        'lib/directive': 'lit-html/lib/directive',
        'lib/default-template-processor': 'lit-html/lib/default-template-processor',
        'lib/template-instance': 'lit-html/lib/template-instance',
        'lib/template-result': 'lit-html/lib/template-result',
        'lib/template-factory': 'lit-html/lib/template-factory'
    },
    ext: {
        jsx: 'steal-jsx'
    }
} );

