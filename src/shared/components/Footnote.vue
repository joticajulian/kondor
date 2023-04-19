<template>
  <div class="message">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.message {
  padding: 0.8em;
  font-size: 1em;
  color: black;
  margin: 1em 0;
  background-color: orange;
}
</style>
