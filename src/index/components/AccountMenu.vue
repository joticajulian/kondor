<template>
  <div>
    <button v-if="$store.state.showAccountMenu" @click="toggleDropdown()">
      {{ currentAccount }}
    </button>
    <div v-if="showDropdown" class="dropdown-content">
      <div
        class="dropdown-item"
        v-for="(account, index) in $store.state.accounts"
        :key="index"
      >
        <div @click="selectAccount(index)">{{ account.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentAccount: "",
      showDropdown: false,
    };
  },

  created() {
    if (this.$store.state.accounts.length > 0) {
      this.currentAccount = this.$store.state.accounts[0].name;
    }
  },

  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    selectAccount(index) {
      this.$store.state.currentIndexAccount = index;
    },
  },
};
</script>

<style scoped>
.dropdown-content,
.dropdown-content:hover {
  float: left;
  overflow: hidden;
  position: absolute;
  min-width: 160px;
  background-color: var(--kondor-light);
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  top: 48px;
  right: 0px;
  border: none;
}

.dropdown-item {
  float: none;
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  border: none;
}

.dropdown-item:hover {
  background: var(--primary-color);
}
</style>
