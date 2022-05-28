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
      Welcome to kondor!
      <br />the first of its kind wallet for the first of its kind blockchain,
      koinos
    </div>
    <router-link to="/newWallet" class="link">
      <div v-if="hasAccounts" class="recover">Recover Wallet</div>
      <div v-else>unlock</div>
    </router-link>
  </div>
</template>

<script>
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Message from "@/shared/mixins/Message"; // todo: don't use Welcome.vue as landing page for popups

// components
import Unlock from "@/index/components/Unlock.vue";
import Logo from "@/shared/components/Logo";
import LogoText from "@/shared/components/LogoText";

export default {
  name: "Welcome",
  data() {
    return {
      hasAccounts: false,
      password: "",
    };
  },
  mixins: [Storage, ViewHelper, Message],

  components: { Logo, LogoText, Unlock },

  mounted() {
    (async () => {
      this.hasAccounts = await this._getAccounts();
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
.link {
  border-bottom: 1px dotted white;
  padding-bottom: 8px;
}
.link:hover {
  border-bottom: 2px solid white;
  color: white;
}
.recover {
  margin-top: 3em;
}
.unlock {
  width: 70%;
  margin-top: 2em;
}
</style>
