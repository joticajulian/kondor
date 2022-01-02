<template>
  <div>
    <button @click="back"><span>&#8592;</span></button>
  </div>
</template>

<script>
import router from "@/index/router";

export default {
  methods: {
    back() {
      router.back();
    },
  },
};
</script>
