<template>
  <div class="dropdown-container">
    <button
      class="avatar-menu"
      @click="openDropdown()"
    >
      <img
        :src="avatar"
        alt="identicon for selected address"
      >
    </button>

    <div
      v-if="showDropdown"
      class="dropdown-content"
    >
      <div class="dropdown-info">
        <span class="heading">My accounts</span>
        <button @click="lock()">
          Lock
        </button>
      </div>

      <hr>

      <div class="account-list">
        <div
          v-for="(account, index) in $store.state.accounts"
          :key="index"
          class="dropdown-item"
          @click="selectAccount(index)"
        >
          <span
            :style="
              $store.state.currentIndexAccount === index
                ? 'visibility: visible;'
                : 'visibility: hidden;'
            "
            class="material-icons"
          >
            check
          </span>
          <div>
            <span>{{ account.name }}</span>
            <span class="address">
              {{ account.address }}
            </span>
          </div>
        </div>
      </div>

      <hr>

      <div v-if="$store.state.mnemonic0">
        <div
          class="dropdown-item"
          @click="createAccount"
        >
          <span class="material-icons">add</span> Create account
        </div>
      </div>
      <div v-else>
        <div
          class="dropdown-item"
          @click="addSeed"
        >
          <span class="material-icons">add</span> Add seed to wallet
        </div>
      </div>
      <div
        class="dropdown-item"
        @click="importAccount"
      >
        <span class="material-icons">file_download</span> Import account
      </div>

      <hr>

      <div
        class="dropdown-item"
        @click="openOptions"
      >
        <span class="material-icons">settings</span> Settings
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
import router from "@/index/router";
import { createAvatar } from "@dicebear/avatars";
import * as identiconStyle from "@dicebear/avatars-identicon-sprites";

// mixins
import Storage from "@/shared/mixins/Storage";

export default {
  mixins: [Storage],

  data() {
    return {
      showDropdown: false,
    };
  },

  computed: {
    avatar() {
      const account =
        this.$store.state.accounts[this.$store.state.currentIndexAccount];
      if (!account || !account.address) return "";
      const identicon = createAvatar(identiconStyle, {
        seed: account.address,
        dataUri: true,
      });
      return identicon;
    },
  },

  methods: {
    openDropdown() {
      if (!this.showDropdown) {
        this.showDropdown = true;
        setTimeout(() => {
          window.addEventListener("click", this.closeDropdown);
        }, 0);
      }
    },

    closeDropdown(e) {
      if (
        typeof e === "undefined" ||
        (this.$el.querySelector(".dropdown-content") &&
          !this.$el.querySelector(".dropdown-content").contains(e.target))
      ) {
        this.showDropdown = false;
        window.removeEventListener("click", this.closeDropdown);
      }
    },

    selectAccount(index) {
      this.$store.state.currentIndexAccount = index;
      this.closeDropdown();
    },

    createAccount() {
      router.push("/createAccount");
      this.closeDropdown();
    },

    importAccount() {
      router.push("/importAccount");
      this.closeDropdown();
    },

    addSeed() {
      router.push("/generateSeed?privateKeyExist=true");
      this.closeDropdown();
    },

    openOptions() {
      chrome.runtime.openOptionsPage();
      this.closeDropdown();
    },

    async lock() {
      await this._removePasswordsFromSession();
      router.push("/");
      this.closeDropdown();
    },
  },
};
</script>

<style scoped>
.dropdown-content {
  box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%);
  top: 80px;
  left: 0;
  width: 100%;
  margin: 0 1em;
  border: none;
  width: calc(var(--app-width) - 2em);
  border-radius: 22px;
  position: absolute;
  background: white;
  color: black;
  z-index: 10;
  padding: 0.5em 0;
}

.dropdown-item {
  float: none;
  padding: 0.7em 2em;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5em;
  text-align: left;
  border: none;
  cursor: pointer;
  font-size: 1.3em;
}

.dropdown-item:hover {
  background-color: var(--kondor-purple);
  color: white;
}

hr {
  border-top: 1px solid #ddd;
}

.address {
  font-size: 0.7em;
  margin-top: 0.1em;
}

.dropdown-info {
  padding: 0 2em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dropdown-info > button {
  width: auto;
  border-radius: 22px;
  color: var(--kondor-purple);
  border-color: var(--kondor-purple);
  background-color: transparent;
}

.heading {
  font-size: 1.2em;
  font-weight: 600;
}

.avatar-menu {
  width: 45px;
  height: 45px;
  border: 1px solid white;
  border-radius: 50%;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: white;
}

.account-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
