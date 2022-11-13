<template>
  <div class="options-container">
    <div class="inside-container">
      <header>
        <div class="logo">
          <!-- <img src="../../../public/images/kondor-icon.png" alt="kondor icon" /> -->
          <h1>Kondor Settings</h1><br>
        </div>
      </header>
      <div class="top content">
        <div class="">
          <h1>Chain</h1>
          <p>Here you can set the RPC and Chain ID information.</p>
        </div>
        <div class="wide">
          <div class="input-group">
            <div class="description">Set RPC Nodes</div>
            <div class="input-button">
              <input v-model="rpcNodes" type="text" />
              <button @click="setRpcNodes">Set RPC Nodes</button>
            </div>
          </div>
          <div class="input-group">
            <div class="description">Set Chain Id</div>
            <div class="input-button">
              <input v-model="chainId" type="text" />
              <button @click="setChainId">Set Chain Id</button>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom content">
        <div class="">
          <h1>Wallet</h1>
          <p>Here you can view your wallet's seed and private keys. <span class="warning">Note: this information is extremely sensitive! Keep it safe and make sure it doesn't fall into the wrong hands. It is your responsibility, there is no way to recover stolen funds.</span></p>
        </div>
        <div class="two-column">
          <div class="left">
            <p class="description">View seed and private keys</p>
            <Unlock
              labelButton="View seed and private keys"
              @onUnlock="viewSecrets"
              @onError="alertDanger($event)"
            />
          </div>
          <div class="right">
            <div class="key">
              Mnemonic:
            </div> 
            <div class="value">
              {{ mnemonic }}
            </div> <br />
            <div class="title">
              Accounts
            </div>
            <div v-for="account in accounts" :key="account" class="">
              <span class="key big">{{ account.name }}</span> <br>
              <span class="key">Key Path:</span> <span class="value">{{ account.keyPath }}</span> <br>
              <span class="key">Address:</span> <span class="value">{{ account.address }}</span> <br>
              <span class="key">Private Key: </span> <span class="value">{{ account.privateKey }}</span> <br>
              <div class="signers">
                <div v-for="signer in account.signers" :key="signer.name">
                  {{ signer.name }} <br>
                  {{ signer.keyPath }} <br>
                  {{ signer.address }} <br>
                  {{ signer.privateKey }} <br>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div>
          <div>
            Delete wallet: Remove all private keys and accounts from this wallet
          </div>
          <button @click="deleteWallet" class="warning">Delete wallet</button>
        </div> -->
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
      nmemonic: "",
      accounts: "",
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
      this.mnemonic = this.$store.state.mnemonic
      this.accounts = this.$store.state.accounts

      this.alertSuccess(
        "Secrets are visible, be careful not to expose them to third parties"
      )
    },
  },
}
</script>
<style scoped>
input {
  margin-bottom: 0;
}
button {
  margin: 0;
  width: auto;
}
h1 {
  margin: 0;
  font-size: 2em;
  font-weight: bold;
}
#app {
  width: 100% !important;
}
.container {
  margin: 0;
  display: block;
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
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
  width: 100vw;
  padding: 1em 0;
  margin-top: 1em;
  gap: 0.5em;
}
.content {
  display: flex;
  flex-direction: column;
}
.content .wide {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 2em;
  flex-wrap: wrap;
}
.input-button {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1em;
}
.description {
}
.heading {
  margin-top: 2em;
}
.two-column {
  display: flex;
  flex-direction: row;
  gap: 2em;
}
.right {
  padding: 3em;
}
.key {
  font-weight: bold;
}
.value {
  font-weight: normal;
}
.big {
  font-size: 1.5em;
}
.warning {
  color: rgb(207, 27, 27);
  background: none;
  font-weight: bold; 
}
</style>
