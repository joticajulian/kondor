<template>
  <div class="middle">
    <div class="container">
      <h1 class="heading">
        {{ title }}
      </h1>
      <div>
        <img
          src=""
          alt=""
        >
        <p>
          This is a newly generated seed phrase. Please write it down and keep
          it in safe place.
        </p>
        <textarea
          id="seed"
          v-model="mnemonic"
          class="width-96"
          rows="3"
          disabled
        />
      </div>
      <div class="mb-1">
        <div class="item-checkbox">
          <input
            v-model="seedConsent1"
            type="checkbox"
            class="checkbox"
          >
          <span
            class="label-checkbox"
          >I have stored the seed phrase in a safe place</span>
        </div>

        <label>
          <div class="item-checkbox">
            <input
              v-model="seedConsent2"
              type="checkbox"
              class="checkbox"
            >
            <span
              class="label-checkbox"
            >I understand that I must not share this seed phrase with anyone
              or else I may lose my assets</span>
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
          class=""
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
  width: 96%;
}
.item-checkbox {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 1em;
}
</style>
