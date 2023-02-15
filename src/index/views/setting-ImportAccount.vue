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
import { Signer } from "koilib";
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
        if (!this.name) throw new Error("No name defined");
        let privateKey = "";
        let encryptedPrivateKey = "";
        let address;
        if (this.watchMode) {
          if (!this.address) throw new Error("No address defined");
          address = this.address;
        } else {
          privateKey = this.privateKey;
          encryptedPrivateKey = await this.encrypt(
            this.privateKey,
            this.$store.state.password
          );
          const signer = Signer.fromWif(this.privateKey);
          address = signer.getAddress();
        }
        this.$store.state.accounts.push({
          name: this.name,
          privateKey,
          address,
          signers: [],
        });

        const encryptedAccounts = await this._getAccounts();
        encryptedAccounts.push({
          name: this.name,
          encryptedPrivateKey,
          address,
          signers: [],
        });
        await this._setAccounts(encryptedAccounts);
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
input {
  width: 90%;
}
.container {
  min-height: 20em;
  height: 100%;
  display: flex;
  justify-content: space-around;
}
.check-box {
  display: flex;
  align-items: center;
}
.check-box span {
  font-size: 0.9em;
}
.inputs-container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 30%;
}
.buttons-container {
  display: flex;
  width: 80%;
  justify-content: space-between;
  gap: 2em;
  flex-direction: row-reverse;
}
.button-cancel {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
}
.title {
  margin-bottom: 1em;
}
</style>
