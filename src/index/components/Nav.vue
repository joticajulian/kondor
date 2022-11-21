<template>
  <div>
    <div v-if="$store.state.showBackButton" class="header">
      <div @click="back" class="back-button">&#8592;</div>
      <div v-if="$store.state.network">
        <span class="connection-indicator">&#9724;</span
        >{{ $store.state.network }}
      </div>
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
  color: white;
  /* margin-top: 20px; */
  padding: 1em;
}
.header {
  background: var(--kondor-purple);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1em;
}
.connection-indicator {
  color: greenyellow;
}
</style>
