<template>
  <div>
    <button @click="toggleDropdown()" class="link">
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
      <div disabled class="separator"></div>
      <div v-if="$store.state.mnemonic">
        <div @click="createAccount" class="dropdown-item">+ Create account</div>
      </div>
      <div v-else>
        <div @click="addSeed" class="dropdown-item">+ Add seed to wallet</div>
      </div>
      <div class="dropdown-item">+ Import account</div>
    </div>
  </div>
</template>

<script>
import router from "@/index/router";

export default {
  data() {
    return {
      currentAccount: "",
      showDropdown: false,
    };
  },

  mounted() {
    this.loadAccount();
  },

  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    selectAccount(index) {
      this.$store.state.currentIndexAccount = index;
      this.showDropdown = false;
      this.loadAccount();
    },

    loadAccount() {
      if (this.$store.state.accounts.length === 0) return;
      const index = this.$store.state.currentIndexAccount;
      this.currentAccount = this.$store.state.accounts[index].name;
    },

    createAccount() {
      router.push("/createAccount");
    },

    addSeed() {
      router.push("/generateSeed?privateKeyExist=true");
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

.separator {
  margin-top: 8px;
  border-top: 1px solid #666;
  padding: 0;
}
</style>
