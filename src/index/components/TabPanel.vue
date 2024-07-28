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
        <div
          v-else-if="!nfts || nfts.length === 0"
          class="no-nfts"
        >
          No NFTs found for this address
        </div>
        <div
          v-else
          class="nft-grid"
        >
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
                {{ nft.metadata ? (nft.metadata.name || 'Untitled') : 'Untitled' }}
              </h3>
              <p class="nft-description">
                {{ nft.metadata ? (truncateDescription(nft.metadata.description) || 'No description') : 'No description' }}
              </p>
              <!-- <button><a href="https://kollection.app/assets/1Cs4tVzdRZZ4DPYEHpiULe4VMemjiK6p1Y/0x3632">View on Kollection</a></button> -->
            </div>
          </div>
          <div class="kollection-link">
            <a
              :href="kollectionProfileUrl"
              target="_blank"
              rel="noopener noreferrer"
            >View on Kollection</a>
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
    }
  },

  computed: {
    kollectionProfileUrl() {
      return `https://kollection.app/profile/${this.address}`
    },
  },

  watch: {
    address: 'fetchNFTs',
    activeTab: 'fetchNFTs'
  },

  mounted() {
    this.fetchNFTs()
  },

  methods: {
    async fetchNFTs() {
      if (this.activeTab !== 'nfts' || !this.address) return

      this.loading = true
      this.error = null
      this.nfts = null

      try {
        const response = await axios.get(`https://kollection.app/api/v1/nfts_by_owner/${this.address}`, {
          headers: {
            'Accept': 'application/json',
          },
        })

        if (response.data && Array.isArray(response.data.data)) {
          this.nfts = response.data.data
          console.log('NFTs loaded:', this.nfts)
        } else {
          this.error = 'Unexpected API response structure'
          console.error('API response:', response.data)
        }

        if (this.nfts && this.nfts.length === 0) {
          this.error = 'No NFTs found for this address'
        }
      } catch (err) {
        this.error = `Failed to fetch NFTs: ${err.message}`
        console.error('Error fetching NFTs:', err)
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
    truncateDescription(description) {
      if (!description) return 'No description'
      return description.length > 30 ? description.slice(0, 30) + '...' : description
    }
  }
}
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

.nft-collection {
  margin: 5px 0 0;
  font-size: 12px;
  color: #777777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading, .error-message, .no-nfts {
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
}
.kollection-link a, .kollection-link a:visited {
  color: var(--primary-light);
  text-decoration: none;
}
</style>