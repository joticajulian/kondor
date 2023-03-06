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
      <!-- <div v-if="$store.state.networks.length">
        {{ $store.state.networks[$store.state.currentNetwork].name }}
      </div> -->
      <div class="network-select">
        <select v-model="$store.state.currentNetwork">
          <option
            v-for="(network, index) in $store.state.networks"
            :key="index"
            :value="index"
          >
            {{ network.name }}
          </option>
        </select>
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

  data() {
    return {
      showBackButton: false,
    };
  },

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
select,
select:focus-visible,
select:focus {
  background: var(--kondor-purple);
  color: white;
  border: none !important;
  font-size: 1em;
  padding: 0.5em;
  margin: 0;
  border: unset !important;
}

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
  color: #adff2f;
}
</style>
