/* eslint-env es6 */
import { evalExpression } from './few-utils';

/**
 * String Template Parser
 */
export default class StringTemplateParser {
    constructor( template ) {
        let tpl = template ? template : this.constructor.defaultTemplate;

        // regular expression object
        this._regExpObj = evalExpression( tpl.pattern );

        // match index
        this._matchIdx = tpl.index;
    }

    /**
     * Parse string with template
     * @param {string} str input string
     * @returns {string} expression define by input string
     */
    parse( str ) {
        let match = this._regExpObj.exec( str );
        if ( match ) {
            return match[this._matchIdx];
        }
    }
}

StringTemplateParser.defaultTemplate = {
    // eslint-disable-next-line no-template-curly-in-string
    pattern: '/^\\s*\\${\\s*([\\S\\s\\r\\n]*)\\s*}\\s*$/m',
    index: 1
};
