let mock = {
    view: '<button>{{data.testMsg}}</button>',
    viewModel: JSON.parse( `
        {
            "data": {
                "testMsg": "Hello World!"
            },
            "function": {
                "testFunc1": {
                    "name": "alert",
                    "input": {
                        "message": "{{data.testMsg}}"
                    }
                }
            }
        }
    ` )
};

export default mock;
