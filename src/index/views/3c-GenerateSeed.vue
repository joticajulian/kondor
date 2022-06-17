<template>
  <div class="middle">
    <div class="container">
      <h1>{{ title }}</h1>
      <img src="" alt="" />
      <div>
        New generated seed. Please write it down and save it in safe place
      </div>
      <textarea rows="3" id="seed" v-model="mnemonic" disabled />
      <label>
        <div class="item-checkbox">
          <input type="checkbox" v-model="seedConsent1" class="checkbox" />
          <span class="label-checkbox"
            >I have taken a copy of these 12 words</span
          >
        </div>
      </label>
      <label>
        <div class="item-checkbox">
          <input type="checkbox" v-model="seedConsent2" class="checkbox" />
          <span class="label-checkbox"
            >I understand that I must not share this seed with anyone or else I
            may lose my assets</span
          >
        </div>
      </label>
      <div v-if="$route.query.privateKeyExist">
        <span>Existing password</span>
        <Unlock
          labelButton="Add seed"
          @onUnlock="addSeed($event)"
          @onError="alertDanger($event)"
        />
      </div>
      <div v-else>
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

// components
import Unlock from "@/shared/components/Unlock.vue";

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

  components: { Unlock },

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

    async addSeed(password) {
      try {
        this.checkConsents();
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
