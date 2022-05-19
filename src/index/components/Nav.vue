<template>
  <div>
    <button @click="back"><span>&#8592;</span></button>
    <AccountMenu />
  </div>
</template>

<script>
import router from "@/index/router";
import AccountMenu from "@/index/components/AccountMenu.vue";

export default {
  components: { AccountMenu },

  methods: {
    back() {
      router.back();
    },
  },
};
</script>
