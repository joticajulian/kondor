<template>
  <div class="container">
    <PageTitle
      title="Configure tokens"
      subtitle="Add by nickname, address, or KoinDX list."
    />

    <div class="section">
      <h2>Add tokens</h2>
      <div class="add-card">
        <label>KoinDX list</label>
        <select
          v-model="selectedKoindxAddress"
          :disabled="isAdding || isLoadingKoindx"
          class="input-control"
        >
          <option
            disabled
            value=""
          >
            Select token from KoinDX
          </option>
          <option
            v-for="token in koindxTokens"
            :key="`${token.symbol}-${token.address}`"
            :value="token.address"
          >
            {{ token.name }} ({{ token.symbol }})
          </option>
        </select>
        <button
          class="custom-button primary"
          :disabled="isAdding || isLoadingKoindx || !selectedKoindxAddress"
          @click="addByKoindx"
        >
          <span
            v-if="isAdding && addMethod === 'koindx'"
            class="loader2"
          />
          <span v-else>Add from KoinDX</span>
        </button>
      </div>

      <div class="add-grid">
        <div class="add-card">
          <label>Nickname</label>
          <input
            v-model="nicknameInput"
            class="input-control"
            type="text"
            placeholder="e.g. koin"
            :disabled="isAdding"
            @keyup.enter="addByNickname"
          >
          <button
            class="custom-button primary"
            :disabled="isAdding || !nicknameInput.trim()"
            @click="addByNickname"
          >
            <span
              v-if="isAdding && addMethod === 'nickname'"
              class="loader2"
            />
            <span v-else>Add by nickname</span>
          </button>
        </div>

        <div class="add-card">
          <label>Contract address</label>
          <input
            v-model="addressInput"
            class="input-control"
            type="text"
            placeholder="Enter token contract address"
            :disabled="isAdding"
            @keyup.enter="addByAddress"
          >
          <button
            class="custom-button primary"
            :disabled="isAdding || !addressInput.trim()"
            @click="addByAddress"
          >
            <span
              v-if="isAdding && addMethod === 'address'"
              class="loader2"
            />
            <span v-else>Add by address</span>
          </button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Current tokens</h2>
      <p class="hint">
        Tokens listed here are active for {{ network ? network.tag : "current" }}.
      </p>
      <div
        v-if="networkTokens.length === 0"
        class="empty-state"
      >
        No tokens configured for this network.
      </div>
      <div
        v-for="token in networkTokens"
        :key="`${token.network}-${token.contractId}`"
        class="token-card"
      >
        <img
          :src="token.image"
          alt=""
          class="token-image"
        >
        <div class="token-info">
          <div class="token-header">
            <strong>{{ token.symbol || "Unknown" }}</strong>
            <span class="token-nickname">
              {{ token.nickname ? `@${token.nickname}` : "no nickname" }}
            </span>
          </div>
          <div class="token-detail">
            <span>Address:</span>
            <span class="token-value">{{ token.contractId }}</span>
          </div>
          <div class="token-detail">
            <span>Decimals:</span>
            <span class="token-value">{{ token.decimals }}</span>
          </div>
          <div class="token-detail">
            <span>Address permanence:</span>
            <span class="token-value">
              {{ token.permanentAddress ? "Permanent" : "Can change" }}
            </span>
          </div>
        </div>
        <button
          class="custom-button secondary danger remove-button"
          :disabled="isCoreToken(token)"
          :title="
            isCoreToken(token) ? 'Core tokens cannot be removed' : 'Remove token'
          "
          @click="removeToken(token.contractId)"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Contract, Provider, utils } from "koilib";
import axios from "axios";
import emptyToken from "@/shared/assets/empty-token.png";
import PageTitle from "@/shared/components/PageTitle";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

function fromUtf8ToHex(text) {
  return utils.toHexString(new TextEncoder().encode(text));
}

function fromHexToUtf8(hex) {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  return new TextDecoder().decode(utils.toUint8Array(cleanHex));
}

