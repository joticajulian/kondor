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
      console.log("click unlock");
      try {
        const accounts = await this.getAccounts();
        const privateKey = await this.decrypt(
          accounts[0].encryptedPrivateKey,
          this.password
        );
        this.$store.state.privateKey = privateKey;
        this.$emit("onUnlock");
        console.log("unlock ok");
      } catch (error) {
        this.$emit("onError", error);
        console.log("unlock error");
        console.log(error);
      }
    },
  },
};
</script>
