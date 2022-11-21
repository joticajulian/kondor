<template>
  <div class="dropdown-container">
    <div>
      <div class="link-item">
        <div>
          <div class="current-account">{{ currentAccount }}</div>
          <div class="current-address">
            {{ currentAddress }}
          </div>
        </div>
        <div @click="toggleDropdown()" class="link">
          <svg
            width="23"
            height="4"
            viewBox="0 0 23 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2.85486" cy="2" r="2" fill="#514E54" />
            <circle cx="10.8549" cy="2" r="2" fill="#514E54" />
            <circle cx="18.8549" cy="2" r="2" fill="#514E54" />
          </svg>
        </div>
      </div>
    </div>

    <div v-if="showDropdown" class="dropdown-content">
      <div class="dropdown-info">
        <span class="heading">Available accounts</span>
      </div>
      <div
        class="dropdown-item"
        v-for="(account, index) in $store.state.accounts"
        :key="index"
      >
        <div @click="selectAccount(index)">
          <span>{{ account.name }}</span>
          <div class="address">{{ account.address }}</div>
        </div>
      </div>
      <div disabled class="separator"></div>
      <div v-if="$store.state.mnemonic">
        <div @click="createAccount" class="dropdown-item">+ Create account</div>
      </div>
      <div v-else>
        <div @click="addSeed" class="dropdown-item">+ Add seed to wallet</div>
      </div>
      <div class="dropdown-item">+ Import account</div>
      <router-link to="/signers" class="signer-links dropdown-item"
        >+ Signers</router-link
      >
    </div>
  </div>
</template>

<script>
import router from "@/index/router"

export default {
  data() {
    return {
      currentAccount: "",
      currentAddress: "",
      showDropdown: false,
    }
  },
  mounted() {
    this.loadAccount()
  },

  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },

    selectAccount(index) {
      this.$store.state.currentIndexAccount = index
      this.showDropdown = false
      this.loadAccount()
    },

    loadAccount() {
      if (this.$store.state.accounts.length === 0) return
      const index = this.$store.state.currentIndexAccount
      this.currentAccount = this.$store.state.accounts[index].name
      this.currentAddress = this.$store.state.accounts[index].address
    },

    createAccount() {
      router.push("/createAccount")
    },

    addSeed() {
      router.push("/generateSeed?privateKeyExist=true")
    },
  },
}
</script>

<style scoped>
.dropdown-container {
  display: flex;
  justify-content: center;
  padding: 2em 0 0 0;
  color: var(--kondor-purple);
}
.dropdown-container .link {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5em 0;
  border-radius: 0.5em;
  background-color: var(--kondor-dark);
  color: var(--kondor-light);
}
.dropdown-content,
.dropdown-content:hover {
  min-width: 160px;
  box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%);
  top: 48px;
  right: 0;
  border: none;
  position: absolute;
  width: 100%;
  margin-top: 6em;
  height: 100vh;
  background: var(--primary-color);
  z-index: 10;
}

.dropdown-item {
  float: none;
  padding: 1em 3em;
  text-decoration: none;
  display: block;
  text-align: left;
  border: none;
  cursor: pointer;
  margin-top: 0.5em;
}

.dropdown-item:hover {
  color: var(--kondor-light);
  background-color: var(--kondor-purple);
  font-weight: 700;
}

.separator {
  margin-top: 8px;
  border-top: 1px solid #666;
  padding: 0;
  height: 1em;
}
.link,
.link:hover {
  display: flex;
  flex-direction: row;
  border: none;
  color: var(--kondor-light);
  font-size: 1.2em;
}
.link-item {
  text-transform: capitalize;
  font-weight: 500;
  font-size: 1.2em;
  cursor: pointer;
  color: #000;
  width: 88vw;
  display: flex;
  justify-content: space-between;
}
.address {
  font-size: 0.6em;
  color: white;
}
.current-address {
  font-size: 0.6em;
  font-weight: 600;
  color: #c8c1d1;
}
current-account {
  font-size: 1.2em;
}
.dropdown-info {
  padding: 1.2em 1em;
}
.heading {
  font-size: 1.2em;
  font-weight: 600;
}
.signer-links {
  color: var(--kondor-purple);
  text-decoration: none;
}
</style>
