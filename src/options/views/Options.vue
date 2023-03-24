<template>
  <div class="options-container">
    <div class="inside-container">
      <header>
        <div class="logo">
          <!-- <img src="../../../public/images/kondor-icon.png" alt="kondor icon" /> -->
          <h1>Kondor Settings</h1>
          <br>
        </div>
      </header>
      <div class="">
        <h2>Networks</h2>
        <p>Networks configured in the wallet.</p>
      </div>
      <div class="top content two-column">
        <div
          v-for="network in networks"
          :key="network.name"
          class="network-column"
        >
          <div class="key big">
            {{ network.name }}
          </div>
          <div class="wide">
            <div class="input-group">
              <div class="description">
                RPC Nodes
              </div>
              <div class="input-button">
                <input
                  v-model="network.rpcNodesText"
                  type="text"
                >
              </div>
            </div>
            <div class="input-group">
              <div class="description">
                Set Chain Id
              </div>
              <div class="input-button">
                <input
                  v-model="network.chainId"
                  type="text"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <button @click="updateNetworks()">
        Update Networks
      </button>
      <hr>
      <div class="bottom content">
        <div class="">
          <h2>Wallet</h2>
          <p>
            Here you can view your wallet's seed and private keys.
            <span
              class="warning"
            >Note: this information is extremely sensitive! Keep it safe and
              make sure it doesn't fall into the wrong hands. It is your
              responsibility, there is no way to recover stolen funds.</span>
          </p>
        </div>
        <div class="two-column">
          <div class="left">
            <p class="description">
              View seed and private keys
            </p>
            <Unlock
              label-button="View seed and private keys"
              :autocomplete="false"
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
            </div>
            <br>
            <div class="title">
              Accounts
            </div>
            <div
              v-for="account in accounts"
              :key="account"
              class=""
            >
              <div class="key big">
                {{ account.name }}
              </div>
              <br>
              <div class="key">
                Key Path:
              </div>
              <div class="value">
                {{ account.keyPath }}
              </div>
              <br>
              <div class="key">
                Address:
              </div>
              <div class="value">
                {{ account.address }}
              </div>
              <br>
              <div class="key">
                Private Key:
              </div>
              <div class="value">
                {{ account.privateKey }}
              </div>
              <br>
              <div class="signers">
                <div
                  v-for="signer in account.signers"
                  :key="signer.name"
                >
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
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

// components
import Unlock from "@/shared/components/Unlock.vue";

export default {
  components: { Unlock },

  mixins: [Storage, ViewHelper],
  data() {
    return {
      rpcNodes: "",
      chainId: "",
      mnemonic: "",
      accounts: [],
      networks: [],
    };
  },

  mounted() {
    (async () => {
      this.networks = await this._getNetworks();
      this.networks.forEach((n) => {
        n.rpcNodesText = n.rpcNodes.join(",");
      });
      this.networks[0].name = "Koinos Mainnet";
      this.networks[0].tag = "mainnet";
      this.networks[0].koinContractId = "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL";

      this.networks[1].name = "Koinos Harbinger (testnet)";
      this.networks[1].tag = "harbinger";
      this.networks[1].koinContractId = "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ";
    })();
  },

  methods: {
    async updateNetworks() {
      await this._setNetworks(
        this.networks.map((n) => {
          const { rpcNodesText, ...otherVals } = n;
          const rpcNodes = rpcNodesText.split(",");
          return {
            ...otherVals,
            rpcNodes,
          };
        })
      );
      this.alertSuccess("Networks updated");
    },

    async deleteWallet() {
      try {
        await this._deleteWallet(null);
        this.alertSuccess("Wallet deleted");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async viewSecrets() {
      this.mnemonic = this.$store.state.mnemonic0;
      this.accounts = this.$store.state.accounts;

      this.alertSuccess(
        "Secrets are visible, be careful not to expose them to third parties"
      );
    },
  },
};
</script>
<style scoped>
input {
  margin-bottom: 0;
  max-width: 100%;
}

button {
  margin: 0;
  width: auto;
  margin-top: 2em;
}

h1 {
  margin: 0;
  font-size: 2em;
  font-weight: bold;
}

h2 {
  font-size: 1.5em;
  font-weight: bold;
}

p {
  width: 80%;
}

hr {
  margin: 2em 0;
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
  padding: 4em;
  background-color: #f5f5f5;
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
  width: 100%;
  gap: 0.5em;
}

.content {
  display: flex;
  flex-direction: column;
}

.content .wide {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2em;
  flex-wrap: wrap;
}

.input-button {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1em;
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
  margin-top: 30px;
}

.warning {
  color: rgb(207, 27, 27);
  background: none;
  font-weight: bold;
}

.network-column {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

@media (max-width: 768px) {
  .inside-container {
    width: 90%;
  }

  .input-group {
    width: 100%;
  }

  .two-column {
    flex-direction: column;
  }

  .right {
    padding: 0;
  }

  .content .wide {
    flex-direction: column;
  }
}
</style>
