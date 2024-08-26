<template>
  <div class="middle">
    <div class="container">
      <span class="heading">
        {{ title }}
      </span>
      <div>
        <p>
          Write down your new seed phrase and store it safely. It cannot be
          recovered if lost or stolen.
        </p>
        <textarea
          id="seed"
          v-model="mnemonic"
          class="width-96"
          rows="2"
          disabled
        />
      </div>
      <div class="mb-1 checkbox-group">
        <!-- <div class="warning">
          <div class="emp">
            Do not share your secret phrase!
          </div>
          If someone has your secret phrase they will have full control of your wallet.
        </div> -->
        <div class="item-checkbox">
          <input
            v-model="seedConsent1"
            type="checkbox"
            class="checkbox"
          >
          <span
            class="label-checkbox"
          >I have safely stored my seed phrase</span>
        </div>
        <label>
          <div class="item-checkbox">
            <input
              v-model="seedConsent2"
              type="checkbox"
              class="checkbox"
            >
            <span class="label-checkbox">
              I understand there is no recovery
            </span>
          </div>
        </label>
      </div>
      <div v-if="$route.query.privateKeyExist">
        <button
          class="link"
          @click="addSeed"
        >
          Add seed
        </button>
      </div>
      <div v-else>
        <input
          id="password1"
          v-model="password1"
          class="width-96"
          type="password"
          placeholder="Set password"
        >
        <input
          id="password2"
          v-model="password2"
          class="width-96"
          type="password"
          placeholder="Confirm password"
        >
        <button
          class="custom-button primary"
          @click="createNewWallet"
        >
          next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import router from "@/index/router";
import { HDKoinos } from "../../../lib/HDKoinos";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  mixins: [Storage, ViewHelper],
  data() {
    return {
      title: "loading...",
      mnemonic: "",
      seedConsent1: false,
      seedConsent2: false,
      password1: "",
      password2: "",
    };
  },

  created() {
    if (this.$route.query.privateKeyExist) {
      this.title = "Add seed to the wallet";
    } else {
      this.title = "New wallet";
    }
    if (this.$store.state.mnemonic0) {
      this.mnemonic = this.$store.state.mnemonic0;
      this.seedConsent1 = true;
      this.seedConsent2 = true;
    } else {
      this.mnemonic = HDKoinos.randomMnemonic();
    }
    if (this.$store.state.password0) {
      this.password1 = this.$store.state.password0;
      this.password2 = this.$store.state.password0;
    }
  },

  methods: {
    checkConsents() {
      if (!this.seedConsent1)
        throw new Error(
          "please confirm that you have taken a copy of the 12 words"
        );
      if (!this.seedConsent2)
        throw new Error(
          "please confirm you know the importance of keeping this seed secret"
        );
    },

    async addSeed() {
      try {
        this.checkConsents();
        await this._saveSeedPhraseInMemory(0, this.mnemonic);
        await this._storeSeedPhrase(0);
        await this._addAccount({
          name: "Account seed 0",
          passwordId: 0,
        });

        this.alertClose();
        router.push("/dashboard");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async createNewWallet() {
      try {
        this.checkConsents();
        if (this.password1 !== this.password2)
          throw new Error("password mismatch");

        await this._savePasswordInMemory(0, this.password1);
        await this._saveSeedPhraseInMemory(0, this.mnemonic);

        this.alertClose();
        router.push("/confirmSeed");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
  },
};
</script>
<style scoped>
textarea {
  color: var(--kondor-light);
  background: none;
}
label {
  font-size: 1em !important;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}
.heading {
  text-align: center;
}
.middle {
  display: flex;
  justify-content: center;
  margin: 1em 0;
}

.width-96 {
  width: 80%;
}
.item-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1em;
}
.warning {
  background-color: #2c2424;
  border: 0.5px solid #df2828;
  border-radius: 5px;
  color: #f24e59;
  padding: 1em;
  margin: 0 1em;
  text-align: center;
}
.emp {
  font-weight: bold;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}
</style>
