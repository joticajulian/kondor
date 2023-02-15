<template>
  <div class="container">
    <h1>Import account</h1>
    <input
      @keyup.enter="accept"
      type="text"
      v-model="name"
      placeholder="Name"
    />
    <input
      type="checkbox"
      id="watch-mode"
      name="watch-mode"
      value="watch-mode"
      v-model="watchMode"
    />
    <label for="watch-mode">Import in watch mode (without private key)</label
    ><br />
    <div v-if="watchMode">
      <div>Address</div>
      <input
        @keyup.enter="accept"
        type="text"
        v-model="address"
        placeholder="Address"
      />
    </div>
    <div v-else>
      <div>Private key</div>
      <input
        @keyup.enter="accept"
        type="text"
        v-model="privateKey"
        placeholder="Private Key"
      />
    </div>
    <button @click="accept" class="">accept</button>
    <button @click="cancel" class="">cancel</button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  data() {
    return {
      name: "",
      watchMode: false,
      address: "",
      privateKey: "",
    };
  },

  mixins: [Storage, ViewHelper],

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
.container {
  min-height: 20em;
  margin: 4em 2em;
}
</style>
