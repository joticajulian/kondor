<template>
  <div>
    <div
      v-if="$store.state.showTopNav"
      class="header"
    >
      <div>
        <span 
          v-if="$store.state.showBackButton"
          class="material-icons back-button"
          @click="back"
        >
          arrow_back
        </span>
        <Logo 
          v-else
          color="#FFF" 
          width="45" 
          height="45"
        />
      </div>
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
        <span 
          class="material-icons"
        >
          expand_more
        </span>
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
import Logo from "@/shared/components/Logo";

// mixins
import Storage from "@/shared/mixins/Storage";

export default {
  components: { Logo, AccountMenu },

  mixins: [Storage],

  watch: {
    "$store.state.currentNetwork": function () {
      const network =
        this.$store.state.networks[this.$store.state.currentNetwork];
      this._setCurrentNetwork(network.tag);
    },
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
  
  font-size: 1em;
  height: 45px;
  padding: 1em;
  margin: 0;
  border-color: #FFFFFF;
  border-radius: 22px;
  appearance: none;
  cursor: pointer;
}

.network-select {
  position: relative;
}

.network-select > .material-icons {
  position: absolute;
  right: 10px;
  top: 10px;
  pointer-events: none;
  background: var(--kondor-purple);
}

.back-button {
  cursor: pointer;
  color: white;
  padding-right: 21px;
}

.header {
  background: var(--kondor-purple);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  height: 45px;
}

.connection-indicator {
  color: greenyellow;
}

.lock-button {
  cursor: pointer;
  color: white;
  font-weight: bold;
  width: 45px;
  text-align: right;
}

.lock-button:hover {
  color: #adff2f;
}
</style>
