
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
                    "name": "log",
                    "input": {
                        "message": "{{data.testMsg}}"
                    }
                }
            }
        }
    ` )
};

export default mock;
