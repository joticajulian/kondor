<template>
  <div class="wrapper">
    <div class="content">
      <div>
        <div class="p-title">
          Connect with Kondor
        </div>
        <div class="p-subtitle">
          Select the account to use on this site
        </div>
      </div>

      <div class="accounts-list">
        <div
          v-for="(account, index) in accounts"
          :key="index"
          class="account-item"
          :class="{ selected: inputs[index] === true }"
          @click="selectAccount(index)"
        >
          <span class="account-name">{{ account.name }}</span>
          <span class="account-address">{{
            formatAddress(account.address)
          }}</span>
        </div>
      </div>

      <div>
        <p class="warning">
          Only connect with sites you trust.
        </p>

        <div class="buttons">
          <button
            class="custom-button secondary"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            class="custom-button primary"
            :disabled="!somethingSelected"
            @click="accept"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Message from "@/popup/mixins/Message";
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  name: "GetAccounts",
  mixins: [Storage, ViewHelper, Message],
  data() {
    return {
      requester: "",
      id: -1,
      somethingSelected: false,
      inputs: [],
      accounts: [],
    };
  },
  mounted() {
    const requests = this.$store.state.requests.filter(
      (r) => r.command === "getAccounts"
    );
    const [request] = requests;
    this.requester = request.sender;
    this.id = request.id;
    this.loadAccounts();
  },
  methods: {
    async loadAccounts() {
      this.accounts = await this._getAccounts();
      // Automatically select the first account if there is only 1 account
      if (this.accounts.length === 1) this.selectAccount(0);
    },
    selectAccount(index) {
      this.somethingSelected = false;
      this.inputs = this.accounts.map((account, i) => {
        const val = i === index ? !this.inputs[i] : this.inputs[i];
        if (val === true) this.somethingSelected = true;
        return val;
      });
    },
    formatAddress(address) {
      return `${address.slice(0, 10)}...${address.slice(-5)}`;
    },
    async accept() {
      if (!this.somethingSelected) return;
      const accounts = this.accounts
        .filter((account, index) => {
          return this.inputs[index];
        })
        .map((account) => {
          return {
            name: account.name,
            address: account.address,
            signers: account.signers
              ? account.signers.map((signer) => {
                return {
                  name: signer.name,
                  address: signer.address,
                };
              })
              : [],
          };
        });
      const message = {
        id: this.id,
        result: accounts,
      };
      this.sendResponse("extension", message, this.requester);
      window.close();
    },
    cancel() {
      const message = {
        id: this.id,
        error: "getAccounts cancelled",
      };
      this.sendResponse("extension", message, this.requester);
      window.close();
    },
  },
};
</script>

<style scoped>
.wrapper {
  font-family: Poppins, sans-serif;
  background-color: #1a1a1a;
  color: var(--primary-light);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.content {
  width: 100%;
  max-width: 400px;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.p-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

.p-subtitle {
  font-size: 14px;
  color: var(--primary-gray);
  margin-bottom: 20px;
  text-align: center;
}

.accounts-list {
  margin-bottom: 20px;
}

.account-item {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.account-item:hover,
.account-item.selected {
  background-color: #3a3a3a;
}

.account-item.selected {
  background-color: #e5b009;
}

.account-item.selected .account-name {
  color: black;
}

.account-name {
  display: block;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.account-address {
  display: block;
  font-size: 14px;
  color: var(--primary-gray);
}

.warning {
  font-size: 14px;
  color: #e5b009;
  text-align: center;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 1em;
  flex-direction: row;
}

.custom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
