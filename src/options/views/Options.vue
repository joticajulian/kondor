<template>
  <div class="options-container">
    <div class="inside-container">
      <header>
        <div class="logo">
          <h1>Kondor Settings</h1>
        </div>
      </header>

      <div class="tabs">
        <span
          class="tab"
          :class="{ active: activeTab === 'networks' }"
          @click="activeTab = 'networks'"
        >
          <div class="tab-detail">
            <span class="lg-text">Networks</span>
            <span class="sm-text">Network configuration</span>
          </div>
        </span>
        <span
          class="tab"
          :class="{ active: activeTab === 'wallet' }"
          @click="activeTab = 'wallet'"
        >
          <div class="tab-detail">
            <span class="lg-text">Wallet</span>
            <span class="sm-text">Seed phrase and private keys</span>
          </div>
        </span>
      </div>

      <transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="activeTab === 'networks'"
          key="networks"
          class="settings-container"
        >
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
          <button
            class="custom-button"
            @click="updateNetworks()"
          >
            Update Networks
          </button>
        </div>

        <div
          v-else-if="activeTab === 'wallet'"
          key="wallet"
          class="bottom content"
        >
          <div>
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
            <div
              v-if="!secretsVisible"
              class="left"
            >
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
            <div
              v-if="secretsVisible"
              class="right"
            >
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
                :key="account.address"
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
                    :key="signer.address"
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
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Unlock from "@/shared/components/Unlock.vue";

export default {
  components: { Unlock },
  mixins: [Storage, ViewHelper],
  data() {
    return {
      activeTab: "networks",
      rpcNodes: "",
      chainId: "",
      mnemonic: "",
      accounts: [],
      networks: [],
      secretsVisible: false,
    };
  },

  mounted() {
    this.loadNetworks();
  },

  methods: {
    async loadNetworks() {
      this.networks = await this._getNetworks();
      this.networks.forEach((n) => {
        n.rpcNodesText = n.rpcNodes.join(",");
      });
    },

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

    async viewSecrets() {
      this.mnemonic = this.$store.state.mnemonic0;
      this.accounts = this.$store.state.accounts;
      this.secretsVisible = true;

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
  color: var(--primary-gray);
}

/* tabs */
.tabs {
  display: flex;
  gap: 1em;
  margin-bottom: 2em;
  margin-bottom: 2em;
  justify-content: flex-start;
}
.tab {
  display: flex;
  flex-direction: column;
  padding: 1em;
  cursor: pointer;
  border-radius: 0.5em;
  transition: background-color 0.3s;
}
.tab-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.lg-text {
  font-size: 1.5em;
  font-weight: 600;
}
.sm-text {
  font-size: 1em;
}
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2em;
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
  width: 50%;
  margin: 0 auto;
  padding: 4em;
  background-color: var(--primary-dark) 222;
}

.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.warning {
  color: rgb(207, 27, 27);
  background: none;
  font-weight: bold;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
  align-items: start;
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
  width: 100%;
  height: 6em;
}

.group {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

.heading {
  margin-top: 2em;
}

.two-column {
  display: flex;
  flex-direction: column;
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

.network-column {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.tabs button {
  padding: 0.5em 1em;
  font-size: 1em;
  background-color: #333333;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tabs button.active {
  background-color: #444444;
}

.tabs button:hover {
  background-color: #555555;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
