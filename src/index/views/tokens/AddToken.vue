<template>
  <div class="container">
    <div class="screen-heading">
      <PageTitle
        title="Add Token"
        subtitle="Add a token to your main account"
      />
    </div>
    <!-- Dropdown for selecting tokens -->
    <div class="selection-group">
      <select
        v-model="selectedToken"
        :disabled="showAdvanced"
        class="option-select"
        @change="onTokenSelected"
      >
        <option
          class="option-select"
          disabled
          value=""
        >
          Select a token
        </option>
        <option
          v-for="token in koindxTokens"
          :key="token.address"
          :value="token"
        >
          {{ token.id }}
        </option>
      </select>

      <input
        v-if="useNickname"
        v-model="name"
        type="text"
        placeholder="Nickname"
        @keyup.enter="accept"
      >

      <input
        v-if="useCustomAddress"
        v-model="customAddress"
        type="text"
        placeholder="Address"
        @keyup.enter="accept"
      >

      <div class="row">
        <a
          class="advanced-toggle"
          @click="toggleAdvanced()"
        >Advanced
          <span
            v-if="!showAdvanced"
            class="material-icons"
          >expand_more</span>
          <span
            v-else
            class="material-icons"
          >expand_less</span>
        </a>
      </div>
      <!-- <div v-if="showAdvanced" class="advanced-content">
        <input
          v-model="tokenAddress"
          type="text"
          placeholder="Token address"
          @keyup.enter="accept"
        />
      </div> -->
      <div v-if="showAdvanced">
        <input
          v-model="tokenToRemove"
          type="text"
          placeholder="Token to remove"
          @keyup.enter="remove"
        >

        <button
          class="custom-button primary"
          @click="remove"
        >
          <span class="custom-button primary">remove</span>
        </button>
      </div>
    </div>

    <div class="button-group">
      <button
        v-if="!requestSecondConfirmation"
        :disabled="loading"
        class="custom-button primary"
        @click="accept"
      >
        <span
          v-if="loading"
          class="loader2"
        />
        <span
          v-else
          class="custom-button primary"
        >accept</span>
      </button>

      <div
        v-else
        class="second-confirmation"
      >
        <!-- <div v-if="!tokenPermanentAddress" class="warning-notification">
          The token address is not permanent and could be changed at any time.
          Only continue if you understand the risks.
        </div> -->
        <button
          class="custom-button primary"
          @click="accept2"
        >
          Yes, add token
        </button>
      </div>

      <button
        class="custom-button secondary"
        @click="cancel"
      >
        cancel
      </button>
    </div>
  </div>
</template>

<script>
import { Contract, Provider, utils } from "koilib";
import axios from "axios";
import router from "@/index/router";
import emptyToken from "@/shared/assets/empty-token.png";
import PageTitle from "../../../shared/components/PageTitle";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

function fromUtf8ToHex(text) {
  return utils.toHexString(new TextEncoder().encode(text));
}

function fromHexToUtf8(hex) {
  const hex2 = hex.startsWith("0x") ? hex.slice(2) : hex;
  return new TextDecoder().decode(utils.toUint8Array(hex2));
}

const importByNickname = "Import token by nickname";
const importByAddress = "Import token by address";

