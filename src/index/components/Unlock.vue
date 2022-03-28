<template>
  <div class="container">
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="unlock" class="link">unlock</button>
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
        const accounts = await this.getAccounts();
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
<style scoped>
  .container {
    margin-top: 3em;
    margin-bottom: 2em;
  }
  .link {
  border-bottom: 1px dotted white;
  padding-bottom: 8px;
}
.link:hover {
  border-bottom: 2px solid white;
  color: white;
}
</style>
