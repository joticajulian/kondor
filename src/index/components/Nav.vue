<template>
  <div>
    <div
      v-if="$store.state.showBackButton"
      class="header"
    >
      <div
        class="back-button"
        @click="back"
      >
        &#8592;
      </div>
      <div v-if="$store.state.networks.length">
        <span class="connection-indicator">&#9724;</span>{{ $store.state.networks[$store.state.currentNetwork].name }}
      </div>
      <div
        class="lock-button"
        @click="lock()"
      >
        Lock
      </div>
    </div>
    <AccountMenu v-if="$store.state.showAccountMenu" />
  </div>
</template>

<script>
import router from "@/index/router";
import AccountMenu from "@/index/components/AccountMenu.vue";

// mixins
import Storage from "@/shared/mixins/Storage";

export default {
  components: { AccountMenu },

  mixins: [Storage],

  methods: {
    back() {
      router.back();
    },

    async lock() {
      await this._removePasswordsFromSession();
      router.push("/");
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
.lock-button {
  cursor: pointer;
  color: white;
  padding-right: 1em;
  font-weight: bold;
}
.lock-button:hover {
  color: rgb(246, 151, 19);
}
</style>
