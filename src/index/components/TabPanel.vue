<template>
  <div class="bottom">
    <div class="tabs-container">
      <a
        v-for="tab in ['Coins', 'NFTs', 'Activity']"
        :key="tab"
        :class="{ active: activeTab === tab.toLowerCase() }"
        @click="setActiveTab(tab.toLowerCase())"
      >{{ tab }}</a>
    </div>
    <div class="panel">
      <div v-if="activeTab === 'nfts'">
        <div
          v-if="loading"
          class="loading"
        >
          Loading NFTs...
        </div>
        <div
          v-else-if="error"
          class="error-message"
        >
          {{ error }}
        </div>
        <div v-else>
          <div v-if="nfts && nfts.length > 0">
            <div class="nft-grid">
              <div
                v-for="nft in nfts"
                :key="nft.id"
                class="nft-item"
              >
                <img
                  v-if="nft.metadata && nft.metadata.image"
                  :src="nft.metadata.image"
                  :alt="nft.metadata.name"
                  class="nft-image"
                >
                <div class="nft-info">
                  <h3 class="nft-name">
                    {{
                      nft.metadata
                        ? nft.metadata.name || "Untitled"
                        : "Untitled"
                    }}
                  </h3>
                  <p class="nft-description">
                    {{
                      nft.metadata
                        ? truncateDescription(nft.metadata.description) ||
                          "No description"
                        : "No description"
                    }}
                  </p>
                </div>
              </div>
            </div>
            <div class="kollection-link">
              <a
                :href="kollectionProfileUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="../../../public/images/kollection-logo.svg"
                  alt=""
                >
                <span>View on Kollection</span>
              </a>
            </div>
          </div>
          <div
            v-else
            class="no-nfts"
          >
            No NFTs found for this address
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'activity'">
        <div
          v-if="loadingActivity"
          class="loading"
        >
          Loading transaction history...
        </div>
        <div
          v-else-if="activityError"
          class="error-message"
        >
          {{ activityError }}
        </div>
        <div
          v-else-if="!filteredTransactions || filteredTransactions.length === 0"
          class="no-activity"
        >
          No transaction history available
        </div>
        <div
          v-else
          class="transaction-list"
        >
          <div
            v-for="transaction in filteredTransactions"
            :key="transaction.trx.transaction.id"
            class="transaction-item"
          >
            <div
              class="transaction-icon"
              :class="{
                sent: getTransactionType(transaction) === 'send',
                received: getTransactionType(transaction) === 'receive',
              }"
            >
              {{ getTransactionType(transaction) === "receive" ? "↓" : "↑" }}
            </div>
            <div class="transaction-details">
              <div class="transaction-top">
                <span class="transaction-amount">
                  {{ formatTransactionAmount(transaction) }}
                  {{ getTokenSymbol(transaction) }}
                </span>
                <span
                  class="transaction-id"
                  @click="openTransactionUrl(transaction)"
                >
                  {{ getTruncatedTransactionId(transaction) }}
                </span>
              </div>
              <div class="transaction-bottom">
                <span class="transaction-type">{{
                  getTransactionType(transaction)
                }}</span>
                <span class="transaction-address">
                  {{
                    getTransactionType(transaction) === "receive"
                      ? "From: "
                      : "To: "
                  }}
                  {{ getTransactionAddress(transaction) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'coins'"
        class="coins-container"
      >
        <div
          v-for="(coin, symbol) in filteredCoins"
          :key="symbol"
          class="coin-item"
        >
          <div class="coin-icon-and-name">
            <img
              :src="getTokenImageById(coin.contractId)"
              :alt="symbol"
              class="coin-image"
            >
            <div class="coin-name-container">
              <span class="coin-symbol">{{ coin.symbol }}</span>
              <span class="coin-name">{{ coin.name }}</span>
            </div>
          </div>
          <div class="coin-balance-value">
            <span class="coin-balance">{{ coin.balance }}</span>
            <span class="coin-value">${{ calculateUsdValue(coin) }} USD</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import { getAccountHistory } from "@/services/accountService"

export default {
  props: {
    address: {
      type: String,
      required: true,
    },
    coins: {
      type: Object,
      required: true,
    },
    prices: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      activeTab: "coins",
      nfts: null,
      loading: false,
      error: null,
      transactions: [],
      loadingActivity: false,
      activityError: null,
    }
  },

  computed: {
    kollectionProfileUrl() {
      return `https://kollection.app/profile/${this.address}`
    },
    filteredTransactions() {
      return this.transactions.filter((transaction) => {
        const amount = this.getTransactionAmount(transaction)
        return amount !== null && amount !== 0
      })
    },
    filteredCoins() {
      return Object.fromEntries(
        Object.entries(this.coins).filter(([, coin]) => parseFloat(coin.balance) > 0)
      );
    },
  },

  watch: {
    address: "fetchData",
    activeTab: "fetchData",
    coins: {
      handler(newCoins) {
        console.log("Coins updated:", newCoins)
      },
      deep: true,
    },
  },

  mounted() {
    console.log("Coins object:", this.coins)
    this.fetchData()
  },

  methods: {
    getTransactionType(transaction) {
      const operation = transaction.trx.transaction.operations[0]
      if (
        operation.call_contract &&
        operation.call_contract.args.from === this.address
      ) {
        return "send"
      }
      return "receive"
    },

    getTransactionAmount(transaction) {
      const operation = transaction.trx.transaction.operations[0]
      if (operation.call_contract && operation.call_contract.args.value) {
        // eslint-disable-next-line no-undef
        const value = BigInt(operation.call_contract.args.value)
        const decimals = this.getTokenDecimals(
          operation.call_contract.contract_id
        )
        return Number(value) / Math.pow(10, decimals)
      }
      return null
    },

    formatTransactionAmount(transaction) {
      const amount = this.getTransactionAmount(transaction)
      if (amount === null) return "N/A"
      return amount % 1 === 0 ? amount.toFixed(2) : amount.toString()
    },

    getTruncatedTransactionId(transaction) {
      const id = transaction.trx.transaction.id
      return id
        ? `${id.substring(0, 6)}...${id.substring(id.length - 6)}`
        : "N/A"
    },

    getTokenSymbol(transaction) {
      const operation = transaction.trx.transaction.operations[0]
      if (operation.call_contract) {
        return this.getTokenSymbolById(operation.call_contract.contract_id)
      }
      return "Unknown"
    },

    // getTransactionDate(transaction) {
    //   return "Date not available"
    // },

    getTransactionAddress(transaction) {
      const operation = transaction.trx.transaction.operations[0]
      const type = this.getTransactionType(transaction)
      if (operation.call_contract) {
        const address =
          type === "receive"
            ? operation.call_contract.args.from
            : operation.call_contract.args.to
        return this.truncateAddress(address)
      }
      return "N/A"
    },

    truncateAddress(address) {
      if (!address) return "N/A"
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    },

    async fetchData() {
      if (this.activeTab === "nfts") {
        await this.fetchNFTs()
      } else if (this.activeTab === "activity") {
        await this.fetchAccountHistory()
      }  else if (this.activeTab === "coins") {
        await this.refreshCoins()
      }
    },

    async refreshCoins() {
      console.log("Refreshing coins...")
      this.$emit('refresh-coins')
    },

    async fetchNFTs() {
      if (!this.address) return

      this.loading = true
      this.error = null
      this.nfts = null

      try {
        const response = await axios.get(
          `https://kollection.app/api/v1/nfts_by_owner/${this.address}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        )

        if (response.data && Array.isArray(response.data.data)) {
          this.nfts = response.data.data
          console.log("NFTs loaded:", this.nfts)
        } else {
          this.error = "Unexpected API response structure"
          console.error("API response:", response.data)
        }

        if (this.nfts && this.nfts.length === 0) {
          this.error = "No NFTs found for this address"
        }
      } catch (err) {
        this.error = `Failed to fetch NFTs: ${err.message}`
        console.error("Error fetching NFTs:", err)
      } finally {
        this.loading = false
      }
    },

    async fetchAccountHistory() {
      if (!this.address) return

      this.loadingActivity = true
      this.activityError = null
      this.transactions = []

      try {
        const data = await getAccountHistory(this.address)
        this.transactions = data
        console.log("Account history loaded:", this.transactions)
      } catch (err) {
        this.activityError = `Failed to fetch account history: ${err.message}`
        console.error("Error fetching account history:", err)
      } finally {
        this.loadingActivity = false
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab
      if (tab === 'coins') {
        this.refreshCoins()
      } else {
        this.fetchData()
      }
    },

    truncateDescription(description) {
      if (!description) return "No description"
      return description.length > 30
        ? description.slice(0, 30) + "..."
        : description
    },

    calculateUsdValue(coin) {
      const price = this.prices[coin.symbol]
      if (!price) return "N/A"
      return (Number(coin.balance) * price).toFixed(2)
    },

    getTokenSymbolById(contractId) {
      // This method should return the token symbol based on the contract ID
      // You'll need to maintain a mapping of contract IDs to token symbols
      const tokenMap = {
        "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL": "KOIN",
        "18tWNU7E4yuQzz7hMVpceb9ixmaWLVyQsr": "VHP",
        "15VPnHQgm9yTWGuxCmfsPABJYnDNFymkTM": "ETH",
        "19WrWze3XAoMa3Mwqys4rJMP6emZX2wfpH": "USDT",
        "1BzymN6NwNyQszkEPkmSjnCLxpLpxHF4p7": "BTC",
        "1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy": "pVHP",
        "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS": "KAN",
        "1F81UPvBW4g2jFLU5VuBvoPeZFFHL5fPqQ": "BTK",
        "1BTQCpospHJRA7VAtZ4wvitdcqYCvkwBCD": "KCT",
        "1A7ix1dr77wUVD3XtCwbthbysT5LeB1CeG": "DRUGS",
        "17t977jJZ7DYKPQsjqtStbpvmde1DditXW": "UP",
        "1Q9o3uTa6L9XMFeUM5yfZyYuyGxn1ai2gx": "PUNKSK",
        "143CLkKmfqa6trCbjxDMKojjeLq2q4RGD8": "OGAS",
        "1AFMFjbSzpnK58xbwt6cyAnhLF77qm5FeC": "EGG",
        "1KU6cUY3TwYQzTRHakUcviiYmxNepRKkhQ": "DGK",
        "1KroK111wVj8QU3ydFHqPpNyVtfgV8n755": "KROK",
        "1GNkfsZp9ySg314QFVZAAew1VDbjGNZrZP": "KG",
        "1EoGf6wPB632JudW1P12aSByLJdeNajWoU": "MEOW",
        "1LntV8aVpngLCYLTZuHuuevvUZcBhVPegf": "GAS",
        "1H1tWd95HvL2wT25qpXrVMosGdGUNPRFiA": "RWA",
        "18JRrBdnNqQ99faV6sn6Un1MbvU5sZWgzf": "RUN",
        "16aD3Ax1kC8WKAsNevAfwyEAzoYL9T7AYs": "BALD",
      }
      return tokenMap[contractId] || "Unknown"
    },

    getTokenImageById(contractId) {
      const tokenImageMap = {
        "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/koin.png",
        "18tWNU7E4yuQzz7hMVpceb9ixmaWLVyQsr": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/vhp.png",
        "15twURbNdh6S7GVXhqVs6MoZAhCfDSdoyd": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/15twURbNdh6S7GVXhqVs6MoZAhCfDSdoyd.png",
        "14MjxccMUZrtBPXnNkuAC5MLtPev2Zsk3N": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/14MjxccMUZrtBPXnNkuAC5MLtPev2Zsk3N.png",
        "15zQzktjXHPRstPYB9dqs6jUuCUCVvMGB9": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/15zQzktjXHPRstPYB9dqs6jUuCUCVvMGB9.png",
        "1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy.png",
        "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS.png",
        "1F81UPvBW4g2jFLU5VuBvoPeZFFHL5fPqQ": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1F81UPvBW4g2jFLU5VuBvoPeZFFHL5fPqQ.png",
        "1BTQCpospHJRA7VAtZ4wvitdcqYCvkwBCD": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1BTQCpospHJRA7VAtZ4wvitdcqYCvkwBCD.png",
        "1A7ix1dr77wUVD3XtCwbthbysT5LeB1CeG": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1A7ix1dr77wUVD3XtCwbthbysT5LeB1CeG.png",
        "17t977jJZ7DYKPQsjqtStbpvmde1DditXW": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/17t977jJZ7DYKPQsjqtStbpvmde1DditXW.png",
        "1Q9o3uTa6L9XMFeUM5yfZyYuyGxn1ai2gx": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1Q9o3uTa6L9XMFeUM5yfZyYuyGxn1ai2gx.png",
        "143CLkKmfqa6trCbjxDMKojjeLq2q4RGD8": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/143CLkKmfqa6trCbjxDMKojjeLq2q4RGD8.png",
        "1AFMFjbSzpnK58xbwt6cyAnhLF77qm5FeC": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1AFMFjbSzpnK58xbwt6cyAnhLF77qm5FeC.png",
        "1KU6cUY3TwYQzTRHakUcviiYmxNepRKkhQ": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1KU6cUY3TwYQzTRHakUcviiYmxNepRKkhQ.png",
        "1KroK111wVj8QU3ydFHqPpNyVtfgV8n755": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1KroK111wVj8QU3ydFHqPpNyVtfgV8n755.png",
        "1GNkfsZp9ySg314QFVZAAew1VDbjGNZrZP": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1GNkfsZp9ySg314QFVZAAew1VDbjGNZrZP.png",
        "1EoGf6wPB632JudW1P12aSByLJdeNajWoU": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1EoGf6wPB632JudW1P12aSByLJdeNajWoU.png",
        "1LntV8aVpngLCYLTZuHuuevvUZcBhVPegf": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1LntV8aVpngLCYLTZuHuuevvUZcBhVPegf.png",
        "1H1tWd95HvL2wT25qpXrVMosGdGUNPRFiA": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/1H1tWd95HvL2wT25qpXrVMosGdGUNPRFiA.png",
        "18JRrBdnNqQ99faV6sn6Un1MbvU5sZWgzf": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/18JRrBdnNqQ99faV6sn6Un1MbvU5sZWgzf.png",
        "16aD3Ax1kC8WKAsNevAfwyEAzoYL9T7AYs": "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/16aD3Ax1kC8WKAsNevAfwyEAzoYL9T7AYs.png",
      };
      return tokenImageMap[contractId] || "https://raw.githubusercontent.com/koindx/token-list/main/src/images/mainnet/15zQzktjXHPRstPYB9dqs6jUuCUCVvMGB9.png"
    },

    getTokenDecimals(contractId) {
      // This method should return the number of decimals for the token
      const decimalMap = {
        "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL": 8, // KOIN
        "18tWNU7E4yuQzz7hMVpceb9ixmaWLVyQsr": 8, // VHP
        "15VPnHQgm9yTWGuxCmfsPABJYnDNFymkTM": 8, // ETH
        "19WrWze3XAoMa3Mwqys4rJMP6emZX2wfpH": 8, // USDT
        "1BzymN6NwNyQszkEPkmSjnCLxpLpxHF4p7": 8, // BTC
        "1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy": 8, // pVHP
        "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS": 8, // KAN
        "1F81UPvBW4g2jFLU5VuBvoPeZFFHL5fPqQ": 8, // BTK
        "1BTQCpospHJRA7VAtZ4wvitdcqYCvkwBCD": 8, // KCT
        "1A7ix1dr77wUVD3XtCwbthbysT5LeB1CeG": 8, // DRUGS
        "17t977jJZ7DYKPQsjqtStbpvmde1DditXW": 8, // UP
        "1Q9o3uTa6L9XMFeUM5yfZyYuyGxn1ai2gx": 8, // PUNKSK
        "143CLkKmfqa6trCbjxDMKojjeLq2q4RGD8": 8, // OGAS
        "1AFMFjbSzpnK58xbwt6cyAnhLF77qm5FeC": 8, // EGG
        "1KU6cUY3TwYQzTRHakUcviiYmxNepRKkhQ": 8, // DGK
        "1KroK111wVj8QU3ydFHqPpNyVtfgV8n755": 8, // KROK
        "1GNkfsZp9ySg314QFVZAAew1VDbjGNZrZP": 8, // KG
        "1EoGf6wPB632JudW1P12aSByLJdeNajWoU": 8, // MEOW
        "1LntV8aVpngLCYLTZuHuuevvUZcBhVPegf": 8, // GAS
        "1H1tWd95HvL2wT25qpXrVMosGdGUNPRFiA": 8, // RWA
        "18JRrBdnNqQ99faV6sn6Un1MbvU5sZWgzf": 8, // RUN
        "16aD3Ax1kC8WKAsNevAfwyEAzoYL9T7AYs": 8, // BALD
      }
      return decimalMap[contractId] || 8 // Default to 8 decimals if unknown
    },
    openTransactionUrl(transaction) {
      const transactionId = transaction.trx.transaction.id
      const url = `https://koinosblocks.com/tx/${transactionId}`
      window.open(url, "_blank")
    },
  },
}
</script>

<style scoped>
.bottom {
  background: var(--primary-dark);
  color: var(--primary-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-container {
  display: flex;
  justify-content: space-around;
  background: var(--primary-dark);
  padding: 10px;
  margin-bottom: 10px;
}

.tabs-container a {
  color: var(--primary-gray);
  text-decoration: none;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 20px;
}

.tabs-container a.active {
  background-color: #383838;
  color: var(--primary-light);
}

.panel {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 0.5em;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.nft-item {
  background-color: #252525;
  border-radius: 10px;
  overflow: hidden;
}

.nft-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}

.nft-info {
  padding: 10px;
}

.nft-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nft-description {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--primary-gray);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading,
.error-message,
.no-nfts,
.no-activity {
  text-align: center;
  padding: 20px;
  color: var(--primary-gray);
}

.error-message {
  color: #ff6b6b;
}

.kollection-link {
  width: 100%;
  text-align: center;
  padding: 1em;
  margin-top: auto;
  color: var(--primary-light);
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.kollection-link img {
  width: 1.5em;
}

.kollection-link a,
.kollection-link a:visited {
  color: var(--primary-light) !important;
  text-decoration: none;
  display: flex;
  gap: 1em;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transaction-item {
  display: flex;
  background-color: #252525;
  border-radius: 10px;
  padding: 10px;
  align-items: center;
}

.transaction-icon {
  font-size: 24px;
  margin-right: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.transaction-icon.sent {
  color: #ff4d4d;
}

.transaction-icon.received {
  color: #4caf50;
}

.transaction-id {
  font-size: 12px;
  color: var(--primary-gray);
}

.transaction-details {
  flex-grow: 1;
}

.transaction-top,
.transaction-bottom {
  display: flex;
  justify-content: space-between;
}

.transaction-amount {
  font-weight: bold;
  color: var(--primary-light);
}

.transaction-date,
.transaction-type,
.transaction-address {
  font-size: 12px;
  color: var(--primary-gray);
}

.transaction-address {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coins-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.coin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #1e1e1e;
  border-radius: 12px;
  margin-bottom: 8px;
}

.coin-icon-and-name {
  display: flex;
  align-items: center;
}

.coin-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.coin-name-container {
  display: flex;
  flex-direction: column;
}

.coin-symbol {
  font-size: 16px;
  color: var(--primary-light);
}

.coin-name {
  font-size: 14px;
  color: var(--primary-gray);
}

.coin-balance-value {
  text-align: right;
}

.coin-balance {
  font-size: 16px;
  color: var(--primary-light);
  display: block;
}

.coin-value {
  font-size: 14px;
  color: var(--primary-gray);
}

.manage-tokens {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  margin-top: 10px;
  cursor: pointer;
}

.settings-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.manage-tokens span {
  color: var(--primary-gray);
  font-size: 14px;
}

.transaction-id {
  cursor: pointer;
  text-decoration: underline;
  color: var(--kondor-purple);
}

.transaction-id:hover {
  color: var(--kondor-purple);
}
</style>
