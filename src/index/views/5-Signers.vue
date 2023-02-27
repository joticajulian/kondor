<template>
  <div class="container">
    <div
      v-for="(signer, index) in signers"
      :key="index"
    >
      {{ signer.name }}
      {{ signer.address }}
    </div>
    <button @click="addSigner">
      Add signer
    </button>
  </div>
</template>

<script>
// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  mixins: [Storage, ViewHelper],
  data() {
    return {
      signers: [],
    };
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadSigners(this.$store.state.currentIndexAccount);
    },
  },

  mounted() {
    this.loadSigners(this.$store.state.currentIndexAccount);
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
        const name = "todo - set signer name";
        await this._addSigner({
          name,
          accIndex: this.$store.state.currentIndexAccount,
          passwordId: 0,
        });
        this.loadSigners(this.$store.state.currentIndexAccount);
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
