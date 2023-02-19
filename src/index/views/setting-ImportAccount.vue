<template>
  <div class="container">
    <h1>Import account</h1>
    <input
      v-model="name"
      type="text"
      placeholder="Name"
      @keyup.enter="accept"
    >
    <input
      id="watch-mode"
      v-model="watchMode"
      type="checkbox"
      name="watch-mode"
      value="watch-mode"
    >
    <label for="watch-mode">Import in watch mode (without private key)</label><br>
    <div v-if="watchMode">
      <div>Address</div>
      <input
        v-model="address"
        type="text"
        placeholder="Address"
        @keyup.enter="accept"
      >
    </div>
    <div v-else>
      <div>Private key</div>
      <input
        v-model="privateKey"
        type="text"
        placeholder="Private Key"
        @keyup.enter="accept"
      >
    </div>
    <button
      class=""
      @click="accept"
    >
      accept
    </button>
    <button
      class=""
      @click="cancel"
    >
      cancel
    </button>
  </div>
</template>

<script>
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  mixins: [Storage, ViewHelper],
  data() {
    return {
      name: "",
      watchMode: false,
      address: "",
      privateKey: "",
    };
  },

  methods: {
    async accept() {
      try {
        await this._addAccount({
          name: this.name,
          privateKey: this.privateKey,
          watchMode: this.watchMode,
          address: this.address,
        });

        this.$store.state.currentIndexAccount =
          this.$store.state.accounts.length - 1;
        router.back();
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    cancel() {
      router.back();
    },
  },
};
</script>
<style scoped>
input[type="checkbox"] {
  all: revert;
}
.container {
  min-height: 20em;
  margin: 4em 2em;
}
</style>
