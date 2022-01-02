<template>
  <div>
    <div>Set RPC Node</div>
    <input v-model="rpcNode" type="text" />
    <button @click="set">Set RPC Node</button>
  </div>
</template>

<script>
import AlertHelper from "@/shared/mixins/AlertHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  mixins: [Storage, AlertHelper],
  methods: {
    async set() {
      try {
        await this.setRpcNode(this.rpcNode);
        this.alertSuccess("RPC Node set");
      } catch (error) {
        this.alertDanger(error.message);
      }
    },
  },
};
</script>
