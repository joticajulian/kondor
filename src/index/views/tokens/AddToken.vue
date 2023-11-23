<template>
  <div class="container">
    <h1>Add Token</h1>
    <input
      v-model="name"
      type="text"
      placeholder="Nickname"
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
        >expand_more</span><span
          v-else
          class="material-icons"
        >expand_less</span></a>
    </div>
    <div
      v-if="showAdvanced"
      class="advanced-content"
    >
      <input
        v-model="tokenAddress"
        type="text"
        placeholder="token address"
        @keyup.enter="accept"
      >
    </div>
    <button
      v-if="!requestSecondConfirmation"
      class=""
      @click="accept"
    >
      accept
    </button>
    <div
      v-else
      class="second-confirmation"
    >
      <div class="warning-notification">
        This token is not listed in KoinDX. It is extremely important that you
        add only trusted tokens; Otherwise, you risk losing funds.
      </div>
      <button
        class=""
        @click="accept2"
      >
        Yes, add token
      </button>
    </div>
    <button
      class=""
      @click="cancel"
    >
      cancel
    </button>
  </div>
</template>

<script>
import { Contract, Provider, utils } from "koilib";
import axios from "axios";
import router from "@/index/router";
import emptyToken from "@/shared/assets/empty-token.png";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

function fromUtf8ToHex(text) {
  return utils.toHexString(new TextEncoder().encode(text));
}

export default {
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      showAdvanced: false,
      name: "",
      tokenAddress: "",
      nicknames: null,
      network: null,
      provider: null,
      tokens: [],
      requestSecondConfirmation: false,
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
  },

  methods: {
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

    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced;
    },

    async accept() {
      try {
        const newToken = {
          network: this.network.tag,
          contractId: "",
          nickname: "",
          symbol: "",
          decimals: 0,
          image: emptyToken,
          addresses: [],
          noAddresses: [],
        };

        if (this.showAdvanced) {
          if (!this.tokenAddress)
            throw new Error("define the address of the token");
          newToken.contractId = this.tokenAddress;
        } else {
          if (!this.name) throw new Error("define the nickname of the token");
          const tokenId = `0x${fromUtf8ToHex(this.name)}`;
          const { result } = await this.nicknames.owner_of({
            token_id: tokenId,
          });
          if (!result || !result.account) {
            throw new Error(
              `nickname @${this.name} not found in ${this.network.tag} network`
            );
          }
          newToken.contractId = result.account;
          newToken.nickname = this.name;

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
        const { result: decimals } = await contract.decimals({});

        if (!symbol || !symbol.value) throw new Error("token without symbol");
        if (!decimals) throw new Error("token without decimals");

        newToken.symbol = symbol.value;
        newToken.decimals = decimals.value;

        this.tokens = await this._getTokens();
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

        // verify token in koindx
        let isListedInKoinDX = false;
        if (newToken.nickname === "koin" || newToken.nickname === "vhp") {
          isListedInKoinDX = true;
        } else if (this.network.tag === "mainnet") {
          try {
            const { data: koindxTokens } = await axios.get(
              "https://raw.githubusercontent.com/koindx/token-list/main/src/tokens/mainnet.json"
            );
            if (
              koindxTokens.tokens.find((t) => t.address === newToken.contractId)
            ) {
              isListedInKoinDX = true;
            }
          } catch (error) {
            console.error(error);
          }
        } else if (this.network.tag === "harbinger") {
          try {
            const { data: koindxTokens } = await axios.get(
              "https://raw.githubusercontent.com/koindx/token-list/main/src/tokens/harbinger.json"
            );
            if (
              koindxTokens.tokens.find((t) => t.address === newToken.contractId)
            ) {
              isListedInKoinDX = true;
            }
          } catch (error) {
            console.error(error);
          }
        }

        if (isListedInKoinDX) {
          await this._setTokens(this.tokens);
          router.back();
        } else {
          this.requestSecondConfirmation = true;
        }
      } catch (error) {
        this.alertDanger(error.message);
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
  },
};
</script>
<style scoped>
.container {
  min-height: 20em;
  margin: 4em 2em;
}

.row {
  margin-top: 1em;
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
  color: white;
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
</style>
