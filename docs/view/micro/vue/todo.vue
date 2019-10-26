<template>
    <div>
        <h2>Vue Todo</h2>
        <todo-form v-bind:items="todoList"></todo-form>
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
            ]
        };
    } ,
    components: {
        'todo-form': TodoForm,
        'todo-table': TodoTable
    }
}
</script>
