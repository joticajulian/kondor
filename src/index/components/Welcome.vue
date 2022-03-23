<template>
  <div>
    <div class="flex flex-center">
      <div class="flex flex-column">
        <Logo />
        <div class="mt-10"></div>
        <LogoText />
      </div>
    </div>

    <div v-if="hasAccounts">
      <Unlock @onUnlock="unlock()" @onError="alertDanger($event.message)" />
    </div>
    <div class="mt-50">
      <router-link to="/newWallet"
        >import using Secret Recovery Phrase</router-link
      >
    </div>
  </div>
</template>

<script>
import router from "@/index/router";
import Unlock from "@/index/components/Unlock.vue";
import Logo from "@/shared/components/Logo";
import LogoText from "@/shared/components/LogoText";
import Storage from "@/shared/mixins/Storage";
import AlertHelper from "@/shared/mixins/AlertHelper";
import Message from "@/shared/mixins/Message";

export default {
  name: "Welcome",
  data() {
    return {
      hasAccounts: false,
      password: "",
    };
  },
  mixins: [Storage, AlertHelper, Message],

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
