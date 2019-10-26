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
        presets: [ 'react' ]
    },
    paths: {
        // github site is using https
        // steal has an issue that by default // will applied as http
        // For now use workaround below to match to https
        '//cdn.jsdelivr.net/*' : 'https://cdn.jsdelivr.net/*.js',
        // For stealJSX
        react: '//cdn.jsdelivr.net/npm/react@16.11.0/umd/react.development.js',
        'steal-jsx': '//cdn.jsdelivr.net/npm/steal-react-jsx@0.0.4/steal-react-jsx.js'
    },
    ext: {
        jsx: 'steal-jsx'
    }
} );

