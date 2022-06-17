<template>
  <div class="message">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: String,
  },
};
</script>

<style scoped>
.message {
  padding: 0.8em;
  font-size: 0.7em;
  color: black;
  margin: 5px 0px;
  background-color: orange;
}
</style>
