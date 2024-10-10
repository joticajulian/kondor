<template>
  <div class="container">
    <div class="screen-heading">
      <PageTitle
        title="Create Account"
        subtitle="Add an account to your main account"
      />
    </div>
    <div class="bottom-section">
      <div class="input-group">
        <input
          v-model="name"
          class="input"
          type="text"
          placeholder="Name"
          @keyup.enter="accept"
        >
      </div>
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
  </div>
</template>

<script>
import router from "@/index/router";
import PageTitle from "@/shared/components/PageTitle";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  components: { PageTitle },
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
  margin: 2em 4em;
  display: flex;
  align-items: center;
  height: 100%;
}
.button-group {
  display: flex;
  width: 100%;
  gap: 1em;
  flex-direction: row-reverse;
}
input {
  width: 88% !important;
  margin: 0 !important;
}
.input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.input-group button {
  position: relative;
}
.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 2em;
}
</style>
