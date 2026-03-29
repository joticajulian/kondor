<template>
  <div class="container">
    <div class="screen-heading">
      <PageTitle
        title="Update Account"
        subtitle="Rename or remove the selected account"
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
      <p
        v-if="!canRemove"
        class="remove-hint"
      >
        {{ removeDisabledReason }}
      </p>
      <div class="button-group">
        <button
          class="custom-button danger"
          :disabled="!canRemove"
          @click="removeAccount"
        >
          Remove
        </button>
        <button
          class="custom-button primary"
          @click="accept"
        >
          Save
        </button>
        <button
          class="custom-button secondary"
          @click="cancel"
        >
          Cancel
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
      encryptedAccounts: [],
      accId: undefined,
      canRemove: false,
      removeDisabledReason: "",
    };
  },

  async mounted() {
    const { address } = this.$route.query;
    this.encryptedAccounts = (await this._getAccounts()) || [];
    this.accId = this.encryptedAccounts.findIndex(
      (acc) => acc.address === address
    );
    if (this.accId < 0) throw new Error("Account not found");
    this.name = this.encryptedAccounts[this.accId].name;
    const removalInfo = this._getAccountRemovalInfo(this.accId);
    this.canRemove = removalInfo.canRemove;
    this.removeDisabledReason = removalInfo.reason;
  },

  methods: {
    async accept() {
      try {
        if (!this.name) throw new Error("No name defined");
        this.$store.state.accounts[this.accId].name = this.name;
        this.encryptedAccounts[this.accId].name = this.name;
        await this._setAccounts(this.encryptedAccounts);
        this.alertSuccess("Account updated");
        router.back();
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
    async removeAccount() {
      try {
        const account = this.$store.state.accounts[this.accId];
        if (!account) throw new Error("Account not found");

        const approved = window.confirm(
          `Remove "${account.name}" (${account.address})?`
        );
        if (!approved) return;

        await this._removeAccount(this.accId);
        this.alertSuccess("Account removed");

        if (this.$store.state.accounts.length === 0) {
          router.push("/");
          return;
        }
        router.push("/dashboard");
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
.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1em;
}
.remove-hint {
  color: var(--primary-gray);
  font-size: 0.9em;
  margin: 0;
}
.danger {
  background: #8f2323;
}
</style>
