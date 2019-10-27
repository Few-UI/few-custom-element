/* eslint-env es6 */
import React from 'react';

class TodoForm extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            item_desc: '',
            item_status: 'Pending'
        };

        this.buttonStyle = {
            color: '#000000',
            backgroundColor: '#61dafb',
            borderColor: '#61dafb'
        };

        // TODO: This is very bad for react
        // https://reactjs.org/docs/handling-events.html
        this.handleSubmit = this.handleSubmit.bind( this );
        this.handleItemDescChange = this.handleItemDescChange.bind( this );
        this.handleItemStatusChange = this.handleItemStatusChange.bind( this );
    }

    handleItemDescChange( event ) {
        this.setState( { item_desc: event.target.value } );
    }

    handleItemStatusChange( event ) {
        this.setState( { item_status: event.target.value } );
    }

    handleSubmit( e ) {
        e.preventDefault();
        this.props.setAddItemState( this.state );
    }

    // Practice below is following OOTB doc:
    // https://reactjs.org/docs/forms.html
    // which is completely unnecessary...
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
              <label htmlFor='desc'>Todo:</label>
              <input id='desc' type='text' value={this.state.item_desc} onChange={this.handleItemDescChange}/>
              <label htmlFor='status'>Status:</label>
              <select id='status' value={this.state.item_status} onChange={this.handleItemStatusChange}>
                <option value='Pending'>Pending</option>
                <option value='Done'>Done</option>
                <option value='In Progress'>In Progress</option>
              </select>
              <button type='submit' style={this.buttonStyle}>Add</button>
            </form>
        );
    }
}
export default TodoForm;
