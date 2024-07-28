<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>
<script>
export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>
<style scoped>
.page-title {
  background-color: #222222;
  color: #ffffff;
  padding: 20px;
  text-align: center;
}
h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

p {
  font-size: 14px;
  color: #777777;
  margin: 10px 0 0;
}
</style>