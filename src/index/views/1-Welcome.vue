<template>
  <div class="container">
    <div class="logo">
      <div><Logo /></div>
      <br>
      <div><LogoText /></div>
    </div>
    <div
      v-if="hasAccounts"
      class="unlock"
    >
      <Unlock
        @onUnlock="unlock()"
        @onError="alertDanger($event)"
      />
    </div>
    <div
      v-if="!hasAccounts"
      class="welcome-message"
    >
      Welcome to Kondor!
      <br>The first of its kind wallet for the first of its kind blockchain,
      Koinos.
    </div>
    <router-link
      v-if="hasAccounts"
      to="/importSeedPhrase"
      class="button"
    >
      <button>Forgot password?</button>
    </router-link>
    <router-link
      v-else
      to="/newWallet"
    >
      <button>New Wallet</button>
    </router-link>
  </div>
</template>

<script>
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

// components
import Unlock from "@/shared/components/Unlock.vue";
import Logo from "@/shared/components/Logo";
import LogoText from "@/shared/components/LogoText";

export default {
  name: "Welcome",

  components: { Logo, LogoText, Unlock },
  mixins: [Storage, ViewHelper],
  data() {
    return {
      hasAccounts: false,
    };
  },

  mounted() {
    (async () => {
      const encAccounts = await this._getAccounts();
      this.hasAccounts = encAccounts && encAccounts.length > 0;
    })();
  },

  methods: {
    async unlock() {
      this.alertClose();
      router.push("/dashboard");
    },
  },
};
</script>

<style scoped>
input {
  margin: 0 !important;
}
button {
  margin-left: -8px !important;
}

.container {
  align-items: center;
}

.welcome-message {
  width: 77%;
  margin: 2em 0;
  line-height: 1.2em;
  color: var(--primary-color);
  text-align: center;
}
.logo {
  display: flex;
  flex-direction: column;
  padding-top: 3em;
  align-items: center;
  width: 100%;
}
.recover {
  margin-top: 1em;
  background: none;
  color: var(--kondor-purple);
  margin-left: -0.7em;
  text-decoration: underline;
  border: none;
}
.unlock {
  width: 70%;
}
.button {
  width: 100%;
  margin: 0 auto;
  text-align: center;
  margin-bottom: 2em;
}

.button button {
  background: none;
  text-decoration: underline;
  color: var(--kondor-purple);
  border: none;
  margin-left: -8px;
}
</style>
