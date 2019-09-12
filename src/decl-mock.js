let mock = {
    view: '' +
            '<decl-button click="testAction">{{data.testMsg}}</decl-button>',
    viewModel: JSON.parse( `
        {
            "data": {
                "testMsg": "Hello World!"
            },
            "function": {
                "testAction": {
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
