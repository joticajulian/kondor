<template>
  <div>
    <div class="tabs">
      <a
        :class="activeTab === 'tokens' ? 'active' : ''"
        @click="setActiveTab('tokens')"
      >Tokens</a>
      <a
        :class="activeTab === 'nfts' ? 'active' : ''"
        @click="setActiveTab('nfts')"
      >NFTs</a>
      <a
        :class="activeTab === 'activity' ? 'active' : ''"
        @click="setActiveTab('activity')"
      >Activity</a>
    </div>
    <div class="panel">
      <div v-if="activeTab === 'tokens'">
        Coming soon
      </div>
      <div v-else-if="activeTab === 'nfts'">
        <a
          :href="'https://kollection.app/profile/' + address"
          target="_blank"
        >View account on Kollection
          <span class="material-icons">open_in_new</span></a>
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
      activeTab: "tokens",
    };
  },

  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
  },
};
</script>
<style scoped>
.tabs {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  border-bottom: 1px solid #ddd;
}

.tabs > a {
  flex: 1;
  text-align: center;
  padding: 1em;
  border-bottom: 2px solid white;
}

.tabs > a.active {
  color: var(--kondor-purple);
  border-color: var(--kondor-purple);
}

.panel {
  margin: 1em 2em;
}

.panel .material-icons {
  font-size: 1.2em;
  vertical-align: text-bottom;
}
</style>
