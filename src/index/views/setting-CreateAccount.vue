<template>
  <div class="container">
    <h1>New account</h1>
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
    };
  },

  methods: {
    async accept() {
      try {
        await this._addAccount(this.name);
        this.$store.state.currentIndexAccount =
          this.$store.state.accounts.length - 1;
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
