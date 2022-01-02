<template>
  <div>
    <Logo />
    <LogoText />
    <input type="password" placeholder="Password" />
    <button @click="clicked">unlock</button>
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
  mixins: [Storage, AlertHelper],
  components: { Logo, LogoText },
  methods: {
    async clicked() {
      router.push("/dashboard");
    },
  },
};
</script>