export default {
  components: { PageTitle },
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      network: null,
      provider: null,
      nicknames: null,
      tokens: [],
      koindxTokens: [],
      selectedKoindxAddress: "",
      nicknameInput: "",
      addressInput: "",
      isLoadingKoindx: false,
      isAdding: false,
      addMethod: "",
    };
  },

  computed: {
    networkTokens() {
      if (!this.network) return [];
      return this.tokens.filter((t) => t.network === this.network.tag);
    },
  },

  watch: {
    "$store.state.currentNetwork": async function () {
      await this.initialize();
    },
  },

  async mounted() {
    await this.initialize();
  },

  methods: {
    async initialize() {
      await this.loadNetwork();
      await this.loadTokens();
      await this.fetchKoindxTokens();
      this.resetAddInputs();
    },

    async loadNetwork() {
      try {
        this.$store.state.networks = await this._getNetworks();
        const currentTag = await this._getCurrentNetwork();
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        );
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork];
        this.provider = new Provider(this.network.rpcNodes);

        if (this.network.nicknamesContractId) {
          const nicknamesAbi = await this._getAbi(
            this.network.tag,
            this.network.nicknamesContractId
          );
          this.nicknames = new Contract({
            id: this.network.nicknamesContractId,
            abi: nicknamesAbi,
            provider: this.provider,
            serializer: await this.newSandboxSerializer(
              nicknamesAbi.koilib_types
            ),
          }).functions;
        }
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async loadTokens() {
      this.tokens = await this._getTokens();
    },

    async fetchKoindxTokens() {
      this.isLoadingKoindx = true;
      try {
        const response = await axios.get(
          `https://raw.githubusercontent.com/koindx/token-list/main/src/tokens/${this.network.tag}.json`
        );
        this.koindxTokens = response.data.tokens || [];
      } catch (error) {
        this.koindxTokens = [];
        this.alertInfo("KoinDX list unavailable right now.");
      } finally {
        this.isLoadingKoindx = false;
      }
    },

    async addByNickname() {
      const nickname = this.nicknameInput.replace("@", "").trim();
      if (!nickname) return;
      await this.addTokenFlow("nickname", async () => {
        return this.buildTokenFromNickname(nickname);
      });
      this.nicknameInput = "";
    },

    async addByAddress() {
      const address = this.addressInput.trim();
      if (!address) return;
      await this.addTokenFlow("address", async () => {
        return this.buildTokenFromAddress(address);
      });
      this.addressInput = "";
    },

    async addByKoindx() {
      const address = this.selectedKoindxAddress.trim();
      if (!address) return;
      await this.addTokenFlow("koindx", async () => {
        return this.buildTokenFromAddress(address);
      });
      this.selectedKoindxAddress = "";
    },

    async addTokenFlow(method, buildFn) {
      try {
        this.isAdding = true;
        this.addMethod = method;
        const token = await buildFn();
        await this.saveOrUpdateToken(token);
        this.alertSuccess(`${token.symbol} configured successfully.`);
      } catch (error) {
        this.alertDanger(error.message || "Unable to configure token");
      } finally {
        this.isAdding = false;
        this.addMethod = "";
      }
    },

    async buildTokenFromNickname(nickname) {
      if (!this.nicknames) {
        throw new Error("Nicknames service unavailable in this network.");
      }
      const { result } = await this.nicknames.get_address({ value: nickname });
      if (!result || !result.value) {
        throw new Error(`Nickname @${nickname} not found.`);
      }

      return this.buildTokenFromContract(result.value, {
        nickname,
        permanentAddress:
          !!result.address_modifiable_only_by_governance ||
          !!result.permanent_address,
      });
    },

    async buildTokenFromAddress(rawAddress) {
      if (!rawAddress) throw new Error("Token address is required.");
      let contractId = rawAddress;
      let nickname = "";
      let permanentAddress = true;

      if ((rawAddress === "koin" || rawAddress === "vhp") && this.nicknames) {
        const { result } = await this.nicknames.get_address({
          value: rawAddress,
        });
        if (!result || !result.value) {
          throw new Error(`Nickname @${rawAddress} not found.`);
        }
        contractId = result.value;
        nickname = rawAddress;
        permanentAddress =
          !!result.address_modifiable_only_by_governance ||
          !!result.permanent_address;
      } else if (this.nicknames) {
        const discoveredNickname = await this.getNicknameFromAddress(contractId);
        if (discoveredNickname) {
          nickname = discoveredNickname;
          const { result } = await this.nicknames.get_address({
            value: discoveredNickname,
          });
          if (result) {
            permanentAddress =
              !!result.address_modifiable_only_by_governance ||
              !!result.permanent_address;
          }
        }
      }

      return this.buildTokenFromContract(contractId, {
        nickname,
        permanentAddress,
      });
    },

    async getNicknameFromAddress(address) {
      const { result } = await this.nicknames.get_main_token({
        value: address,
      });
      if (!result || !result.token_id) return "";
      return fromHexToUtf8(result.token_id);
    },

    async buildTokenFromContract(contractId, metadata) {
      const tokenContract = new Contract({
        id: contractId,
        provider: this.provider,
        abi: utils.tokenAbi,
        serializer: await this.newSandboxSerializer(
          utils.tokenAbi.koilib_types
        ),
      }).functions;

      const { result: symbol } = await tokenContract.symbol({});
      const { result: decimals } = await tokenContract.decimals({});
      if (!symbol || !symbol.value) {
        throw new Error("Invalid token: symbol not found.");
      }

      const token = {
        network: this.network.tag,
        contractId,
        nickname: metadata.nickname || "",
        symbol: symbol.value,
        decimals: decimals ? decimals.value : 0,
        image: emptyToken,
        permanentAddress:
          typeof metadata.permanentAddress === "boolean"
            ? metadata.permanentAddress
            : true,
        addresses: [],
        noAddresses: [],
      };

      if (token.nickname && this.nicknames) {
        const tokenId = `0x${fromUtf8ToHex(token.nickname)}`;
        try {
          const { result } = await this.nicknames.metadata_of({
            token_id: tokenId,
          });
          if (result && result.value) {
            const parsed = JSON.parse(result.value);
            if (parsed.image) token.image = parsed.image;
          }
        } catch (error) {
          console.error("Unable to load token metadata", error);
        }
      }

      return token;
    },

    async saveOrUpdateToken(newToken) {
      const allTokens = [...this.tokens];
      const existingId = allTokens.findIndex(
        (t) =>
          t.contractId === newToken.contractId && t.network === this.network.tag
      );
      if (existingId >= 0) {
        const existing = allTokens[existingId];
        allTokens[existingId] = {
          ...newToken,
          addresses: existing.addresses || [],
          noAddresses: existing.noAddresses || [],
        };
      } else {
        allTokens.push(newToken);
      }
      await this._setTokens(allTokens);
      this.tokens = allTokens;
    },

    isCoreToken(token) {
      return ["koin", "vhp"].includes(token.nickname);
    },

    async removeToken(contractId) {
      const token = this.networkTokens.find((t) => t.contractId === contractId);
      if (token && this.isCoreToken(token)) {
        this.alertInfo("Core tokens cannot be removed.");
        return;
      }
      const allTokens = this.tokens.filter(
        (t) => t.network !== this.network.tag || t.contractId !== contractId
      );
      await this._setTokens(allTokens);
      this.tokens = allTokens;
      this.alertSuccess("Token removed.");
    },

    resetAddInputs() {
      this.selectedKoindxAddress = "";
      this.nicknameInput = "";
      this.addressInput = "";
    },
  },
};
</script>
<style scoped>
.container {
  margin: 2em;
  display: flex;
  flex-direction: column;
  gap: 1.4em;
}

