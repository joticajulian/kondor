<template>
  <div class="nft-list">
    <div
      v-if="loading"
      class="loading"
    >
      Loading NFTs...
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <div
      v-else-if="!nfts || nfts.length === 0"
      class="no-nfts"
    >
      No NFTs found for this address on Kollection.
    </div>
    <div
      v-else
      class="nft-column"
    >
      <div
        v-for="nft in nfts"
        :key="nft.token_id"
        class="nft-item"
        @click="goToCollection"
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
    <div class="debug-info">
      <h4>Debug Info:</h4>
      <p>Address: {{ address }}</p>
      <p>NFTs: {{ debugNFTs }}</p>
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error }}</p>
      <p>API Response: {{ apiResponse }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NFTList",
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      nfts: null,
      loading: true,
      error: null,
      apiResponse: null,
    };
  },
  computed: {
    debugNFTs() {
      if (!this.nfts) return "undefined";
      if (this.nfts.length === 0) return "Empty array";
      return `Array with ${this.nfts.length} items`;
    },
  },
  watch: {
    address: {
      immediate: true,
      handler: "fetchNFTs",
    },
  },
  mounted() {
    console.log("NFTList component mounted");
    this.fetchNFTs();
  },
  methods: {
    async fetchNFTs() {
      console.log("Fetching NFTs for address:", this.address);
      this.loading = true;
      this.error = null;
      this.nfts = null;
      this.apiResponse = null;

      try {
        const response = await axios.get(
          `https://kollection.app/api/v1/nfts_by_owner/${this.address}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        console.log("API Response:", response.data);
        this.apiResponse = JSON.stringify(response.data, null, 2);

        if (Array.isArray(response.data)) {
          this.nfts = response.data;
        } else {
          console.error("Unexpected API response format:", response.data);
          this.error = "Unexpected API response format";
        }
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        this.error = `Failed to fetch NFTs: ${err.message}`;
      } finally {
        this.loading = false;
      }
    },
    goToCollection() {
      window.open(`https://kollection.app/profile/${this.address}`, "_blank");
    },
  },
};
</script>

<style scoped>
/* ... (previous styles remain unchanged) ... */

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #333;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-all;
}

.debug-info h4 {
  margin-top: 0;
}
</style>
