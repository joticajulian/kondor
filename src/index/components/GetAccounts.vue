<template>
  <div class="center-column">
    <div class="">
      <div>Get accounts</div>
      <div>{{ requester.origin }}</div>
      <div>{{ requester.origin }} wants to know your address</div>
      <div>TODO: checkbox with list of addresses / contract wallets</div>
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
import AlertHelper from "@/shared/mixins/AlertHelper";
import Storage from "@/shared/mixins/Storage";
import Message from "@/shared/mixins/Message";

export default {
  name: "Get accounts",
  data: function () {
    return {
      requester: "",
      id: -1,
    };
  },

  mixins: [Storage, AlertHelper, Message],

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
  },

  methods: {
    async accept() {
      let accounts = await this._getAccounts();
      accounts = accounts.map((a) => {
        // eslint-disable-next-line no-unused-vars
        const { encryptedPrivateKey, ...pubData } = a;
        return pubData;
      });
      const message = {
        id: this.id,
        result: accounts,
      };
      this.sendResponse("extension", message, this.requester);
    },
    cancel() {
      const message = {
        id: this.id,
        error: "getAccounts cancelled",
      };
      this.sendResponse("extension", message, this.requester);
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