.section {
  background: #1e1e1e;
  border: 1px solid #2e2e2e;
  border-radius: 12px;
  padding: 1em;
}

h2 {
  margin: 0 0 0.6em 0;
}

.add-grid {
  margin-top: 0.8em;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8em;
}

.add-card {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.input-control {
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.hint {
  margin: 0 0 0.8em;
  color: var(--primary-gray);
  font-size: 0.85em;
}

.empty-state {
  border: 1px dashed #444;
  border-radius: 8px;
  padding: 1em;
  text-align: center;
  color: var(--primary-gray);
}

.token-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8em;
  align-items: start;
  border: 1px solid #343434;
  border-radius: 12px;
  padding: 0.8em;
  margin-bottom: 0.7em;
}

.token-image {
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
  flex-shrink: 0;
}

.token-info {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.token-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.token-nickname {
  color: var(--primary-gray);
  font-size: 0.85em;
}

.token-detail {
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  font-size: 0.78em;
  color: var(--primary-gray);
}

.token-value {
  color: var(--primary-light);
  word-break: break-word;
  overflow-wrap: anywhere;
}

.remove-button {
  grid-column: 1 / -1;
  justify-self: end;
  min-width: 5.4em;
  margin-top: 0.2em;
}

.danger {
  border-color: var(--kondor-red) !important;
  color: var(--kondor-red) !important;
}

@media (max-width: 640px) {
  .add-grid {
    grid-template-columns: 1fr;
  }
}
</style>
