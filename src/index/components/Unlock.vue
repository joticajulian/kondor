<template>
  <div>
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="unlock">unlock</button>
  </div>
</template>

<script>
import Storage from "@/shared/mixins/Storage";

export default {
  name: "Unlock",
  data() {
    return {
      password: "",
    };
  },
  mixins: [Storage],

  methods: {
    async unlock() {
      try {
        const accounts = await this._getAccounts();
        const privateKey = await this.decrypt(
          accounts[0].encryptedPrivateKey,
          this.password
        );
        this.$store.state.privateKey = privateKey;
        this.$emit("onUnlock");
      } catch (error) {
        this.$emit("onError", error);
      }
    },
  },
};
</script>
