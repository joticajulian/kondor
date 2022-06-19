<template>
  <div class="center-column">
    <div class="accounts-information">
      <h2>Get accounts</h2>
      <!-- <div>{{ requester.origin }}</div> -->
      <div>{{ requester.origin }} wants to know your address</div>
      <br />
      <div class="accounts-list">
        <label v-for="(account, index) in accounts" :key="index">
          <div class="item-checkbox">
            <input type="checkbox" v-model="inputs[index]" class="checkbox" />
            <span class="label-checkbox">{{ account.name }}</span>
          </div>
          <div class="account-address">{{ account.address }}</div>
        </label>
      </div>
    </div>
    <div>
      <div class="buttons">
        <button class="cancel-button" @click="cancel">Cancel</button>
        <button class="accept-button" @click="accept">Accept</button>
      </div>
    </div>
  </div>
</template>

<script>
// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Message from "@/shared/mixins/Message";

export default {
  name: "Get accounts",
  data: function () {
    return {
      requester: "",
      id: -1,
      inputs: [],
      accounts: [],
    };
  },

  mixins: [Storage, ViewHelper, Message],

  mounted() {
    const requests = this.$store.state.requests.filter(
      (r) => r.command === "getAccounts"
    );
    /**
     * TODO: for several requests create a list of requesters
     * and ask to the user to select one to see the details
     */
    const [request] = requests;
    this.requester = request.sender;
    this.id = request.id;

    this.loadAccounts();
  },

  methods: {
    async loadAccounts() {
      this.accounts = await this._getAccounts();
    },

    async accept() {
      const accounts = this.accounts
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
        })
        .filter((account, index) => {
          return this.inputs[index];
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
label {
  padding: 1em 0;
}
.center-column {
  width: 75%;
  color: white;
  font-weight: 400;
}
.container {
  width: 90%;
  padding: 2em 0;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  text-transform: none;
  align-items: flex-start;
}
.buttons {
  display: flex;
  justify-content: space-evenly;
  width: 90%;
}
.accounts-information {
  margin: 2em 0;
}
.account-address {
  color: #929191;
}
.cancel-button {
  border: none;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.accept-button {
  background: var(--kondor-light);
  color: var(--secondary-color);
}
</style>
