<template>
  <div class="center-column">
    <div class="">
      <div>Get accounts</div>
      <div>{{ requester.origin }}</div>
      <div>{{ requester.origin }} wants to know your address</div>
      <label v-for="(account, index) in accounts" :key="index">
        <span>{{ account.name }} - {{ account.address }}</span>
        <input type="checkbox" v-model="inputs[index]" />
      </label>
    </div>
    <div>
      <div class="buttons">
        <button class="link" @click="accept">Accept</button>
        <button class="link" @click="cancel">Cancel</button>
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
.container {
  width: 90%;
  padding: 2em 0;
  font-family: "Roboto", sans-serif;
  font-weight: 300;
  text-transform: none;
  align-items: flex-start;
}
.buttons {
  display: flex;
  justify-content: space-evenly;
  width: 90%;
}
</style>
