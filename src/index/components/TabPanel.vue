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
                    {{ nft.metadata ? nft.metadata.name || "Untitled" : "Untitled" }}
                  </h3>
                  <p class="nft-description">
                    {{ nft.metadata ? truncateDescription(nft.metadata.description) || "No description" : "No description" }}
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
          v-else-if="!transactions || transactions.length === 0"
          class="no-activity"
        >
          No transaction history available
        </div>
        <div
          v-else
          class="transaction-list"
        >
          <div
            v-for="transaction in transactions"
            :key="transaction.trx.transaction.id"
            class="transaction-item"
          >
            <div 
              class="transaction-icon"
              :class="{ 'sent': getTransactionType(transaction) === 'send', 'received': getTransactionType(transaction) === 'receive' }"
            >
              {{ getTransactionType(transaction) === "receive" ? "↓" : "↑" }}
            </div>
            <div class="transaction-details">
              <div class="transaction-top">
                <span class="transaction-amount">
                  {{ formatTransactionAmount(transaction) }} {{ getTokenSymbol(transaction) }}
                </span>
                <span class="transaction-id">{{ getTruncatedTransactionId(transaction) }}</span>
              </div>
              <div class="transaction-bottom">
                <span class="transaction-type">{{ getTransactionType(transaction) }}</span>
                <span class="transaction-address">
                  {{ getTransactionType(transaction) === "receive" ? "From: " : "To: " }}
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
          v-for="(coin, symbol) in coins"
          :key="symbol"
          class="coin-item"
        >
          <div class="coin-icon-and-name">
            <img
              :src="coin.image"
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
            <span class="coin-value">${{ coin.usdValue }} USD</span>
          </div>
        </div>
        <div class="manage-tokens">
          <img
            src="../../../public/images/settings-icon.svg"
            alt="Settings"
            class="settings-icon"
          >
          <span>Manage token list</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAccountHistory } from "@/services/accountService";

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
    };
  },

  computed: {
    kollectionProfileUrl() {
      return `https://kollection.app/profile/${this.address}`;
    },
  },

  watch: {
    address: "fetchData",
    activeTab: "fetchData",
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    getTransactionType(transaction) {
      const operation = transaction.trx.transaction.operations[0];
      if (operation.call_contract && operation.call_contract.args.from === this.address) {
        return "send";
      }
      return "receive";
    },

    getTransactionAmount(transaction) {
      const operation = transaction.trx.transaction.operations[0];
      if (operation.call_contract && operation.call_contract.args.value) {
        return (parseInt(operation.call_contract.args.value) / 1e8).toFixed(8);
      }
      return "N/A";
    },

    formatTransactionAmount(transaction) {
      const operation = transaction.trx.transaction.operations[0];
      if (operation.call_contract && operation.call_contract.args.value) {
        const amount = (parseInt(operation.call_contract.args.value) / 1e8);
        if (amount % 1 === 0) {
          return amount.toFixed(2);
        } else {
          return amount.toString();
        }
      }
      return "N/A";
    },

    getTruncatedTransactionId(transaction) {
      const id = transaction.trx.transaction.id;
      return id ? `${id.substring(0, 6)}...${id.substring(id.length - 6)}` : 'N/A';
    },

    getTokenSymbol(transaction) {
      return "KOIN";
    },

    getTransactionDate(transaction) {
      return "Date not available";
    },

    getTransactionAddress(transaction) {
      const operation = transaction.trx.transaction.operations[0];
      const type = this.getTransactionType(transaction);
      if (operation.call_contract) {
        return type === "receive" ? operation.call_contract.args.from : operation.call_contract.args.to;
      }
      return "N/A";
    },

    async fetchData() {
      if (this.activeTab === "nfts") {
        await this.fetchNFTs();
      } else if (this.activeTab === "activity") {
        await this.fetchAccountHistory();
      }
    },

    async fetchNFTs() {
      if (!this.address) return;

      this.loading = true;
      this.error = null;
      this.nfts = null;

      try {
        const response = await axios.get(
          `https://kollection.app/api/v1/nfts_by_owner/${this.address}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          this.nfts = response.data.data;
          console.log("NFTs loaded:", this.nfts);
        } else {
          this.error = "Unexpected API response structure";
          console.error("API response:", response.data);
        }

        if (this.nfts && this.nfts.length === 0) {
          this.error = "No NFTs found for this address";
        }
      } catch (err) {
        this.error = `Failed to fetch NFTs: ${err.message}`;
        console.error("Error fetching NFTs:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchAccountHistory() {
      if (!this.address) return;

      this.loadingActivity = true;
      this.activityError = null;
      this.transactions = [];

      try {
        const data = await getAccountHistory(this.address);
        this.transactions = data;
        console.log("Account history loaded:", this.transactions);
      } catch (err) {
        this.activityError = `Failed to fetch account history: ${err.message}`;
        console.error("Error fetching account history:", err);
      } finally {
        this.loadingActivity = false;
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab;
      this.fetchData();
    },

    truncateDescription(description) {
      if (!description) return "No description";
      return description.length > 30 ? description.slice(0, 30) + "..." : description;
    },
  },
};
</script>

<style scoped>
.bottom {
  background: #181818;
  color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-container {
  display: flex;
  justify-content: space-around;
  background: #252525;
  padding: 10px;
  margin-bottom: 10px;
}

.tabs-container a {
  color: #777777;
  text-decoration: none;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 20px;
}

.tabs-container a.active {
  background-color: #383838;
  color: #ffffff;
}

.panel {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
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
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nft-description {
  margin: 5px 0 0;
  font-size: 12px;
  color: #777777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading, .error-message, .no-nfts, .no-activity {
  text-align: center;
  padding: 20px;
  color: #777777;
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

.kollection-link a, .kollection-link a:visited {
  color: var(--primary-light);
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
  color: #777777;
}

.transaction-details {
  flex-grow: 1;
}

.transaction-top, .transaction-bottom {
  display: flex;
  justify-content: space-between;
}

.transaction-amount {
  font-weight: bold;
  color: #ffffff;
}

.transaction-date, .transaction-type, .transaction-address {
  font-size: 12px;
  color: #777777;
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
  gap: 10px;
  padding: 10px;
}

.coin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #1E1E1E;
  border-radius: 12px;
  margin-bottom: 8px;
}

.coin-icon-and-name {
  display: flex;
  align-items: center;
}

.coin-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.coin-name-container {
  display: flex;
  flex-direction: column;
}

.coin-symbol {
  font-size: 16px;
  font-weight: bold;
  color: #FFFFFF;
}

.coin-name {
  font-size: 14px;
  color: #777777;
}

.coin-balance-value {
  text-align: right;
}

.coin-balance {
  font-size: 16px;
  font-weight: bold;
  color: #FFFFFF;
  display: block;
}

.coin-value {
  font-size: 14px;
  color: #777777;
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
  color: #777777;
  font-size: 14px;
}
</style>