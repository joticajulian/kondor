<template>
  <div class="dropdown-container">
    <div class="link-item">
      <div>
        <div class="current-account">
          {{ currentAccount }}
        </div>
        <div class="address-container">
          <div class="current-address">
            {{ currentAddress }}
          </div>
          <button
            title="copy address"
            @click="copyAddress()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="12"
              viewBox="0 96 960 960"
              width="12"
            >
              <path
                d="M180 975q-24 0-42-18t-18-42V312h60v603h474v60H180Zm120-120q-24 0-42-18t-18-42V235q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440V235H300v560Zm0 0V235v560Z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div
        class="link"
        @click="toggleDropdown()"
      >
        <svg
          width="20"
          height="20"
          version="1.1"
          viewBox="0 0 1200 1200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path
              d="m720 180c0 66.273-53.727 120-120 120s-120-53.727-120-120 53.727-120 120-120 120 53.727 120 120"
            />
            <path
              d="m720 1020c0 66.273-53.727 120-120 120s-120-53.727-120-120 53.727-120 120-120 120 53.727 120 120"
            />
            <path
              d="m720 600c0 66.273-53.727 120-120 120s-120-53.727-120-120 53.727-120 120-120 120 53.727 120 120"
            />
          </g>
        </svg>
      </div>
    </div>

    <div
      v-if="showDropdown"
      class="dropdown-content"
    >
      <div class="dropdown-info">
        <span class="heading">Available accounts</span>
      </div>
      <div
        v-for="(account, index) in $store.state.accounts"
        :key="index"
        class="dropdown-item"
      >
        <div @click="selectAccount(index)">
          <span>{{ account.name }}</span>
          <div class="address">
            {{ account.address }}
          </div>
        </div>
      </div>
      <div
        disabled
        class="separator"
      />
      <div v-if="$store.state.mnemonic0">
        <div
          class="dropdown-item"
          @click="createAccount"
        >
          + Create account
        </div>
      </div>
      <div v-else>
        <div
          class="dropdown-item"
          @click="addSeed"
        >
          + Add seed to wallet
        </div>
      </div>
      <div
        class="dropdown-item"
        @click="importAccount"
      >
        + Import account
      </div>
    </div>
  </div>
</template>

<script>
import router from "@/index/router";

export default {
  data() {
    return {
      currentAccount: "",
      currentAddress: "",
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
      this.currentAddress = this.$store.state.accounts[index].address;
    },

    createAccount() {
      router.push("/createAccount");
    },

    importAccount() {
      router.push("/importAccount");
    },

    addSeed() {
      router.push("/generateSeed?privateKeyExist=true");
    },

    copyAddress() {
      navigator.clipboard.writeText(this.currentAddress);
    },
  },
};
</script>

<style scoped>
.dropdown-container {
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
  left: 0;
  border: none;
  position: absolute;
  width: var(--app-width);
  margin-top: 6em;
  height: 60%;
  background: var(--primary-color);
  z-index: 10;
  overflow-y: scroll;
  height: 79%;
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
  color: #000;
  display: flex;
  justify-content: space-between;
  padding: 0 2em;
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
.address-container {
  display: flex;
  align-items: center;
}
.address-container button {
  all: unset;
  cursor: pointer;
}
.address-container svg {
  margin-left: 0.5em;
}
</style>
