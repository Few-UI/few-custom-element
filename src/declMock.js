let mock = {
    view: '<button>{{data.testMsg}}</button>',
    data: JSON.parse( `
        {
            "schemaVersion": "1.0.0",
            "data": {
                "testMsg": "Hello World!"
            }
        }
    ` )
};

export default mock;
