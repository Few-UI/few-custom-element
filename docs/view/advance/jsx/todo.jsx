
/* eslint-env es6 */
import React from 'react';
class TestLabel extends React.Component {
    constructor( props ) {
        super( props );
    }

    render() {
        return (
            <div>
                <div>{this.props.testVal}</div>
            </div>
        );
    }
}
export default TestLabel;
