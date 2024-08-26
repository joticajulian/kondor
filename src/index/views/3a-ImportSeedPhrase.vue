<template>
  <div class="middle">
    <div class="container">
      <h1>Import Seed Phrase</h1>
      <img
        src=""
        alt=""
      >
      <textarea
        id="seed"
        v-model="mnemonic"
        placeholder="Seed phrase"
      />
      <input
        id="password1"
        v-model="password1"
        type="password"
        placeholder="Set password"
      >
      <input
        id="password2"
        v-model="password2"
        type="password"
        placeholder="Confirm password"
      >
      <button
        class="custom-button primary"
        @click="importSeedPhrase"
      >
        import now
      </button>
    </div>
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
      mnemonic: "",
      password1: "",
      password2: "",
    };
  },
  methods: {
    async importSeedPhrase() {
      try {
        if (this.password1 !== this.password2)
          throw new Error("password mismatch");

        await this._deleteWallet();
        await this._savePasswordInMemory(0, this.password1);
        await this._saveSeedPhraseInMemory(0, this.mnemonic);
        await this._storeSeedPhrase(0);
        await this._addAccount({
          name: "Account 0",
          passwordId: 0,
        });

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
input {
  width: 85% !important;
}
textarea {
  width: 85% !important;
  height: 100px;
  background: none !important;
  color: var(--primary-gray);
}
h1 {
  margin-bottom: 1em;
}
.container {
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
