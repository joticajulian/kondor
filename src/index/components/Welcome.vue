<template>
  <div>
    <Logo />
    <LogoText />
    <div v-if="hasAccounts">
      <input type="password" v-model="password" placeholder="Password" />
      <button @click="unlock">unlock</button>
    </div>
    <router-link to="/newWallet"
      >import using Secret Recovery Phrase</router-link
    >
  </div>
</template>

<script>
import router from "@/index/router";
import Logo from "@/shared/components/Logo";
import LogoText from "@/shared/components/LogoText";
import Storage from "@/shared/mixins/Storage";
import AlertHelper from "@/shared/mixins/AlertHelper";

export default {
  name: "Welcome",
  data() {
    return {
      hasAccounts: false,
      password: "",
    };
  },
  mixins: [Storage, AlertHelper],

  components: { Logo, LogoText },

  mounted() {
    (async () => {
      this.hasAccounts = await this.getAccounts();
    })();
  },

  methods: {
    async unlock() {
      try {
        const enc = await this.getAccounts();
        const { privateKey } = await this.decrypt(enc, this.password);
        this.$store.state.privateKey = privateKey;
        this.alertClose();
        router.push("/dashboard");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
  },
};
</script>
