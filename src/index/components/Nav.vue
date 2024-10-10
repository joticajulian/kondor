<template>
  <nav class="navbar">
    <div class="navbar-left">
      <AvatarMenu v-if="$store.state.showAvatarMenu" />
    </div>
    <div class="navbar-right">
      <AccountMenu v-if="$store.state.showAccountMenu" />
      <!-- <button class="icon-button">
        <img
          src="../../../public/images/home-icon.png"
          alt=""
        >
        <span class="material-icons">home</span>
      </button> -->
    </div>
  </nav>
</template>

<script>
import router from "@/index/router";
import AccountMenu from "@/index/components/AccountMenu.vue";
import AvatarMenu from "@/index/components/AvatarMenu.vue";

// mixins
import Storage from "@/shared/mixins/Storage";

export default {
  components: { AccountMenu, AvatarMenu },

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
.navbar {
  display: grid;
  grid-template-columns: 1fr 4fr 1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  background: var(--primary-darker);
  padding: 0.5rem 1em;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5em;
}

.navbar-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-gray);
}

.navbar-right {
  display: flex;
  justify-content: center;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-darker);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.icon-button {
  background: none;
  border: none;
  color: var(--kondor-light);
  cursor: pointer;
  padding: 0.25rem;
}

.icon-button:hover {
  opacity: 0.8;
}

.material-icons {
  font-size: 1.25rem;
}
.white {
  color: var(--kondor-light);
}
</style>
Last edited 8 minutes ago Claude
