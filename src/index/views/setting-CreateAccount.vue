<template>
  <div class="container">
    <h1>New account</h1>
    <input
      v-model="name"
      class="input"
      type="text"
      placeholder="Name"
      @keyup.enter="accept"
    >
    <div class="button-group">
      <button
        class="custom-button primary"
        @click="accept"
      >
        Create
      </button>
      <button
        class="custom-button secondary"
        @click="cancel"
      >
        cancel
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
    };
  },

  methods: {
    async accept() {
      try {
        await this._addAccount({
          name: this.name,
          passwordId: 0,
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
.container {
  margin: 4em;
}
.button-group {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-top: 1em;
  gap: 1em;
  width: 100%;
}
input {
  width: 88% !important;
  margin: 0 !important
}
</style>
