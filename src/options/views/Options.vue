<template>
  <div class="options-container">
    <div class="inside-container">
      <header>
        <div class="logo">
          <h1>Kondor Settings</h1>
        </div>
      </header>

      <div class="page-intro">
        <h2>Settings</h2>
        <p class="description">
          Manage network, wallet, and transaction authorization preferences.
        </p>
      </div>

      <div
        class="tabs"
        role="tablist"
        aria-label="Settings sections"
      >
        <button
          class="tab-pill"
          :class="{ active: activeTab === 'networks' }"
          role="tab"
          type="button"
          :aria-selected="activeTab === 'networks'"
          @click="activeTab = 'networks'"
        >
          <span class="tab-pill-title">Networks</span>
          <span class="tab-pill-subtitle">Network configuration</span>
        </button>
        <button
          class="tab-pill"
          :class="{ active: activeTab === 'wallet' }"
          role="tab"
          type="button"
          :aria-selected="activeTab === 'wallet'"
          @click="activeTab = 'wallet'"
        >
          <span class="tab-pill-title">Wallet</span>
          <span class="tab-pill-subtitle">Seed phrase and private keys</span>
        </button>
        <button
          class="tab-pill"
          :class="{ active: activeTab === 'authorizations' }"
          role="tab"
          type="button"
          :aria-selected="activeTab === 'authorizations'"
          @click="activeTab = 'authorizations'"
        >
          <span class="tab-pill-title">Authorizations</span>
          <span class="tab-pill-subtitle">Auto-sign websites and functions</span>
        </button>
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
          <div class="section-actions">
            <button
              class="custom-button primary action-button"
              @click="updateNetworks()"
            >
              Save network changes
            </button>
          </div>
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
        <div
          v-else-if="activeTab === 'authorizations'"
          key="authorizations"
          class="settings-container"
        >
          <div class="top content">
            <h2>Auto-sign authorizations</h2>
            <p class="description">
              Requests from authorized websites are signed directly when every
              operation in the transaction matches one of these
              contract/entry-point pairs.
            </p>
            <div
              v-for="(authorization, i) in autoSignAuthorizations"
              :key="`authorization-${i}`"
              class="authorization-card"
            >
              <div class="input-group">
                <div class="description">
                  Website origin
                </div>
                <input
                  v-model="authorization.origin"
                  type="text"
                  placeholder="https://example.com"
                >
              </div>
              <div
                v-for="(func, j) in authorization.functions"
                :key="`authorization-function-${i}-${j}`"
                class="authorization-function-row"
              >
                <input
                  v-model="func.contractId"
                  type="text"
                  placeholder="Contract ID"
                >
                <input
                  v-model="func.entryPoint"
                  type="text"
                  placeholder="Entry point"
                >
                <button
                  class="small-danger-button"
                  @click="removeAuthorizationFunction(i, j)"
                >
                  Remove
                </button>
              </div>
              <div class="authorization-actions">
                <button
                  class="custom-button"
                  @click="addAuthorizationFunction(i)"
                >
                  Add function
                </button>
                <button
                  class="small-danger-button"
                  @click="removeAuthorization(i)"
                >
                  Remove website
                </button>
              </div>
            </div>
            <div class="section-actions left">
              <button
                class="custom-button secondary action-button auto-width"
                @click="addAuthorization()"
              >
                Add website
              </button>
            </div>
          </div>
          <div class="section-actions">
            <button
              class="custom-button primary action-button"
              @click="updateAutoSignAuthorizations()"
            >
              Save authorizations
            </button>
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
      autoSignAuthorizations: [],
    };
  },

  mounted() {
    this.loadNetworks();
    this.loadAutoSignAuthorizations();
  },

  methods: {
    createNewAuthorization() {
      return {
        origin: "",
        functions: [{ contractId: "", entryPoint: "" }],
      };
    },

    normalizeOrigin(origin) {
      const value = (origin || "").trim();
      if (!value) return "";
      try {
        return new URL(value).origin;
      } catch {
        return value;
      }
    },

    sanitizeAuthorizations(authorizations) {
      return (authorizations || [])
        .map((authorization) => {
          const origin = this.normalizeOrigin(authorization.origin);
          const functions = (authorization.functions || [])
            .map((func) => ({
              contractId: (func.contractId || "").trim(),
              entryPoint: String(func.entryPoint || "").trim(),
            }))
            .filter((func) => func.contractId && func.entryPoint);
          return { origin, functions };
        })
        .filter((authorization) => authorization.origin && authorization.functions.length);
    },

    async loadNetworks() {
      this.networks = await this._getNetworks();
      this.networks.forEach((n) => {
        n.rpcNodesText = n.rpcNodes.join(",");
      });
    },

    async loadAutoSignAuthorizations() {
      const authorizations = await this._getAutoSignAuthorizations();
      this.autoSignAuthorizations = this.sanitizeAuthorizations(authorizations);
      if (this.autoSignAuthorizations.length === 0) {
        this.autoSignAuthorizations = [this.createNewAuthorization()];
      }
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

    addAuthorization() {
      this.autoSignAuthorizations.push(this.createNewAuthorization());
    },

    removeAuthorization(index) {
      this.autoSignAuthorizations.splice(index, 1);
      if (this.autoSignAuthorizations.length === 0) {
        this.autoSignAuthorizations.push(this.createNewAuthorization());
      }
    },

    addAuthorizationFunction(index) {
      this.autoSignAuthorizations[index].functions.push({
        contractId: "",
        entryPoint: "",
      });
    },

    removeAuthorizationFunction(authIndex, functionIndex) {
      this.autoSignAuthorizations[authIndex].functions.splice(functionIndex, 1);
      if (this.autoSignAuthorizations[authIndex].functions.length === 0) {
        this.autoSignAuthorizations[authIndex].functions.push({
          contractId: "",
          entryPoint: "",
        });
      }
    },

    async updateAutoSignAuthorizations() {
      const sanitized = this.sanitizeAuthorizations(this.autoSignAuthorizations);
      await this._setAutoSignAuthorizations(sanitized);
      this.autoSignAuthorizations =
        sanitized.length > 0 ? sanitized : [this.createNewAuthorization()];
      this.alertSuccess("Authorizations updated");
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

.page-intro {
  margin-bottom: 1.2rem;
}

.page-intro h2 {
  margin: 0;
}

.tabs {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-pill {
  all: unset;
  border: 1px solid var(--primary-dark-light);
  background: #181818;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  min-width: 12rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    transform 0.2s ease;
}

.tab-pill:hover {
  border-color: var(--kondor-purple);
  transform: translateY(-1px);
}

.tab-pill.active {
  background: var(--kondor-purple30);
  border-color: var(--kondor-purple);
}

.tab-pill-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-light);
}

.tab-pill-subtitle {
  font-size: 0.8rem;
  color: var(--primary-gray);
}
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  border: 1px solid var(--primary-dark-light);
  border-radius: 0.9rem;
  padding: 1.2rem;
  background: #171717;
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

.authorization-card {
  border: 1px solid #3a3a3a;
  border-radius: 0.7em;
  padding: 1em;
  margin-bottom: 0.8em;
  background: #131313;
}

.authorization-function-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.7em;
  margin-bottom: 0.7em;
}

.authorization-actions {
  display: flex;
  gap: 0.7em;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.small-danger-button {
  border: 1px solid var(--kondor-red);
  background: transparent;
  color: var(--kondor-red);
  border-radius: 0.5em;
  padding: 0.4em 0.8em;
  cursor: pointer;
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.section-actions.left {
  justify-content: flex-start;
}

.action-button {
  width: auto;
  min-width: 12rem;
  margin: 0;
  height: auto;
}

.auto-width {
  min-width: auto;
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
    padding: 1.5rem;
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

  .tab-pill {
    width: 100%;
    min-width: auto;
  }

  .authorization-function-row {
    grid-template-columns: 1fr;
  }

  .section-actions,
  .section-actions.left {
    justify-content: stretch;
  }

  .action-button,
  .auto-width {
    width: 100%;
    min-width: auto;
  }
}
</style>
