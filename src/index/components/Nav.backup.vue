<template>
  <div>
    <div
      v-if="
        $store.state.showBackButton ||
          $store.state.showCurrentNetwork ||
          $store.state.showAvatarMenu
      "
      class="header"
    >
      <div class="left">
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
          :width="45"
          :height="45"
        />
      </div>
      <div
        v-if="$store.state.showCurrentNetwork"
        class="network-select"
      >
        <select v-model="$store.state.currentNetwork">
          <option
            v-for="(network, index) in $store.state.networks"
            :key="index"
            :value="index"
          >
            {{ network.name }}
          </option>
        </select>
        <span class="material-icons"> expand_more </span>
      </div>
      <AvatarMenu v-if="$store.state.showAvatarMenu" />
    </div>
    <AccountMenu v-if="$store.state.showAccountMenu" />
  </div>
</template>

<script>
import router from "@/index/router";
import AccountMenu from "@/index/components/AccountMenu.vue";
import AvatarMenu from "@/index/components/AvatarMenu.vue";
import Logo from "@/shared/components/Logo";

// mixins
import Storage from "@/shared/mixins/Storage";

export default {
  components: { Logo, AccountMenu, AvatarMenu },

  mixins: [Storage],

  watch: {
    "$store.state.currentNetwork": function () {
      const network =
        this.$store.state.networks[this.$store.state.currentNetwork];
      this._setCurrentNetwork(network.tag);
    },
    "$store.state.accounts": function () {
      if (
        router.currentRoute.path !== "/" &&
        this.$store.state.accounts.length === 0
      )
        router.push("/");
    },
  },

  mounted() {
    if (
      router.currentRoute.path !== "/" &&
      this.$store.state.accounts.length === 0
    )
      router.push("/");
  },

  methods: {
    back() {
      router.back();
    },
  },
};
</script>

<style scoped>
select,
select:focus-visible,
select:focus {
  background: var(--kondor-purple);
  color: var(--kondor-light);
  font-size: 1em;
  height: 45px;
  padding: 1em;
  margin: 0;
  border-color: var(--primary-light);
  border-radius: 22px;
  appearance: none;
  cursor: pointer;
  box-sizing: border-box;
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

.network-select:hover > .material-icons {
  opacity: 0.8;
}

.back-button {
  cursor: pointer;
  color: var(--kondor-light);
  padding-right: 21px;
}

.header {
  background: var(--kondor-purple);
  color: var(--kondor-light);
  display: flex;
  gap: 1em;
  align-items: center;
  padding: 1em;
  height: 45px;
}

.header .left {
  flex-grow: 1;
}

.connection-indicator {
  color: greenyellow;
}

.lock-button {
  cursor: pointer;
  color: var(--kondor-light);
  font-weight: bold;
  width: 45px;
  text-align: right;
}

.lock-button:hover {
  color: #adff2f;
}
</style>
