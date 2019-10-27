/* eslint-env es6 */
import React from 'react';

class TodoTable extends React.Component {
    constructor( props ) {
        super( props );
    }

    render() {
        return (
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {
                    this.props.items.map( ( item, idx ) =>
                        <tr key={idx}>
                          <td>{item.item_desc}</td>
                          <td>{item.item_status}</td>
                        </tr>
                    )
                }
              </tbody>
            </table>
        );
    }
}
export default TodoTable;
