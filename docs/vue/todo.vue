<template>
    <div>
        <todo-form v-bind:items="todoList"></todo-form>
        <todo-table v-bind:items="todoList"></todo-table>
    </div>
</template>

<script>
let TodoForm = require("vue/todo-form.vue");
let TodoTable = require("vue/todo-table.vue");
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
