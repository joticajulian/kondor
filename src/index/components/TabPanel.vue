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
        <div v-if="!isTestnet">
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
                    :src="convertIPFSUrl(nft.metadata.image)"
                    :alt="nft.metadata.name"
                    class="nft-image"
                    @error="handleImageError"
                    @load="handleImageLoad"
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
          v-else-if="!filteredEvents || filteredEvents.length === 0"
          class="no-activity"
        >
          No transaction history available
        </div>
        <div
          v-else
          class="transaction-list"
        >
          <div
            v-for="(event, id) in filteredEvents"
            :key="id"
            class="transaction-item"
          >
            <div
              class="transaction-icon"
              :class="{
                sent: event.type === 'send',
                received: event.type === 'receive',
              }"
            >
              {{ event.type === "receive" ? "↓" : "↑" }}
            </div>
            <div class="transaction-details">
              <div class="transaction-top">
                <span class="transaction-amount">
                  {{ event.amountFormatted }}
                  {{ event.token.symbol }}
                </span>
                <span
                  class="transaction-id"
                  @click="openTransactionUrl(event.txOrBlockLink)"
                >
                  {{ event.txOrBlockText }}
                </span>
              </div>
              <div class="transaction-bottom">
                <span class="transaction-type">{{ event.type }}</span>
                <span class="transaction-address">
                  {{ event.summary }}
                </span>
              </div>
            </div>
            <span
              v-if="tokenPrices[event.token.symbol]"
              class="token-price"
            >
              Price: ${{ tokenPrices[event.token.symbol].toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'coins'"
        class="coins-container"
      >
        <div
          v-if="isTestnet"
          class="testnet-message"
        >
          Pricing is not available in testnet mode
        </div>
        <div
          v-for="(coin, symbol) in filteredCoins"
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
              <span class="coin-name">
                <span v-if="isTestnet">&nbsp;</span>
                <span
                  v-else-if="tokenPrices[coin.symbol] === undefined"
                >&nbsp;</span>
                <span
                  v-else-if="!tokenPrices[coin.symbol]"
                  class="skeleton-loader price-skeleton"
                />
                <span v-else>${{ formatPrice(tokenPrices[coin.symbol]) }}</span>
              </span>
            </div>
          </div>
          <div class="coin-balance-value">
            <span class="coin-balance">{{ coin.balance }}</span>
            <span class="coin-value">
              <span v-if="isTestnet">&nbsp;</span>
              <span
                v-else-if="tokenPrices[coin.symbol] === undefined"
              >&nbsp;</span>
              <span
                v-else-if="!tokenPrices[coin.symbol]"
                class="skeleton-loader value-skeleton"
              />
              <span v-else>${{ calculateUsdValue(coin) }} USD</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Contract, Provider, utils } from "koilib";
import { mapState, mapActions } from "vuex";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

export default {
  mixins: [Storage, Sandbox, ViewHelper],

  props: {
    address: {
      type: String,
      required: true,
    },
    coins: {
      type: Array,
      required: true,
    },
    prices: {
      type: Object,
      required: true,
    },
    isTestnet: Boolean,
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
      serializer: null,
      provider: null,
      networkTag: null,
      filteredEvents: [],
      isLoadingPrices: true,
    };
  },

  computed: {
    kollectionProfileUrl() {
      return `https://kollection.app/profile/${this.address}`;
    },
    filteredCoins() {
      console.log("Filtered coins:", this.coins);
      return this.coins;
    },
    ...mapState(["tokenPrices"]),
    totalBalance() {
      return this.filteredCoins
        .reduce((total, coin) => {
          const price = this.tokenPrices[coin.symbol] || 0;
          const balance = parseFloat(coin.balance) || 0;
          return total + balance * price;
        }, 0)
        .toFixed(2);
    },
  },

  watch: {
    address: "fetchData",
    activeTab: "fetchData",
    coins: {
      handler(newCoins) {
        console.log("Coins updated:", newCoins);
      },
      deep: true,
    },
    "$store.state.currentNetwork": function () {
      this.provider = new Provider(
        this.$store.state.networks[this.$store.state.currentNetwork].rpcNodes
      );
      this.networkTag =
        this.$store.state.networks[this.$store.state.currentNetwork].tag;
      this.filteredEvents = [];
    },
    totalBalance(newBalance) {
      this.$store.commit("SET_TOTAL_BALANCE", parseFloat(newBalance));
    },
  },

  async mounted() {
    this.serializer = await this.newSandboxSerializer(
      utils.tokenAbi.koilib_types
    );
    console.log("Coins object:", this.coins);

    this.$store.state.networks = await this._getNetworks();
    this.networkTag = await this._getCurrentNetwork();
    this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
      (n) => n.tag === this.networkTag
    );
    this.provider = new Provider(
      this.$store.state.networks[this.$store.state.currentNetwork].rpcNodes
    );

    this.fetchData();
    await this.fetchTokenPrices();
    console.log("Token prices in component:", this.tokenPrices);
    await this.refreshPrices();
  },

  methods: {
    ...mapActions(["fetchTokenPrices"]),

    getTruncatedTransactionId(id) {
      return id
        ? `${id.substring(0, 6)}...${id.substring(id.length - 6)}`
        : "N/A";
    },

    truncateAddress(address) {
      if (!address) return "N/A";
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    },

    async fetchData() {
      if (this.activeTab === "nfts") {
        await this.fetchNFTs();
      } else if (this.activeTab === "activity") {
        await this.fetchAccountHistory();
      } else if (this.activeTab === "coins") {
        await this.refreshCoins();
      }
    },

    async refreshCoins() {
      console.log("Refreshing coins...");
      this.$emit("refresh-coins");
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
        if (!this.provider) {
          this.provider = new Provider(
            this.$store.state.networks[
              this.$store.state.currentNetwork
            ].rpcNodes
          );
        }
        const data = await this.provider.call(
          "account_history.get_account_history",
          {
            address: this.address,
            ascending: false,
            limit: 40,
          }
        );

        this.transactions = data.values;
        console.log("Account history loaded:", this.transactions);

        if (!this.transactions) {
          this.filteredEvents = [];
          return;
        }
        const events = [];
        await Promise.all(
          this.transactions.map(async (tx) => {
            if (!tx) return;
            let rawEvents = [];
            let recordId = "";
            let txOrBlockLink = "";
            let txOrBlockText = "";
            const { explorer } =
              this.$store.state.networks[this.$store.state.currentNetwork];

            if (tx.trx) {
              if (tx.trx.receipt.events) {
                rawEvents = tx.trx.receipt.events;
                recordId = tx.trx.transaction.id;
                txOrBlockLink = `${explorer.tx}/${recordId}`;
                txOrBlockText = this.getTruncatedTransactionId(recordId);
              }
            } else if (tx.block) {
              if (tx.block.receipt.events) {
                rawEvents = tx.block.receipt.events;
                recordId = tx.block.header.height;
                txOrBlockLink = `${explorer.block}/${recordId}`;
                txOrBlockText = `Block ${recordId}`;
              }
            }

            const eventsProcessed = await Promise.all(
              rawEvents.map(async (e) => {
                const token = this.coins.find(
                  (t) =>
                    t.contractId === e.source && t.network === this.networkTag
                );
                if (
                  !token ||
                  !["transfer_event", "mint_event", "burn_event"].find((name) =>
                    e.name.includes(name)
                  )
                ) {
                  return {};
                }
                if (!e.data) return {};

                const abiEvents = {};
                abiEvents[e.name] = {
                  argument: e.name
                    // from "koinos.contracts.token.transfer_event" get "transfer_event"
                    .slice(e.name.lastIndexOf(".") + 1)
                    // replace to "transfer_arguments"
                    .replace("_event", "_arguments"),
                };
                const contract = new Contract({
                  id: e.source,
                  abi: {
                    ...utils.tokenAbi,
                    events: abiEvents,
                  },
                  serializer: this.serializer,
                });

                const { args } = await contract.decodeEvent(e);
                if (args.to !== this.address && args.from !== this.address) {
                  return {};
                }

                let amountFloat =
                  Number(args.value) / Math.pow(10, token.decimals);
                const type = args.to === this.address ? "receive" : "send";
                let summary = "";
                if (e.name.includes("transfer")) {
                  if (type === "receive")
                    summary = `From ${this.truncateAddress(args.from)}`;
                  else summary = `To ${this.truncateAddress(args.to)}`;
                } else if (e.name.includes("burn")) {
                  summary = "Burn";
                } else if (e.name.includes("mint")) {
                  summary = "Mint";
                }

                return {
                  ...e,
                  txId: recordId,
                  args,
                  token,
                  type,
                  amountFormatted: amountFloat.toFixed(2),
                  summary,
                  txOrBlockLink,
                  txOrBlockText,
                };
              })
            );
            events.push(...eventsProcessed.filter((e) => !!e.source));
          })
        );

        this.filteredEvents = events;
      } catch (err) {
        this.activityError = `Failed to fetch account history: ${err.message}`;
        console.error("Error fetching account history:", err);
      } finally {
        this.loadingActivity = false;
      }
    },

    async setActiveTab(tab) {
      this.activeTab = tab;
      if (tab === "activity") {
        await this.fetchTokenPrices();
        await this.fetchAccountHistory();
      } else if (tab === "coins") {
        await this.refreshCoins();
      } else {
        await this.fetchData();
      }
    },

    truncateDescription(description) {
      if (!description) return "No description";
      return description.length > 30
        ? description.slice(0, 30) + "..."
        : description;
    },

    calculateUsdValue(coin) {
      console.log(`Calculating USD value for ${coin.symbol}`);
      console.log(`Coin data:`, coin);
      console.log(`Token prices:`, this.tokenPrices);

      const price = this.tokenPrices[coin.symbol];
      console.log(`Price for ${coin.symbol}:`, price);

      if (!price || price === "N/A") {
        console.log(`No price available for ${coin.symbol}`);
        return "N/A";
      }

      const balance = parseFloat(coin.balance);
      console.log(`Parsed balance for ${coin.symbol}:`, balance);

      if (isNaN(balance)) {
        console.log(`Invalid balance for ${coin.symbol}`);
        return "N/A";
      }

      const usdValue = (balance * price).toFixed(2);
      console.log(`Calculated USD value for ${coin.symbol}:`, usdValue);

      return usdValue;
    },

    openTransactionUrl(url) {
      window.open(url, "_blank");
    },

    formatPrice(price) {
      if (!price) return "N/A";
      return price.toFixed(4);
    },

    async refreshPrices() {
      this.isLoadingPrices = true;
      await this.fetchTokenPrices();
      this.isLoadingPrices = false;
      console.log("Updated token prices:", this.tokenPrices);
    },

    convertIPFSUrl(url) {
      if (!url) return url;
      if (url.startsWith("ipfs://")) {
        // Replace ipfs:// with the ipfs.io gateway
        return url.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return url;
    },

    handleImageError(e) {
      console.log("Image failed to load:", e.target.src);
      // Optionally set a fallback image
      // e.target.src = 'path/to/fallback/image.png';
    },

    handleImageLoad(e) {
      console.log("Image loaded successfully:", e.target.src);
    },
  },
};
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

.coin-price {
  font-size: 0.8em;
  color: #888;
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

.token-price {
  font-size: 0.8em;
  color: #888;
  margin-left: 10px;
}

.loading-price {
  font-size: 0.8em;
  color: #888;
}

.ellipsis {
  display: inline-block;
  width: 12px;
  text-align: left;
}

.ellipsis::after {
  content: "...";
  display: inline-block;
  animation: ellipsis 1.5s infinite;
  width: 0;
  overflow: hidden;
}

@keyframes ellipsis {
  0% {
    width: 0;
  }
  25% {
    width: 3px;
  }
  50% {
    width: 6px;
  }
  75% {
    width: 9px;
  }
  100% {
    width: 12px;
  }
}

.skeleton-loader {
  display: inline-block;
  background: linear-gradient(90deg, #2c2c2c 25%, #3a3a3a 50%, #2c2c2c 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.price-skeleton {
  width: 60px;
  height: 14px;
}

.value-skeleton {
  width: 80px;
  height: 16px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.token-price-skeleton {
  width: 60px;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}
.testnet-message {
  text-align: center;
  padding: 20px;
  color: var(--primary-gray);
  background-color: #252525;
  border-radius: 12px;
  margin: 10px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
