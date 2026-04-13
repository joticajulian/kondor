<template>
  <div class="container">
    <div class="logo">
      <img
        src="../../../public/images/kondor-logo.png"
        alt=""
      >
    </div>
    <div
      v-if="loadingSession"
      class="loader"
    />
    <div
      v-else
      class="group"
    >
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        autofocus
        @keyup.enter="unlock"
      >
      <button
        class="custom-button primary m-0"
        @click="unlock"
      >
        {{ labelButton }}
      </button>
    </div>
  </div>
</template>

<script>
import Storage from "@/shared/mixins/Storage";
import { HDKoinos } from "../../../lib/HDKoinos";
import { decryptAccountsWithPassword } from "../../../lib/wallet";

export default {
  name: "Unlock",
  mixins: [Storage],

  props: {
    labelButton: {
      type: String,
      default: "unlock",
    },
    autocomplete: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      loadingSession: true,
      password: "",
    };
  },

  created() {
    (async () => {
      if (this.autocomplete) {
        const password = await this._readSession("password0");
        if (password) {
          this.password = password;
          await this.unlock();
        }
      }
      this.loadingSession = false;
    })();
  },

  methods: {
    async unlock() {
      try {
        const encryptedMnemonic = await this._getMnemonic(0);
        const encryptedAccounts = await this._getAccounts();
        const { mnemonic, accounts: decryptedAccounts } =
          await decryptAccountsWithPassword({
            password: this.password,
            encryptedMnemonic,
            encryptedAccounts,
            decryptText: this.decrypt,
          });
        const hdKoinos = mnemonic ? new HDKoinos(mnemonic) : null;
        const accounts = decryptedAccounts.map((account) => {
          const signers = (account.signers || []).map((signer) => {
            if (!signer.keyPath || !hdKoinos) {
              return {
                name: signer.name,
                address: signer.address,
                privateKey: "",
              };
            }
            const signerAcc = hdKoinos.deriveKey(signer);
            return {
              ...signerAcc.public,
              ...signerAcc.private,
            };
          });
          return {
            ...account,
            signers,
          };
        });

        this.$store.state.mnemonic0 = mnemonic;
        this.$store.state.accounts = accounts;
        await this._savePasswordInMemory(0, this.password);

        this.$emit("onUnlock", this.password);
      } catch (error) {
        this.$emit("onError", error);
      }
    },
  },
};
</script>
<style scoped>
input {
  width: 93% !important;
  margin: none;
}
.group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 4em;
}
.m-0 {
  margin: 0;
}
</style>
