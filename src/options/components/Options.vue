<template>
  <div class="container">
    <div class="content-50">
      <div>Set RPC Nodes separated by commas</div>
      <input v-model="rpcNodes" type="text" />
      <button @click="setRpcNodes">Set RPC Nodes</button>
      <div>Set Chain Id</div>
      <input v-model="chainId" type="text" />
      <button @click="setChainId">Set Chain Id</button>
    </div>
  </div>
</template>

<script>
import AlertHelper from "@/shared/mixins/AlertHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  data() {
    return {
      rpcNodes: "",
      chainId: "",
    };
  },
  mixins: [Storage, AlertHelper],
  mounted() {
    (async () => {
      this.rpcNodes = (await this._getRpcNodes()).join(",");
      this.chainId = await this._getChainId();
    })();
  },
  methods: {
    async setRpcNodes() {
      try {
        await this._setRpcNodes(this.rpcNodes.split(","));
        this.alertSuccess("RPC Node set");
      } catch (error) {
        this.alertDanger(error.message);
      }
    },
    async setChainId() {
      try {
        await this._setChainId(this.chainId);
        this.alertSuccess("Chain Id set");
      } catch (error) {
        this.alertDanger(error.message);
      }
    },
  },
};
</script>
<style scoped>

button {
  margin-bottom: 4em;
  border-bottom: 0.5px dashed;
}
</style>
