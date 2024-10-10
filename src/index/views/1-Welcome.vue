<template>
  <div class="container">
    <div
      v-if="hasAccounts"
      class="unlock"
    >
      <!--
    <div class="logo">
      <img
        src="../../../public/images/kondor-logo.png"
        alt=""
      >
    </div>
    -->
      <Unlock
        @onUnlock="unlock()"
        @onError="alertDanger($event)"
      />
    </div>
    <div
      v-if="!hasAccounts"
      class="welcome-message"
    >
      <div class="logo">
        <img
          src="../../../public/images/kondor-logo-group.svg"
          alt=""
        >
      </div>
      <div class="title">
        Welcome to Kondor!
      </div>
      The first of its kind wallet for the first of its kind blockchain, Koinos.
    </div>
    <router-link
      v-if="hasAccounts"
      to="/importSeedPhrase"
      class="button w-vw"
    >
      <button class="custom-button secondary mt-1">
        Forgot password?
      </button>
    </router-link>
    <div
      v-else
      class="button-group"
    >
      <div
        class="custom-button primary"
        @click="generateSeed"
      >
        Create Wallet
      </div>
      <div
        class="custom-button secondary"
        @click="importSeedPhrase"
      >
        Restore Wallet
      </div>
    </div>
  </div>
</template>

<script>
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

// components
import Unlock from "@/shared/components/Unlock.vue";

export default {
  name: "Welcome",

  components: { Unlock },
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
    async importSeedPhrase() {
      this.alertClose();
      router.push("/importSeedPhrase");
    },
    async generateSeed() {
      this.alertClose();
      router.push("/generateSeed");
    },
  },
};
</script>

<style scoped>
input {
  margin: 0 !important;
}
.group {
  margin-bottom: 2em;
}
.title {
  font-family: "Poppins", sans-serif;
  padding: 1em;
  font-size: 1.4em;
  margin-top: 2em;
  font-weight: bold;
  padding: 0.5em 1em;
}
.container {
  font-family: Poppins, sans-serif;
  align-items: center;
  width: 100%;
  margin: 1.8em 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
  line-height: 1.5em;
  justify-content: space-between;
}
.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  width: 80%;
  padding: 1.5em 0;
}

.welcome-message {
  width: 60%;
  margin: 2em 0;
  line-height: 1.2em;
  text-align: center;
  margin-bottom: 5em;
}
.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4em;
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
  margin-top: 3em;
  height: 100%;
}
.w-vw {
  width: 100vw;
}
.mt-1 {
  margin-top: 4em;
}
</style>
