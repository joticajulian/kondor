<template>
  <div>
    <h1>Import Private Key</h1>
    <img src="" alt="" />
    <input
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
    <button @click="importKey">Import now</button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import router from "@/index/router";
import Storage from "@/shared/mixins/Storage";
import AlertHelper from "@/shared/mixins/AlertHelper";

export default {
  data() {
    return {
      privateKey: "",
      password1: "",
      password2: "",
    };
  },
  mixins: [Storage, AlertHelper],
  methods: {
    async importKey() {
      try {
        if (this.password1 !== this.password2)
          throw new Error("password mismatch");
        const signer = Signer.fromWif(this.privateKey);
        const accounts = [
          {
            address: signer.getAddress(),
            name: "",
            encryptedPrivateKey: await this.encrypt(
              this.privateKey,
              this.password1
            ),
          },
        ];
        await this._setAccounts(accounts);
        this.$store.state.privateKey = this.privateKey;
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
