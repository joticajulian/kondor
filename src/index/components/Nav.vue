<template>
  <div>
    <div v-if="$store.state.showBackButton" @click="back" class="back-button">
      <span>&#8592;</span>
    </div>
    <AccountMenu v-if="$store.state.showAccountMenu" />
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
<style scoped>
.back-button {
  cursor: pointer;
}
</style>
