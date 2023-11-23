<template>
  <div class="container">
    <h1>Update account</h1>
    <input
      v-model="name"
      type="text"
      placeholder="Name"
      @keyup.enter="accept"
    >
    <button
      class=""
      @click="accept"
    >
      accept
    </button>
    <button
      class=""
      @click="cancel"
    >
      cancel
    </button>
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
      encryptedAccounts: [],
      accId: undefined,
    };
  },

  async mounted() {
    const { address } = this.$route.query;
    this.encryptedAccounts = (await this._getAccounts()) || [];
    this.accId = this.encryptedAccounts.findIndex(
      (acc) => acc.address === address
    );
    this.name = this.encryptedAccounts[this.accId].name;
  },

  methods: {
    async accept() {
      try {
        this.$store.state.accounts[this.accId].name = this.name;
        this.encryptedAccounts[this.accId].name = this.name;
        await this._setAccounts(this.encryptedAccounts);
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
  min-height: 20em;
  margin: 4em 2em;
}
</style>
