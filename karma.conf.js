/* global module process*/

module.exports = function( config ) {
    let isDebug = false;

    /**
     * check debug arg
     * @argument {string} argument input argument
     * @returns {boolean} is in debug mode
     */
    function checkDebugArg( argument ) {
        return argument === '-debug';
    }
    if ( process.argv.some( checkDebugArg ) ) {
        isDebug = true;
    }

  let karmaConfig = {
    basePath: '',
    frameworks: [ 'jasmine' ],
    files: [
      // NOTE: For only using chrome, no need to use any polyfill.
      // For Edge/FF/IE support, polyfill is needed.
      // 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
      { pattern: 'test/main.test.js', type: 'module', included: true, watched: true },
      { pattern: 'test/**/!(*main).test.js', type: 'module', included: false, watched: true },
      { pattern: 'src/**/*.js', type: 'module', included: false, watched: true },
      { pattern: 'test/**/!(*.test).js', type: 'module', included: false, watched: true }
    ],
    exclude: [],
    preprocessors: {
        'test/main.test.js': [ 'rollup' ]
    },
    singleRun: true,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: Infinity,
    browsers: [],
    reporters: [],
    rollupPreprocessor: {
        /**
         * This is just a normal Rollup config object,
         * except that `input` is handled for you.
         */
        output: {
            format: 'iife', // Helps prevent naming collisions.
            name: 'declTest', // Required for 'iife' format.
            sourcemap: 'inline' // Sensible for testing.
        },
        plugins: [
            // require( 'rollup-plugin-buble' )(),
            /*
            require( 'rollup-plugin-istanbul' )( { // plugin to add code coverage
                exclude: [ 'test/*.js' ]
            } ),
            */
            require( 'rollup-plugin-node-resolve' )(), // plugin to use reference from node_modules
            require( 'rollup-plugin-commonjs' )(), // plugin to support commonjs module to browser usage
            require( 'rollup-plugin-postcss' )( {
                inject: false, //// not inject to global css
                // modules: true, //// use css module
                plugins: [] // plugin to support ES6 import css
            } )
        ]
    },
    customLaunchers: {
        ChromeHeadlessNoSandbox: {
            base: 'ChromeHeadless',
            flags: [ '--no-sandbox' ]
        }
    }
  };

  if ( isDebug ) {
        karmaConfig.browsers.push( 'Chrome' );
        karmaConfig.reporters.push( 'progress' );
        karmaConfig.singleRun = false;
        karmaConfig.autoWatch = true;
  } else {
        // Push istanbul pugin here otherwise it will impact debug mode
        karmaConfig.rollupPreprocessor.plugins.unshift(
            require( 'rollup-plugin-istanbul' )( { // plugin to add code coverage
                exclude: [
                    'test/*.js',
                    'node_modules/**/*'
                ]
            } ),
        );
        // NOTE: FF looks have problem....will test it later
        // NOTE: Edge is working but for gitlab CI will comment it for now
        // browsers: [ 'ChromeHeadlessNoSandbox', "Firefox", "Edge" ],
        karmaConfig.browsers.push( 'ChromeHeadlessNoSandbox' );
        karmaConfig.reporters.push( 'spec' );
        karmaConfig.reporters.push( 'coverage' );
        karmaConfig.coverageReporter = {
            type: 'lcov',
            subdir: '.' // remove browser name from coverage path
        };
  }

  config.set( karmaConfig );
};
