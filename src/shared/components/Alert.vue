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
    <div
      class="close"
      @click="$emit('onClose')"
    >
      x
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.alert {
  position: fixed;
  bottom: -150px;
  margin: 0px 12px 15px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  padding: 8px 20px;
  text-align: left;
  transition: all 0.3s;
  background: var(--primary-dark-light);
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
