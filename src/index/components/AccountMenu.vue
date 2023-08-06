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
          <div :data-tooltip="msgCopy">
            <button @click="copyAddress()">
              <span class="material-icons">content_copy</span>
            </button>
          </div>
        </div>
      </div>
      <button
        class="menu-toggle"
        @click="openDropdown()"
      >
        <span class="material-icons">more_vert</span>
      </button>
    </div>

    <div
      v-if="showDropdown"
      class="dropdown-content"
    >
      <a
        class="dropdown-item"
        :href="koinosblocksUrl + currentAddress"
        target="_blank"
      >
        <span class="material-icons">open_in_new</span>View account on Koinos
        Blocks
      </a>
      <a
        class="dropdown-item"
        :href="'https://koiner.app/addresses/' + currentAddress"
        target="_blank"
      >
        <span class="material-icons">open_in_new</span>View account on Koiner
      </a>
      <a
        class="dropdown-item"
        href="https://kap.domains/account"
        target="_blank"
      >
        <span class="material-icons">edit</span>Edit KAP Profile
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msgCopy: "copy address",
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
      this.msgCopy = "copied!";
      setTimeout(() => {
        this.msgCopy = "copy address";
      }, 2000);
    },
  },
};
</script>

<style scoped>
.dropdown-container {
  padding: 2em 0;
  border-bottom: 1px solid #ddd;
}
.dropdown-content {
  box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%);
  top: 150px;
  width: calc(var(--app-width) - 100px - 1em);
  left: 100px;
  border: none;
  border-radius: 22px;
  position: absolute;
  background: white;
  z-index: 10;
  padding: 0.5em 0;
  overflow: hidden;
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
}

.dropdown-item:hover {
  background-color: var(--kondor-purple);
  color: white;
  opacity: 1;
}

.separator {
  margin-top: 1em;
  border-top: 1px solid #666;
  padding: 0;
  height: 1em;
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
  color: white;
  border-color: white;
}
.heading {
  font-size: 1.2em;
  font-weight: 600;
}
.menu-toggle {
  border: none;
  margin: 0;
  width: auto;
  background: #fff;
  color: #000;
  padding-right: 0;
}
.link-item {
  text-transform: capitalize;
  font-weight: 500;
  font-size: 1.2em;
  color: #000;
  display: flex;
  justify-content: space-between;
  padding: 0 2em;
  align-items: center;
}
.current-address {
  font-size: 0.7em;
  font-weight: 300;
}
.current-account {
  font-size: 1.2em;
  cursor: default;
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
  background: #fff;
  color: #000;
  padding: 0;
  margin-left: 0.5em;
}
.address-container button span {
  font-size: 1em;
}
</style>
