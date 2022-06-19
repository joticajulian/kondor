<template>
  <div class="container">
    <div class="logo">
      <div><Logo /></div>
      <br />
      <div><LogoText /></div>
    </div>
    <div v-if="hasAccounts" class="unlock">
      <Unlock @onUnlock="unlock()" @onError="alertDanger($event)" />
    </div>
    <div class="welcome-message" v-if="!hasAccounts">
      Welcome to Kondor!
      <br />The first of its kind wallet for the first of its kind blockchain,
      Koinos.
    </div>
    <router-link to="/newWallet" class="link">
      <div v-if="hasAccounts" class="recover">Recover Wallet</div>
      <div v-else>New Wallet</div>
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
  data() {
    return {
      hasAccounts: false,
    };
  },
  mixins: [Storage, ViewHelper],

  components: { Logo, LogoText, Unlock },

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
.container {
  height: 100%;
}
.welcome-message {
  width: 77%;
  margin: 2em 0;
  line-height: 1.2em;
  color: var(--kondor-light);
  text-align: center;
}
.logo {
  display: flex;
  flex-direction: column;
  padding-top: 4em;
  align-items: center;
  width: 100%;
}
.recover {
  margin-top: 3em;
}
.unlock {
  width: 70%;
  margin-top: 2em;
}
</style>
