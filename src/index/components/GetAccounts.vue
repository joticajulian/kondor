<template>
  <div>
    <div>Get accounts</div>
    <div>{{ requester.origin }}</div>
    <div>{{ requester.origin }} wants to know your address</div>
    <div>TODO: checkbox with list of addresses / contract wallets</div>
    <button @click="accept">Accept</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
import AlertHelper from "@/shared/mixins/AlertHelper";
import Storage from "@/shared/mixins/Storage";
import Message from "@/shared/mixins/Message";
import Messenger from "../../../lib/Messenger";

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
      let accounts = await this.getAccounts();
      accounts = accounts.map((a) => {
        // eslint-disable-next-line no-unused-vars
        const { encryptedPrivateKey, ...pubData } = a;
        return pubData;
      });
      const message = {
        id: this.id,
        result: accounts,
      };
      new Messenger().sendResponse("extension", message, this.requester);
    },
    cancel() {
      const message = {
        id: this.id,
        error: new Error("getAccounts cancelled"),
      };
      new Messenger().sendResponse("extension", message, this.requester);
    },
  },
};
</script>
