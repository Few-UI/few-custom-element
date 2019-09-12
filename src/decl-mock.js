/* eslint-env es6 */

let mock = {
    viewHtml: '' +
            '<decl-button click="testAction">{{data.testMsg}}</decl-button>',
    viewModel: JSON.parse( `
        {
            "data": {
                "testMsg": "Hello World!"
            },
            "function": {
                "testAction": {
                    "import": "js/test",
                    "name": "testAccu",
                    "input": {
                        "message": "{{data.testMsg}}"
                    },
                    "output": {
                        "data.testMsg": ""
                    }
                }
            }
        }
    ` )
};

export default mock;
