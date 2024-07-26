<template>
  <div class="bottom">
    <div class="debug-info">
      <p>TabPanel Address Prop: {{ address }}</p>
    </div>
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
          alt="Manage tokens"
        >
      </div>
    </div>
    <div class="panel">
      <div v-if="activeTab === 'nfts'">
        <h2>NFTs Tab Content</h2>
        <div v-if="loading">
          Loading NFTs...
        </div>
        <div
          v-else-if="error"
          class="error-message"
        >
          Error: {{ error }}
          <br>
          <small>Please check the console for more details.</small>
        </div>
        <div v-else-if="!nfts || nfts.length === 0">
          No NFTs found for this address
        </div>
        <div v-else>
          <div
            v-for="nft in nfts"
            :key="nft.token_id"
            class="nft-item"
          >
            <img
              :src="nft.image_url"
              :alt="nft.name"
              class="nft-image"
            >
            <div class="nft-info">
              <h3>{{ nft.name }}</h3>
              <p>{{ nft.collection_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    address: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      activeTab: 'nfts',
      nfts: null,
      loading: false,
      error: null,
      cryptoList: [
        {
          symbol: "KOIN",
          name: "Koinos",
          balance: 200,
          usd: 299,
        },
        // ... other crypto items ...
      ]
    }
  },

  watch: {
    address: 'fetchNFTs',
    activeTab: 'fetchNFTs'
  },

  mounted() {
    console.log('TabPanel mounted. Address:', this.address)
    this.fetchNFTs()
  },

  methods: {
    async fetchNFTs() {
      if (this.activeTab !== 'nfts' || !this.address) return

      console.log('Fetching NFTs for address:', this.address)
      this.loading = true
      this.error = null
      this.nfts = null

      try {
        const response = await axios.get(`https://kollection.app/api/v1/nfts_by_owner/${this.address}`, {
          headers: {
            'Accept': 'application/json',
          },
        })
        console.log('API Response:', JSON.stringify(response.data, null, 2))

        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.data)) {
            this.nfts = response.data.data
          } else if (Array.isArray(response.data)) {
            this.nfts = response.data
          } else {
            this.error = 'Unexpected API response structure'
            console.error('API response structure:', response.data)
          }
        } else {
          this.error = 'Invalid API response'
          console.error('Invalid API response:', response.data)
        }

        if (this.nfts && this.nfts.length === 0) {
          this.error = 'No NFTs found for this address'
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err)
        this.error = `Failed to fetch NFTs: ${err.message}`
      } finally {
        this.loading = false
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab
      if (tab === 'nfts') {
        this.fetchNFTs()
      }
    },

    goToCollection(nft) {
      window.open(`https://kollection.app/profile/${this.address}`, '_blank')
    }
  }
}
</script>

<style scoped>
.bottom {
  background: #222222;
  color: #ffffff;
  padding: 20px;
}

.debug-info {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.tabs-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
}

.tabs a {
  color: #ffffff;
  padding: 10px 20px;
  text-decoration: none;
  cursor: pointer;
}

.tabs a.active {
  background-color: #444444;
  border-radius: 5px;
}

.panel {
  background-color: #333333;
  padding: 20px;
  border-radius: 5px;
}
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

.nft-column {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.nft-item {
  width: calc(50% - 0.5rem);
  background-color: #2a2a2a;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.nft-item:hover {
  transform: scale(1.05);
}

.nft-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.nft-info {
  padding: 0.5rem;
}

.nft-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #fff;
}

.nft-info p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: #777;
}

.loading, .error, .no-nfts {
  text-align: center;
  padding: 1rem;
  color: #777;
}
</style>
