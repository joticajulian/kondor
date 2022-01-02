<template>
  <div
    class="alert"
    :class="{
      success: type === 'success',
      danger: type === 'danger',
      info: type === 'info',
      show: show,
    }"
  >
    <div>
      {{ message }}
    </div>
    <button @click="$emit('onClose')">X</button>
  </div>
</template>

<script>
export default {
  props: {
    type: String,
    message: String,
    show: Boolean,
  },
};
</script>

<style scoped>
.alert {
  position: fixed;
  bottom: -150px;
  margin-bottom: 15px;
  display: block;
  width: 269px;
  border-radius: 6px;
  padding: 8px 20px;
  text-align: left;
  transition: all 0.3s;
}

.show {
  bottom: 30px;
}

.danger {
  background: #ff9f9f;
  color: #8a0000;
}
.info {
  background: #ffef9f;
  color: #828a00;
}
.success {
  background: #9fffbd;
  color: #008a24;
}
</style>
