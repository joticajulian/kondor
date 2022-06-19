<template>
  <div class="middle">
    <div class="container">
      <h1 class="heading">{{ title }}</h1>
      <div>
        <img src="" alt="" />
        <p>
          This is a newly generated seed phrase. Please write it down and keep it in safe place.
        </p>
        <textarea
          class="width-96"
          rows="3"
          id="seed"
          v-model="mnemonic"
          disabled
        />
      </div>
      <div class="mb-1">
        <div class="item-checkbox">
          <input type="checkbox" v-model="seedConsent1" class="checkbox" />
          <span class="label-checkbox"
            >I have stored the seed phrase in a safe place</span
          >
        </div>

        <label>
          <div class="item-checkbox">
            <input type="checkbox" v-model="seedConsent2" class="checkbox" />
            <span class="label-checkbox"
              >I understand that I must not share this seed phrase with anyone or else
              I may lose my assets</span
            >
          </div>
        </label>
      </div>
      <div v-if="$route.query.privateKeyExist">
        <button @click="addSeed" class="link">Add seed</button>
      </div>
      <div v-else>
        <input
          class="width-96"
          id="password1"
          v-model="password1"
          type="password"
          placeholder="Set password"
        />
        <input
          class="width-96"
          id="password2"
          v-model="password2"
          type="password"
          placeholder="Confirm password"
        />
        <button @click="createNewWallet" class="link">create wallet</button>
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

  mixins: [Storage, ViewHelper],

  created() {
    if (this.$route.query.privateKeyExist) {
      this.title = "Add seed to the wallet";
    } else {
      this.title = "New wallet";
    }
    this.mnemonic = HDKoinos.randomMnemonic();
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
        const password = this.$store.state.password;
        const encryptedMnemonic = await this._getMnemonic();
        const encryptedAccounts = (await this._getAccounts()) || [];
        if (encryptedMnemonic)
          throw new Error("Internal error: the seed already exist");

        const hdKoinos = new HDKoinos(this.mnemonic);
        const account = hdKoinos.deriveKeyAccount(0, "Account seed 0");
        await this._setMnemonic(await this.encrypt(this.mnemonic, password));
        encryptedAccounts.push({
          ...account.public,
          signers: [],
        });
        await this._setAccounts(encryptedAccounts);

        this.$store.state.mnemonic = this.mnemonic;
        this.$store.state.accounts.push({
          ...account.public,
          ...account.private,
          signers: [],
        });
        this.$store.state.password = this.password;

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
        const hdKoinos = new HDKoinos(this.mnemonic);
        const account = hdKoinos.deriveKeyAccount(0, "Account 0");
        await this._setMnemonic(
          await this.encrypt(this.mnemonic, this.password1)
        );
        await this._setAccounts([
          {
            ...account.public,
            signers: [],
          },
        ]);

        this.$store.state.mnemonic = this.mnemonic;
        this.$store.state.accounts = [
          {
            ...account.public,
            ...account.private,
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
.container {
  color: var(--kondor-light);
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
