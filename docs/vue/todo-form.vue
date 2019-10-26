<template>
    <form @submit.prevent="addTodo">
      <label for="desc">Todo:</label>
      <input id="desc" type="text" name="item_desc" v-model="item_desc" />
      <label for="status">Status:</label>
      <select id="status" name="item_status" v-model="item_status">
        <option value="Pending">Pending</option>
        <option value="Done">Done</option>
        <option value="In Progress">In Progress</option>
      </select>
      <button type="submit">Add</button>
    </form>
</template>

<script>
var i = 0;
module.exports = {
    props: ['items'],
    data: function() {
        return {
            id: '',
            item_desc: '',
            item_status: ''
        };
    } ,
    methods: {
        addTodo: function( event ) {
            this.items.push( {
                id: i++,
                item_desc: this.item_desc,
                item_status: this.item_status
            });
        }
    }
}
</script>
