<template>
    <div>
        <h2>Vue Todo</h2>
        <todo-form  v-on:add-todo="addTodo"></todo-form>
        <todo-table v-bind:items="todoList"></todo-table>
    </div>
</template>

<script>
let TodoForm = require("./todo-form.vue");
let TodoTable = require("./todo-table.vue");
module.exports = {
    data: function() {
        return {
            todoList: [
            ],
            count: 0
        };
    } ,
    methods: {
        addTodo: function( item ) {
            this.todoList.push( {
                id: this.count++,
                item_desc: item.item_desc,
                item_status: item.item_status
            });
        }
    },
    components: {
        'todo-form': TodoForm,
        'todo-table': TodoTable
    }
}
</script>
