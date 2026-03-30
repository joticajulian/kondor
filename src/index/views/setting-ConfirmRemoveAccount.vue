<template>
  <div class="container">
    <div class="screen-heading">
      <PageTitle
        title="Remove Account"
        subtitle="Please confirm account removal"
      />
    </div>
    <div class="bottom-section">
      <p class="message">
        Are you sure you want to remove this account?
      </p>
      <p class="account-name">
        {{ accountName }}
      </p>
      <p class="account-address">
        {{ accountAddress }}
      </p>
      <div class="button-group">
        <button
          class="custom-button danger"
          @click="confirmRemove"
        >
          Remove
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
      accountAddress: "",
      accountName: "",
      accountIndex: -1,
    };
  },
  mounted() {
    const { address } = this.$route.query;
    if (!address) throw new Error("Account address is required");
    this.accountAddress = address;
    this.accountIndex = this.$store.state.accounts.findIndex(
      (acc) => acc.address === this.accountAddress
    );
    if (this.accountIndex < 0) throw new Error("Account not found");
    const account = this.$store.state.accounts[this.accountIndex];
    const removalInfo = this._getAccountRemovalInfo(
      this.accountIndex,
      this.$store.state.accounts
    );
    if (!removalInfo.canRemove) throw new Error(removalInfo.reason);
    this.accountName = account.name;
  },
  methods: {
    async confirmRemove() {
      try {
        await this._removeAccount(this.accountIndex);
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
.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1em;
}
.message {
  margin: 0;
  color: var(--primary-light);
  font-size: 1em;
}
.account-name {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
}
.account-address {
  margin: 0;
  font-size: 0.85em;
  color: var(--primary-gray);
  text-align: center;
  word-break: break-all;
}
.button-group {
  display: flex;
  width: 100%;
  gap: 1em;
  flex-direction: row-reverse;
}
.danger {
  background: #8f2323;
}
</style>
