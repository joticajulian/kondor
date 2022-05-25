<template>
  <div class="container">
    <div v-for="(signer, index) in signers" :key="index">
      {{ signer.name }}
      {{ signer.address }}
    </div>
    <button @click="addSigner">Add signer</button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import { ethers } from "ethers";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  data() {
    return {
      signers: [],
    };
  },

  mixins: [Storage, ViewHelper],

  mounted() {
    this.loadSigners(this.$store.state.currentIndexAccount);
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadSigners(this.$store.state.currentIndexAccount);
    },
  },

  methods: {
    async loadSigners(index) {
      try {
        const currentAccount = this.$store.state.accounts[index];
        this.signers = currentAccount.signers || [];
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async addSigner() {
      try {
        const mnemonic = this.$store.state.mnemonic;
        if (!mnemonic) throw new Error("No seed phrase found");
        // if (!this.name) throw new Error("No name defined");
        const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
        const accIndex = this.$store.state.currentIndexAccount;
        const newIndex = this.signers.length;
        const keyPath = `m/44'/659'/${accIndex}'/1/${newIndex}`;
        const keyNumber = hdNode.derivePath(keyPath);
        const signer = new Signer({
          privateKey: keyNumber.privateKey.slice(2),
        });

        this.$store.state.accounts[accIndex].signers.push({
          privateKey: signer.getPrivateKey("wif"),
          name: `signer ${newIndex}`,
          address: signer.getAddress(),
        });

        const encryptedAccounts = await this._getAccounts();
        encryptedAccounts[accIndex].signers.push({
          mnemonicPath: keyPath,
          name: `signer ${newIndex}`,
          address: signer.getAddress(),
        });
        await this._setAccounts(encryptedAccounts);
        this.loadSigners(accIndex);
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
  },
};
</script>
