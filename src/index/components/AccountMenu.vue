<template>
  <div class="dropdown-container">
    <div @click="toggleDropdown()" class="link">
      <div class="link-item">
        {{ currentAccount }}
      </div>
    </div>

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
.dropdown-container {
  display: flex;
  justify-content: center;
  padding: 2em 0;
}
.dropdown-content,
.dropdown-content:hover {
  min-width: 160px;
  color: var(--kondor-light);
  box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%);
  top: 48px;
  right: 0;
  border: none;
  position: absolute;
  width: 100%;
  margin-top: 4em;
  height: 100vh;
  background: var(--secondary-color);
}

.dropdown-item {
  float: none;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  border: none;
  padding-left: 2em;
}

.dropdown-item:hover {
  background: var(--primary-color);
  color: var(--secondary-color);
}

.separator {
  margin-top: 8px;
  border-top: 1px solid #666;
  padding: 0;
}
.link,
.link:hover {
  display: flex;
  flex-direction: row;
  border: none;
}
.link-item {
  padding-right: 1em;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 1.2em;
  cursor: pointer;
}
</style>
