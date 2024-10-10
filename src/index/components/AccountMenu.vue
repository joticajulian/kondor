<template>
  <div class="dropdown-container">
    <div class="link-item">
      <div class="row">
        <div
          class="current-account"
          @click="copyAddress"
        >
          {{ currentAccount }}
          <div class="tooltip">
            <span>{{ tooltipMessage }}</span> <br>
            {{ currentAddress }}
          </div>
        </div>
        <!-- <div class="edit-icon">
          <img
          src="../../../public/images/edit.svg"
          alt="edit account icon"
          class="dropdown-icon"
        >
        </div> -->
      </div>
      <button
        class="menu-toggle dropdown-icon"
        @click="openDropdown()"
      >
        <img
          src="../../../public/images/ellipsis-vertical-light.svg"
          alt="edit account icon"
        >
      </button>
    </div>

    <div
      v-if="showDropdown"
      class="dropdown-content"
    >
      <router-link
        class="options-item"
        :to="{ path: '/updateAccount', query: { address: currentAddress } }"
      >
        <img
          src="../../../public/images/icon-edit.png"
          alt=""
        >
        Update account
      </router-link>
      <a
        class="options-item"
        :href="koinosblocksUrl + currentAddress"
        target="_blank"
      >
        <img
          src="../../../public/images/icon-link.png"
          alt="link icon"
        >
        View on KoinosBlocks
      </a>
      <a
        class="options-item"
        :href="'https://koiner.app/addresses/' + currentAddress"
        target="_blank"
      >
        <img
          src="../../../public/images/icon-link.png"
          alt="link icon"
        >
        View on Koiner
      </a>
      <a
        class="options-item"
        href="https://koinosbox.com/nicknames"
        target="_blank"
      >
        <img
          src="../../../public/images/icon-link.png"
          alt="link icon"
        > Edit
        Nickname
      </a>
      <div>
        <a
          class="options-item"
          href="https://kap.domains/account"
          target="_blank"
        >
          <img
            src="../../../public/images/icon-link.png"
            alt="link icon"
          >
          <span>Edit KAP Profile</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tooltipMessage: "Click to copy",
      currentAccount: "",
      currentAddress: "",
      koinosblocksUrl: "https://koinosblocks.com/address/",
      showDropdown: false,
    };
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadAccount();
    },
    "$store.state.currentNetwork": function () {
      this.updateLinks();
    },
  },

  mounted() {
    this.loadAccount();
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

    loadAccount() {
      if (this.$store.state.accounts.length === 0) return;
      const index = this.$store.state.currentIndexAccount;
      this.currentAccount = this.$store.state.accounts[index].name;
      this.currentAddress = this.$store.state.accounts[index].address;
    },

    updateLinks() {
      if (
        this.$store.state.networks[this.$store.state.currentNetwork].tag ===
        "harbinger"
      ) {
        this.koinosblocksUrl = "https://harbinger.koinosblocks.com/address/";
      } else {
        this.koinosblocksUrl = "https://koinosblocks.com/address/";
      }
    },

    copyAddress() {
      navigator.clipboard.writeText(this.currentAddress);
      this.tooltipMessage = "Copied!";
      setTimeout(() => {
        this.tooltipMessage = "Click to copy";
      }, 2000);
    },
  },
};
</script>

<style scoped>
.dropdown-content {
  top: 70px;
  left: 0;
  width: 100%;
  margin: 0 1em;
  border: none;
  width: calc(var(--app-width) - 2em);
  position: absolute;
  background: var(--primary-darker);
  z-index: 10;
  padding: 0.5em 0;
  border: 1px solid rgb(25 25 25);
  border-radius: 0.5em;
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
  background: var(--primary-dark-light);
  color: var(--kondor-light);
}

a,
a:visited {
  color: var(--primary-light) !important;
  font-size: 1em;
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
  border-radius: 0.5em;
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
  background-color: transparent;
  color: var(--kondor-light);
  border-color: var(--kondor-light);
}
.heading {
  font-size: 1.2em;
  font-weight: 600;
}
.menu-toggle {
  border: none;
  margin: 0;
  width: auto;
  background: none;
  color: var(--primary-light);
}
.link-item {
  text-transform: capitalize;
  font-weight: 500;
  font-size: 1.2em;
  display: flex;
  justify-content: space-between;
  padding-left: 1em;
  align-items: center;
}
.current-account {
  font-size: 1em;
  cursor: pointer;
  position: relative;
}

.current-account .tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 0.3em;
  transform: translateX(-50%);
  background-color: var(--primary-darker);
  color: var(--primary-light);
  text-align: center;
  padding: 1em 2em;
  border-radius: 4px;
  font-size: 0.8em;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.7s, visibility 0.3s;
}
.tooltip span {
  font-size: 0.8em;
  color: var(--primary-gray);
}

.current-account:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.address-container {
  display: flex;
  align-items: center;
  cursor: default;
}
.address-container button {
  border: none;
  margin: 0;
  width: auto;
  background: var(--primary-light);
  color: var(--primary-darker);
  padding: 0;
  margin-left: 0.5em;
}
.address-container button span {
  font-size: 1em;
}
.dropdown-icon {
  width: 0.3em;
  cursor: pointer;
}
.row {
  display: flex;
  align-items: center;
}
.edit-icon {
  cursor: pointer;
  padding-right: 1em;
}
</style>
