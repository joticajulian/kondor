<template>
  <div class="middle">
    <div class="container">
      <h1>Import Private Key</h1>
      <img
        src=""
        alt=""
      >
      <textarea
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
      >
      <input
        id="password2"
        v-model="password2"
        type="password"
        placeholder="Confirm password"
      >
      <button
        class=""
        @click="importKey"
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
      privateKey: "",
      password1: "",
      password2: "",
    };
  },
  methods: {
    async importKey() {
      try {
        if (this.password1 !== this.password2)
          throw new Error("password mismatch");

        if (!this.privateKey) throw new Error("private key not defined");

        await this._deleteWallet();
        await this._savePasswordInMemory(0, this.password1);
        await this._addAccount({
          name: "Account 0",
          privateKey: this.privateKey,
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
h1 {
  margin: 1em 0;
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
textarea {
  width: 85% !important;
  height: 100px;
  background: none !important;
  color: var(--primary-gray);
}
</style>
