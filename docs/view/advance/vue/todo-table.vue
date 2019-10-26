<template>
    <table class="vue-style">
      <thead>
        <tr>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item of items" v-bind:key="item.id">
          <td>{{item.item_desc}}</td>
          <td>{{item.item_status}}</td>
        </tr>
      </tbody>
    </table>
</template>

<script>
module.exports = {
    props: ['items'],
}
</script>

<style>
.vue-style {
    color: #42b983;
}
</style>
