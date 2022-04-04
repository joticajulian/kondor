<template>
  <div class="middle">
    <div class="container">
      <h1>Import Seed Phrase</h1>
      <img src="" alt="" />
      <input
        id="seed"
        v-model="mnemonic"
        placeholder="Seed phrase"
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
      <button @click="importSeedPhrase" class="link">import now</button>
    </div>
  </div>
</template>

<script>
import { Signer } from "koilib";
import router from "@/index/router";
import Storage from "@/shared/mixins/Storage";
import AlertHelper from "@/shared/mixins/AlertHelper";
const ethers = require("ethers");
export default {
  data() {
    return {
      mnemonic: "",
      password1: "",
      password2: "",
    };
  },
  mixins: [Storage, AlertHelper],
  methods: {
    async importSeedPhrase() {
      try {

        if (this.password1 !== this.password2)
          throw new Error("password mismatch");
        const hdNode = ethers.utils.HDNode.fromMnemonic(this.mnemonic);
        const keyNumber0 = hdNode.derivePath("m/44'/659'/0'/0/0");
        const signer = new Signer({ privateKey: keyNumber0.privateKey.slice(2) });
        const privateKey = signer.getPrivateKey("wif", false);
        const accounts = [
          {
            address: signer.getAddress(),
            name: "",
            encryptedPrivateKey: await this.encrypt(
              privateKey,
              this.password1
            ),
          },
        ];
        await this._setAccounts(accounts);
        this.$store.state.privateKey = privateKey;
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
.container {
  font-family: Arial, Helvetica, sans-serif;
  color: var(--kondor-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}
.middle {
  display: flex;
  justify-content: center;
}
</style>
