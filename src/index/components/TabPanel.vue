<template>
  <div class="bottom">
    <div class="tabs-container">
      <div class="tabs">
        <a
          :class="activeTab === 'coins' ? 'active' : ''"
          @click="setActiveTab('coins')"
        >Coins</a>
        <a
          :class="activeTab === 'nfts' ? 'active' : ''"
          @click="setActiveTab('nfts')"
        >NFTs</a>
        <a
          :class="activeTab === 'activity' ? 'active' : ''"
          @click="setActiveTab('activity')"
        >Activity</a>
      </div>
      <div class="manage-tokens">
        <img
          src="../../../public/images/manage-tokens.svg"
          alt=""
        >
      </div>
    </div>
    <div class="panel">
      <div v-if="activeTab === 'coins'">
        <div
          v-for="crypto in cryptoList"
          :key="crypto.symbol"
          class="crypto-list"
        >
          <div class="crypto-item">
            <div class="crypto-icon">
              <img
                src="../../../public/images/koinos logo.svg"
                alt=""
              >
            </div>
            <div class="crypto-info">
              <div class="crypto-main">
                <span class="crypto-symbol">{{ crypto.symbol }}</span>
                <span class="crypto-name">{{ crypto.name }}</span>
              </div>
              <div class="crypto-values">
                <span class="crypto-balance">{{ crypto.balance }}</span>
                <span class="crypto-usd">{{ crypto.usd }} USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'nfts'">
        list
      </div>
      <div v-else>
        Coming soon
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    address: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      activeTab: "nfts",
      cryptoList: [
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
      ],
    }
  },

  methods: {
    setActiveTab(tab) {
      this.activeTab = tab
    },
  },
}
</script>
<style scoped>
.bottom {
  background: #222222;
  color: #ffffff;
}
.tabs {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  width: 100%;
}

.tabs > a {
  flex: 1;
  text-align: center;
  padding: 1em;
}

.tabs > a.active {
  color: var(--primary-light);
}
.tabs-container {
  display: flex;
  align-items: center;
  padding: 0 1em;
  gap: 8em;
}
.manage-tokens {
  width: 2em;
  padding-right: 1em;
}
.panel {
  margin: 1em 2em;
}

.panel .material-icons {
  font-size: 1.2em;
  vertical-align: text-bottom;
}
a,
a:visited {
  color: #777777;
}

.crypto-item {
  display: flex;
  align-items: center;
  background-color: #2a2a2a;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
  height: 4.5em;
}

.crypto-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 20px;
}

.crypto-info {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
}

.crypto-main,
.crypto-values {
  display: flex;
  flex-direction: column;
}

.crypto-symbol {
  color: #fff;
  font-family: Poppins;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.02rem;
}

.crypto-name,
.crypto-usd {
  color: #777;
  text-align: right;
  font-family: Poppins;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.015rem;
}
.crypto-balance {
  color: #fff;
  text-align: right;
  font-family: Poppins;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.02rem;
}
</style>
