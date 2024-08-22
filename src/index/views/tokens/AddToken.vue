<template>
  <div class="container">
    <h1>Add Token</h1>

    <!-- Dropdown for selecting tokens -->
    <div class="selection-group">
      <select
        v-model="selectedToken"
        @change="onTokenSelected"
        :disabled="showAdvanced"
        class="option-select"
      >
        <option class="option-select" disabled value="">Select a token</option>
        <option
          v-for="token in koindxTokens"
          :key="token.address"
          :value="token"
        >
          {{ token.name }} ({{ token.symbol }})
        </option>
      </select>

      <input
        v-model="name"
        type="text"
        placeholder="Nickname"
        @keyup.enter="accept"
      />

      <div class="row">
        <a class="advanced-toggle" @click="toggleAdvanced()"
          >Advanced
          <span v-if="!showAdvanced" class="material-icons">expand_more</span>
          <span v-else class="material-icons">expand_less</span>
        </a>
      </div>
      <div v-if="showAdvanced" class="advanced-content">
        <input
          v-model="tokenAddress"
          type="text"
          placeholder="Token address"
          @keyup.enter="accept"
        />
      </div>
    </div>

    <div class="button-group">
      <button
        v-if="!requestSecondConfirmation"
        :disabled="loading"
        @click="accept"
        class="custom-button primary"
      >
        <span v-if="loading" class="loader2" />
        <span v-else class="custom-button primary">accept</span>
      </button>

      <div v-else class="second-confirmation">
        <div v-if="!tokenInKoinDX" class="warning-notification">
          This token is not listed in KoinDX. It is extremely important that you
          add only trusted tokens; Otherwise, you risk losing funds.
        </div>
        <div v-if="!tokenPermanentAddress" class="warning-notification">
          The token address is not permanent and could be changed at any time.
          Only continue if you understand the risks.
        </div>
        <button @click="accept2" class="custom-button primary">
          Yes, add token
        </button>
      </div>

      <button @click="cancel" class="custom-button secondary">cancel</button>
    </div>
  </div>
</template>

<script>
import { Contract, Provider, utils } from "koilib"
import axios from "axios"
import router from "@/index/router"
import emptyToken from "@/shared/assets/empty-token.png"

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper"
import Storage from "@/shared/mixins/Storage"
import Sandbox from "@/shared/mixins/Sandbox"

function fromUtf8ToHex(text) {
  return utils.toHexString(new TextEncoder().encode(text))
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
      tokenInKoinDX: false,
      tokenPermanentAddress: true,
      loading: false,
      koindxTokens: [], // To store the list of tokens from KoinDX
      selectedToken: "", // To store the selected token from the dropdown
    }
  },

  watch: {
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork()
    },

    name: function () {
      this.requestSecondConfirmation = false
    },

    tokenAddress: function () {
      this.requestSecondConfirmation = false
    },
  },

  async mounted() {
    await this.loadNetwork()
    await this.fetchKoindxTokens() // Fetch KoinDX tokens on component mount
  },

  methods: {
    async loadNetwork() {
      try {
        this.$store.state.networks = await this._getNetworks()
        const currentTag = await this._getCurrentNetwork()
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        )
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork]
        this.provider = new Provider(this.network.rpcNodes)

        // load nicknames contract
        if (this.network.nicknamesContractId) {
          const nicknamesAbi = await this._getAbi(
            this.network.tag,
            this.network.nicknamesContractId
          )
          this.nicknames = new Contract({
            id: this.network.nicknamesContractId,
            abi: nicknamesAbi,
            provider: this.provider,
            serializer: await this.newSandboxSerializer(
              nicknamesAbi.koilib_types
            ),
          }).functions
        }
      } catch (error) {
        this.alertDanger(error.message)
        throw error
      }
    },

    async fetchKoindxTokens() {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/koindx/token-list/main/src/tokens/mainnet.json"
        )
        this.koindxTokens = response.data.tokens
      } catch (error) {
        console.error("Failed to fetch KoinDX tokens", error)
      }
    },

    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced
      if (this.showAdvanced) {
        this.selectedToken = "" // Clear selected token when advanced mode is on
      }
    },

    onTokenSelected() {
      if (this.selectedToken && !this.showAdvanced) {
        this.name = this.selectedToken.name
        this.tokenAddress = this.selectedToken.address // Set the contract address
        this.tokenInKoinDX = true // As the token is selected from KoinDX list
      }
    },

    async accept() {
      try {
        this.loading = true
        const newToken = {
          network: this.network.tag,
          contractId: this.tokenAddress,
          nickname: this.name,
          symbol: "",
          decimals: 0,
          image: emptyToken,
          permanentAddress: true,
          addresses: [],
          noAddresses: [],
        }

        if (!this.tokenAddress) {
          throw new Error("Token address is required")
        }

        const contract = new Contract({
          id: newToken.contractId,
          provider: this.provider,
          abi: utils.tokenAbi,
          serializer: await this.newSandboxSerializer(
            utils.tokenAbi.koilib_types
          ),
        }).functions

        const { result: symbol } = await contract.symbol({})
        let { result: decimals } = await contract.decimals({})

        if (!symbol || !symbol.value) throw new Error("Token without symbol")
        if (!decimals) decimals = 0

        newToken.symbol = symbol.value
        newToken.decimals = decimals.value

        this.tokens = await this._getTokens()
        const existingId = this.tokens.findIndex(
          (t) =>
            t.contractId === newToken.contractId &&
            t.network === this.network.tag
        )
        if (existingId >= 0) {
          const { addresses, noAddresses } = this.tokens[existingId]
          this.tokens[existingId] = {
            ...newToken,
            addresses,
            noAddresses,
          }
        } else {
          this.tokens.push(newToken)
        }

        this.requestSecondConfirmation =
          !this.tokenInKoinDX || !this.tokenPermanentAddress
        if (!this.requestSecondConfirmation) {
          await this._setTokens(this.tokens)
          router.back()
        }
        this.loading = false
      } catch (error) {
        this.alertDanger(error.message)
        this.loading = false
        throw error
      }
    },

    async accept2() {
      await this._setTokens(this.tokens)
      router.back()
    },

    cancel() {
      router.back()
    },
  },
}
</script>

<style scoped>
.container {
  min-height: 20em;
  margin: 2em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
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
.option-select {
  margin-bottom: 1em;
  border: 1px solid var(--kondor-purple);
}
.selection-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}
.button-group {
  display: flex;
  width: 90%;
  gap: 1em;
  flex-direction: row-reverse;
}
</style>