export default {
  components: { PageTitle },
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      showAdvanced: false,
      name: "",
      customAddress: "",
      tokenAddress: "",
      tokenToRemove: "",
      nicknames: null,
      network: null,
      provider: null,
      tokens: [],
      requestSecondConfirmation: false,
      tokenPermanentAddress: true,
      loading: false,
      koindxTokens: [], // To store the list of tokens from KoinDX
      selectedToken: "", // To store the selected token from the dropdown
      useNickname: false,
      useCustomAddress: false,
    };
  },

  watch: {
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork();
    },

    name: function () {
      this.requestSecondConfirmation = false;
    },

    tokenAddress: function () {
      this.requestSecondConfirmation = false;
    },
  },

  async mounted() {
    await this.loadNetwork();
    await this.fetchKoindxTokens(); // Fetch KoinDX tokens on component mount
  },

  methods: {
    async loadNetwork() {
      try {
        this.$store.state.networks = await this._getNetworks();
        this.tokens = await this._getTokens();
        const currentTag = await this._getCurrentNetwork();
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        );
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork];
        this.provider = new Provider(this.network.rpcNodes);

        // load nicknames contract
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

    async fetchKoindxTokens() {
      try {
        const response = await axios.get(
          `https://raw.githubusercontent.com/koindx/token-list/main/src/tokens/${this.network.tag}.json`
        );
        this.koindxTokens = [
          { id: importByNickname },
          { id: importByAddress },
          ...response.data.tokens.map((t) => ({
            ...t,
            id: `${t.name} (${t.symbol})`,
          })),
        ];
      } catch (error) {
        console.error("Failed to fetch KoinDX tokens", error);
      }
    },

    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced;
      if (this.showAdvanced) {
        this.selectedToken = ""; // Clear selected token when advanced mode is on
      }
    },

    onTokenSelected() {
      if (this.selectedToken && !this.showAdvanced) {
        if (this.selectedToken.id === importByNickname) {
          this.useNickname = true;
          this.useCustomAddress = false;
        } else if (this.selectedToken.id === importByAddress) {
          this.useNickname = false;
          this.useCustomAddress = true;
        } else {
          this.tokenAddress = this.selectedToken.address; // Set the contract address
          this.useNickname = false;
          this.useCustomAddress = false;
        }
      }
    },

    async getNicknameFromAddress(address) {
      const { result } = await this.nicknames.get_main_token({
        value: address,
      });
      if (!result || !result.token_id) {
        return "";
        // throw new Error(`No nickname for address ${address}`);
      }
      return fromHexToUtf8(result.token_id);
    },

    async accept() {
      try {
        this.loading = true;
        const newToken = {
          network: this.network.tag,
          contractId: "",
          nickname: "",
          symbol: "",
          decimals: 0,
          image: emptyToken,
          permanentAddress: true,
          addresses: [],
          noAddresses: [],
        };

        if (this.useCustomAddress) {
          // Custom Address
          this.tokenAddress = this.customAddress;
          this.name = "";
        } else if (!this.useNickname) {
          // KoinDX list
          if (!this.tokenAddress) {
            throw new Error("Select a token from the list");
          }
          if (["koin", "vhp"].includes(this.tokenAddress)) {
            // when KoinDX uses names instead of addresses
            this.name = this.tokenAddress;
          } else {
            this.name = await this.getNicknameFromAddress(this.tokenAddress);
          }
        }

        if (this.name) {
          // token with a nickname
          const tokenId = `0x${fromUtf8ToHex(this.name)}`;
          try {
            const { result } = await this.nicknames.get_address({
              value: this.name,
            });
            newToken.contractId = result.value;
            newToken.nickname = this.name;
            newToken.permanentAddress =
              !!result.address_modifiable_only_by_governance ||
              !!result.permanent_address;
            this.tokenPermanentAddress = newToken.permanentAddress;
          } catch (error) {
            console.log(error);
            throw new Error(
              `nickname @${this.name} not found in ${this.network.tag} network`
            );
          }

          try {
            const { result: resultMetadata } = await this.nicknames.metadata_of(
              {
                token_id: tokenId,
              }
            );
            const metadata = JSON.parse(resultMetadata.value);
            if (metadata.image) newToken.image = metadata.image;
          } catch (error) {
            console.error(
              `error when loading metadata of token @${newToken.nickname}`
            );
            console.error(error);
          }
        } else {
          // token without a nickname
          newToken.contractId = this.tokenAddress;
          newToken.nickname = "";
          newToken.permanentAddress = true;
          newToken.image = emptyToken;
        }

        const contract = new Contract({
          id: newToken.contractId,
          provider: this.provider,
          abi: utils.tokenAbi,
          serializer: await this.newSandboxSerializer(
            utils.tokenAbi.koilib_types
          ),
        }).functions;

        const { result: symbol } = await contract.symbol({});
        let { result: decimals } = await contract.decimals({});

        if (!symbol || !symbol.value) throw new Error("Token without symbol");

        newToken.symbol = symbol.value;
        newToken.decimals = decimals ? decimals.value : 0;

        const existingId = this.tokens.findIndex(
          (t) =>
            t.contractId === newToken.contractId &&
            t.network === this.network.tag
        );
        if (existingId >= 0) {
          const { addresses, noAddresses } = this.tokens[existingId];
          this.tokens[existingId] = {
            ...newToken,
            addresses,
            noAddresses,
          };
        } else {
          this.tokens.push(newToken);
        }

        // this.requestSecondConfirmation = !this.tokenPermanentAddress;
        this.requestSecondConfirmation = false; // TODO: request confirmation
        if (!this.requestSecondConfirmation) {
          await this._setTokens(this.tokens);
          router.back();
        }
        this.loading = false;
      } catch (error) {
        this.alertDanger(error.message);
        this.loading = false;
        throw error;
      }
    },

    async accept2() {
      await this._setTokens(this.tokens);
      router.back();
    },

    cancel() {
      router.back();
    },

    async remove() {
      try {
        const contractIdOrNickname = this.tokenToRemove.trim();
        let id;
        if (contractIdOrNickname.startsWith("1")) {
          id = this.tokens.findIndex(
            (t) => t.contractId === contractIdOrNickname
          );
        } else {
          id = this.tokens.findIndex(
            (t) => t.nickname === contractIdOrNickname
          );
        }

        if (id < 0) throw new Error("Token not found");
        if (this.tokens[id].nickname === "koin")
          throw new Error("Koin cannot be removed");

        this.tokens.splice(id, 1);
        const tokens = (await this._getTokens()).filter((t) => {
          if (t.network !== this.network.tag) return true;
          if (contractIdOrNickname.startsWith("1")) {
            return t.contractId !== contractIdOrNickname;
          }
          return t.nickname !== contractIdOrNickname;
        });
        await this._setTokens(tokens);
        router.back();
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
  },
};
</script>

<style scoped>
input {
  width: 88% !important;
  margin: 0 !important;
}
.container {
  min-height: 20em;
  margin: 2em 4em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.row {
  margin-top: 1em;
  width: 100%;
  text-align: center;
}

.advanced-content {
  margin-top: 1em;
  text-align: center;
  width: 100%;
}

.advanced-toggle .material-icons {
  font-size: 1em;
  vertical-align: text-bottom;
}

.warning-notification {
  color: var(--kondor-light);
  background-color: #ef6161;
  padding: 1em;
  margin: 1em 0em;
  border-radius: 8px;
  width: 80%;
}

.second-confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.option-select {
  margin-bottom: 1em;
  border: 1px solid var(--kondor-purple);
}
.selection-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
}
.button-group {
  display: flex;
  width: 100%;
  gap: 1em;
  flex-direction: row-reverse;
}
</style>
