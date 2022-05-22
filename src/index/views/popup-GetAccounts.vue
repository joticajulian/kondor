<template>
  <div class="center-column">
    <div class="">
      <div>Get accounts</div>
      <div>{{ requester.origin }}</div>
      <div>{{ requester.origin }} wants to know your address</div>
      <div v-if="unlocked">
        <label v-for="(account, index) in $store.state.accounts" :key="index">
          <span>{{ account.name }} - {{ account.address }}</span>
          <input type="checkbox" v-model="inputs[index]" />
        </label>
      </div>
      <div v-else>
        <Unlock
          @onUnlock="unlocked = true"
          @onError="alertDanger($event.message)"
        />
      </div>
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

// components
import Unlock from "@/index/components/Unlock.vue";

export default {
  name: "Get accounts",
  data: function () {
    return {
      requester: "",
      id: -1,
      inputs: [],
      unlocked: !!this.$store.state.accounts.length > 0,
    };
  },

  mixins: [Storage, ViewHelper, Message],

  components: { Unlock },

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
      const accounts = this.$store.state.accounts
        .map((account) => {
          return {
            name: account.name,
            address: account.address,
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
