/* eslint-env es6 */
import React from 'react';
import TodoForm from './todo-form.jsx';
import TodoTable from './todo-table.jsx';

class Todo extends React.Component {
    constructor( props ) {
        super( props );
        this.todoList = [
        ];
        this.state = { newItem: null };

        // TODO: This is very bad for react
        // https://reactjs.org/docs/handling-events.html
        this.setAddItemState = this.setAddItemState.bind( this );
    }

    // Can't belive this is the OOTB solution for react
    // https://reactjs.org/docs/lifting-state-up.html
    setAddItemState( newItem ) {
        this.setState( { newItem: newItem } );
    }

    addItem( item ) {
        if ( item ) {
            this.todoList.push( item );
        }
    }

    render() {
        // setState will trigger render? like magic
        this.addItem( this.state.newItem );
        return (
            <div>
                <h2>Jsx Todo</h2>
                <TodoForm setAddItemState={this.setAddItemState}></TodoForm>
                <TodoTable items={this.todoList}></TodoTable>
            </div>
        );
    }
}
export default Todo;
