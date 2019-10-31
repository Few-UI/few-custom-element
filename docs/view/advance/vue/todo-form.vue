<template>
    <form @submit.prevent="$emit('add-todo', { item_desc, item_status })">
      <label for="desc">Todo:</label>
      <input id="desc" type="text" name="item_desc" v-model="item_desc" />
      <label for="status">Status:</label>
      <select id="status" name="item_status" v-model="item_status">
        <option value="Pending">Pending</option>
        <option value="Done">Done</option>
        <option value="In Progress">In Progress</option>
      </select>
      <button type="submit" class="vue-button">Add</button>
    </form>
</template>

<script>
module.exports = {
    data: function() {
        return {
            id: '',
            item_desc: '',
            item_status: 'Pending'
        };
    }
}
</script>

<style>
.vue-button {
    background-color: #42b983;
    border-color: #42b983;
}
</style>
