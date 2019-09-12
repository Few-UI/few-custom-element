/* eslint-env es6 */

export default class DeclViewModel {
    /**
     * Constructor for View Model Object
     * @param {DeclViewModel} parent parent view model
     * @param {Object} viewModelInput view model input
     */
    constructor( parent, viewModelInput ) {
        /**
         * parent view model
         */
        this._parent = parent;

        /**
         * view html
         */
        this._view = null;

        /**
         * data not sure if we need it?
         */
        this.data = viewModelInput.data;
    }

    /**
     * set view for view model. Only one view is allowed
     * @param {string} viewHtml view html as string
     */
    setView( viewHtml ) {
        this._view = viewHtml;
    }
}

