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
    <div class="message">
      {{ message }}
    </div>
    <div @click="$emit('onClose')" class="close">X</div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  border-radius: 6px;
  padding: 8px 20px;
  text-align: left;
  transition: all 0.3s;
  font-family: "Roboto" sans-serif !important;
  background: #292929;
  color: #f7d4d4;
}

.show {
  bottom: 30px;
}
.close {
  padding: 1em 0 1em 1em;
  cursor: pointer;
  font-size: 1.5em;
}
.message {
  padding: 2em 0;
}
.danger {
  border-bottom: 3px solid red;
}
.info {
  border-bottom: 3px solid orange;
}
.success {
  border-bottom: 3px solid greenyellow;
}
</style>
