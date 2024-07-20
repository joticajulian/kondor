<template>
  <div class="container">
    <h1>Import account</h1>
    <div>
      <label for="name">Account Nickname</label>
      <input
        id="name"
        v-model="name"
        type="text"
        placeholder="Name"
        @keyup.enter="accept"
      >
    </div>
    <div>
      <input
        id="watch-mode"
        v-model="watchMode"
        type="checkbox"
        name="watch-mode"
        value="watch-mode"
      >
      <label
        for="watch-mode"
      >Import in watch mode (no private key)</label>
    </div>
    <div v-if="watchMode">
      <label for="address">Address</label>
      <input
        id="address"
        v-model="address"
        type="text"
        placeholder="Address"
        @keyup.enter="accept"
      >
    </div>
    <div v-else>
      <label for="privateKey">Private Key</label>
      <input
        id="privateKey"
        v-model="privateKey"
        type="text"
        placeholder="Private Key"
        @keyup.enter="accept"
      >
    </div>
    <div class="actions">
      <button
        class="secondary"
        @click="cancel"
      >
        cancel
      </button>
      <button
        class="primary"
        @click="accept"
      >
        accept
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
      name: "",
      watchMode: false,
      address: "",
      privateKey: "",
    };
  },

  methods: {
    async accept() {
      try {
        await this._addAccount({
          name: this.name,
          privateKey: this.privateKey,
          passwordId: 0,
          watchMode: this.watchMode,
          address: this.address,
        });

        this.$store.state.currentIndexAccount =
          this.$store.state.accounts.length - 1;
        await this._setCurrentIndexAccount(
          this.$store.state.currentIndexAccount
        );
        router.back();
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    cancel() {
      router.back();
    },
  },
};
</script>
<style scoped>
input {
  display: block;
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

input[type="checkbox"] {
  all: revert;
}

label {
  font-size: .8em;
  color: #777;
}
.container {
  min-height: 20em;
  margin: 4em 2em;
  align-items: center;
  gap: 1em;
}
.container > * {
  width: 100%;
}
button.secondary {
  background-color: #ddd;
  border-color: #ddd;
  color: #000;
}
.actions {
  display: flex;
  flex-direction: row;
  gap: 1em;
  justify-content: stretch;
}

</style>
