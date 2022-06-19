<template>
  <div class="middle">
    <div class="container">
      <h1>Import Private Key</h1>
      <img src="" alt="" />
      <textarea
        id="private-key"
        v-model="privateKey"
        type="password"
        placeholder="Private key"
      />
      <input
        id="password1"
        v-model="password1"
        type="password"
        placeholder="Set password"
      />
      <input
        id="password2"
        v-model="password2"
        type="password"
        placeholder="Confirm password"
      />
      <button @click="importKey" class="">import now</button>
    </div>
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
      privateKey: "",
      password1: "",
      password2: "",
    };
  },
  mixins: [Storage, ViewHelper],
  methods: {
    async importKey() {
      try {
        if (this.password1 !== this.password2)
          throw new Error("password mismatch");
        const signer = Signer.fromWif(this.privateKey);
        await this._setMnemonic(null);
        await this._setAccounts([
          {
            name: "Account 0",
            encryptedPrivateKey: await this.encrypt(
              this.privateKey,
              this.password1
            ),
            address: signer.getAddress(),
            signers: [],
          },
        ]);

        this.$store.state.mnemonic = null;
        this.$store.state.accounts = [
          {
            name: "Account 0",
            privateKey: this.privateKey,
            address: signer.getAddress(),
            signers: [],
          },
        ];
        this.$store.state.password = this.password1;

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
<style scoped>
h1 {
  margin: 1em 0;
}
.container {
  color: var(--kondor-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}
.middle {
  display: flex;
  justify-content: center;
  margin: 1em 0;
}
</style>
