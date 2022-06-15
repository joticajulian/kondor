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
import { HDKoinos } from "../../../lib/HDKoinos";

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
        const hdKoinos = new HDKoinos(mnemonic);
        const accIndex = this.$store.state.currentIndexAccount;
        const { keyPath } = this.$store.state.accounts[accIndex];
        const { accountIndex, signerIndex } = HDKoinos.parsePath(keyPath);
        if (signerIndex)
          throw new Error(`Invalid keyPath ${keyPath} for accounts`);
        let newIndex = 0;
        this.signers.forEach((sig) => {
          if (sig.keyPath) newIndex += 1;
        });
        const signerAcc = hdKoinos.deriveKeySigner(
          accountIndex,
          newIndex,
          `signer ${newIndex}`
        );

        this.$store.state.accounts[accIndex].signers.push({
          ...signerAcc.public,
          ...signerAcc.private,
        });

        const encryptedAccounts = await this._getAccounts();
        if (encryptedAccounts[accIndex].signers) {
          encryptedAccounts[accIndex].signers.push({
            ...signerAcc.public,
          });
        } else {
          encryptedAccounts[accIndex].signers = [];
        }
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
<style scoped>
.container {
  min-height: 20em;
  margin: 4em 2em;
}
</style>
