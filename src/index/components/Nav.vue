<template>
  <nav class="navbar">
    <div
      class="navbar-left"
    >
      <AvatarMenu v-if="$store.state.showAvatarMenu" />
      <AccountMenu v-if="$store.state.showAccountMenu" />
    </div>
    <div class="navbar-right">
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  color: white;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #777777;
}

.navbar-right {
  display: flex;
  gap: 0.5rem;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ffffff;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.icon-button {
  background: none;
  border: none;
  color: white;
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
    color: white;
}
</style>
Last edited 8 minutes ago Claude
