<template>
  <div class="container">
    <div class="content-50">
      <div>Set RPC Nodes separated by commas</div>
      <input v-model="rpcNodes" type="text" />
      <button @click="setRpcNodes">Set RPC Nodes</button>
      <div>Set Chain Id</div>
      <input v-model="chainId" type="text" />
      <button @click="setChainId">Set Chain Id</button>
      <div>
        Delete wallet: Remove all private keys and accounts from this wallet
      </div>
      <button @click="deleteWallet">Delete wallet</button>
      <div>View seed and private keys</div>
      <Unlock
        labelButton="View seed and private keys"
        @onUnlock="viewSecrets"
        @onError="alertDanger($event)"
      />
      <div>{{ secrets }}</div>
    </div>
  </div>
</template>

<script>
// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

// components
import Unlock from "@/shared/components/Unlock.vue";

export default {
  data() {
    return {
      rpcNodes: "",
      chainId: "",
      secrets: "",
    };
  },

  mixins: [Storage, ViewHelper],

  components: { Unlock },

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
        throw error;
      }
    },

    async setChainId() {
      try {
        await this._setChainId(this.chainId);
        this.alertSuccess("Chain Id set");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async deleteWallet() {
      try {
        await this._setMnemonic(null);
        await this._setAccounts([]);
        // await this._setRpcNodes(null);
        // await this._setChainId(null);
        this.alertSuccess("Wallet deleted");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async viewSecrets() {
      this.secrets = JSON.stringify({
        mnemonic: this.$store.state.mnemonic,
        accounts: this.$store.state.accounts,
      });
      this.alertSuccess(
        "Secrets are visible, be careful not to expose them to third parties"
      );
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
