<template>
  <div class="container">
    <h1>Add Token</h1>
    <div class="warning-notification">
      This is an experimental feature. It is extremely important that you
      add only trusted tokens; Otherwise, you risk losing funds.
    </div>
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
      class=""
      @click="accept"
    >
      accept
    </button>
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
import router from "@/index/router";

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
    };
  },

  watch: {
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork();
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
          image: "",
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

        const tokens = await this._getTokens();
        const existingId = tokens.findIndex(
          (t) =>
            t.contractId === newToken.contractId &&
            t.network === this.network.tag
        );
        if (existingId >= 0) {
          const { addresses, noAddresses } = tokens[existingId];
          tokens[existingId] = {
            ...newToken,
            addresses,
            noAddresses,
          };
        } else {
          tokens.push(newToken);
        }

        await this._setTokens(tokens);
        router.back();
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
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
</style>
