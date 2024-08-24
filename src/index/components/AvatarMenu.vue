<template>
  <div class="dropdown-container">
    <div
      class="avatar-menu"
      @click="openDropdown()"
    >
      <img
        :src="avatar"
        alt="identicon for selected address"
      >
    </div>
    <div
      class="dropdown-wrapper"
      :class="{ show: showDropdown }"
    >
      <div class="dropdown-content">
        <div>
          <div class="dropdown-info">
            <span class="heading">My accounts</span>
            <button
              class="chip"
              @click="lock()"
            >
              <img
                src="../../../public/images/lock.svg"
                alt=""
              >
            </button>
          </div>

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
                class="selected-indicator"
              />
              <div class="account-item">
                <span>{{ account.name }}</span>
                <span class="address">
                  {{ account.address }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="option">
          <div v-if="$store.state.mnemonic0">
            <div
              class="options-item"
              @click="createAccount"
            >
              <img
                src="../../../public/images/icon-add.png"
                alt="create account icon"
              >
              Create account
            </div>
          </div>
          <div v-else>
            <div
              class="options-item"
              @click="addSeed"
            >
              <img
                src="../../../public/images/icon-add.png"
                alt="add seed icon"
              >
              Add seed to wallet
            </div>
          </div>
          <div
            class="options-item"
            @click="importAccount"
          >
            <img
              src="../../../public/images/icon-import.png"
              alt=""
            > Import
            account
          </div>

          <div
            class="options-item"
            @click="openOptions"
          >
            <img
              src="../../../public/images/icon-settings-wrench.png"
              alt=""
            >
            Settings
          </div>
        </div>
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
      console.log("openDropdown called"); // Add this line
      if (!this.showDropdown) {
        this.showDropdown = true;
        document.body.style.overflow = "hidden";
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

    async selectAccount(index) {
      this.$store.state.currentIndexAccount = index;
      await this._setCurrentIndexAccount(index);
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
/* dropdown wrapper */
.dropdown-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.8s ease;
}

.dropdown-wrapper.show {
  opacity: 1;
  visibility: visible;
}

.dropdown-content {
  position: fixed;
  top: 0;
  left: -100%;
  width: calc(var(--app-width) - 2em);
  height: 100%;
  background: #111;
  z-index: 10;
  padding: 0.5em 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: left 0.8s ease;
}

.dropdown-wrapper.show .dropdown-content {
  left: 0;
}

.dropdown-content {
  top: 42px;
  left: 0;
  /* width: 100%; */
  /* margin: 0 1em; */
  border: none;
  width: calc(var(--app-width) - 2em);
  position: absolute;
  background: #111;
  z-index: 10;
  padding: 0.5em 0;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dropdown-item {
  float: none;
  padding: 0.3em 2em;
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
  background: #353535;
  color: white;
}

button {
  border: none !important;
  background: none !important;
  padding: 0 !important;
}

.address {
  font-size: 0.6em;
  margin-top: 0.1em;
  color: #777777;
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
  border: 1px solid white;
  background-color: gray;
}

.dropdown-info > button img {
  width: 1em;
}

.heading {
  font-size: 1.2em;
  font-weight: 600;
}

.avatar-menu {
  width: 18px;
  height: 18px;
  overflow: hidden;
  cursor: pointer;
}

.account-list {
  max-height: 200px;
  overflow-y: auto;
}
.selected-indicator {
  width: 12px;
  height: 12px;
  border-radius: 999%;
  background-color: var(--kondor-purple);
}
.account-item {
  display: flex;
  flex-direction: column;
  margin-left: 0.5em;
}
.option {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-top: 2em;
  margin-bottom: 1em;
}
.options-item {
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 1em;
  font-weight: 500;
  margin: 0 1.2em;
  align-items: center;
  justify-content: flex-start;
}
.options-item:hover {
  background: var(--primary-dark);
  border-radius: .5em;
  cursor: pointer;
}
.chip {
  background-color: #2a2a2a;
  padding: 0.5em 1em !important;
  color: #777;
  padding: 10px;
  border-radius: 2em;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 0.8em;
  cursor: pointer !important;
}
</style>
