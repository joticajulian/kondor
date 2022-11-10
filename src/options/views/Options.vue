<template>
  <div class="options-container">
    <div class="inside-container">
      <header>
        <div class="logo">
          <img src="../../../public/images/kondor-icon.png" alt="kondor icon" />
          <h2>Kondor Settings</h2>
        </div>
      </header>
      <div class="top content">
        <div>
          <h2>Chain</h2>
          <p>Here you can set the RPC and Chain ID information.</p>
        </div>
        <div class="wide">
          <div class="input-group">
            <label
              >Set RPC Nodes separated by commas
              <input v-model="rpcNodes" type="text"
            /></label>
            <button @click="setRpcNodes">Set RPC Nodes</button>
          </div>
          <div class="input-group">
            <label>Set Chain Id <input v-model="chainId" type="text" /></label>
            <button @click="setChainId">Set Chain Id</button>
          </div>
        </div>
      </div>

      <div class="bottom content">
        <div>
          <h2>Wallet</h2>
          <p>
            Here you can view your wallet's seed and private keys, and delete
            your wallet.
          </p>
        </div>
        <div>View seed and private keys</div>
        <Unlock
          labelButton="View seed and private keys"
          @onUnlock="viewSecrets"
          @onError="alertDanger($event)"
        />
        <div>{{ secrets }}</div>
        <div>
          Delete wallet: Remove all private keys and accounts from this wallet
        </div>
        <button @click="deleteWallet" class="warning">Delete wallet</button>
      </div>
    </div>
  </div>
</template>

<script>
// mixins
import ViewHelper from "@/shared/mixins/ViewHelper"
import Storage from "@/shared/mixins/Storage"

// components
import Unlock from "@/shared/components/Unlock.vue"

export default {
  data() {
    return {
      rpcNodes: "",
      chainId: "",
      secrets: "",
    }
  },

  mixins: [Storage, ViewHelper],

  components: { Unlock },

  mounted() {
    (async () => {
      this.rpcNodes = (await this._getRpcNodes()).join(",")
      this.chainId = await this._getChainId()
    })()
  },
  methods: {
    async setRpcNodes() {
      try {
        await this._setRpcNodes(this.rpcNodes.split(","))
        this.alertSuccess("RPC Node set")
      } catch (error) {
        this.alertDanger(error.message)
        throw error
      }
    },

    async setChainId() {
      try {
        await this._setChainId(this.chainId)
        this.alertSuccess("Chain Id set")
      } catch (error) {
        this.alertDanger(error.message)
        throw error
      }
    },

    async deleteWallet() {
      try {
        await this._setMnemonic(null)
        await this._setAccounts([])
        // await this._setRpcNodes(null);
        // await this._setChainId(null);
        this.alertSuccess("Wallet deleted")
      } catch (error) {
        this.alertDanger(error.message)
        throw error
      }
    },

    async viewSecrets() {
      this.secrets = JSON.stringify({
        mnemonic: this.$store.state.mnemonic,
        accounts: this.$store.state.accounts,
      })
      this.alertSuccess(
        "Secrets are visible, be careful not to expose them to third parties"
      )
    },
  },
}
</script>
<style scoped>
button {
  margin-bottom: 4em;
  border-bottom: 0.5px dashed;
}
#app {
  width: 100% !important;
}
.options-container {
  width: 100vw;
  padding-top: 4em;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.inside-container {
  width: 60%;
  margin: 0 auto;
  padding: 2em;
}
.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}
.warning {
  background-color: red;
}
.input-group {
  display: flex;
  align-content: center;
  justify-content: flex-start;
  gap: 3em;
}
.content {
  display: flex;
  flex-direction: column;
}
.content .wide {
  width: 100%;
  display: flex;
  flex-direction: row;
}
.input-group label {
  width: 100vw;
  padding: 1em 0;
}
.input-group input {
  margin-top: 1em;
}
</style>
