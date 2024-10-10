<template>
  <div class="receive-koin">
    <!-- <div class="header">
      <h1>Receive Koin</h1>
    </div> -->

    <div class="middle">
      <div class="qr-code">
        <qrcode-vue
          :value="currentAddress"
          :size="200"
          level="H"
        />
      </div>

      <div class="account-info">
        <span class="account-label">{{ currentAddress }}</span>
        <span
          class="copy-icon"
          @click="copyAddress"
        >
          <img
            src="../../../../public/images/copy-icon.svg"
            alt="Copy address"
            title="Copy address"
          >
        </span>
      </div>

      <p class="info-text">
        This address can only be used to receive compatible tokens.
      </p>
    </div>

    <button
      class="custom-button secondary"
      @click="close"
    >
      Close
    </button>
  </div>
</template>

<script>
import { mapState } from "vuex";
import QrcodeVue from "qrcode.vue";

export default {
  name: "ReceiveKoin",
  components: {
    QrcodeVue,
  },
  data() {
    return {
      currentAddress: "",
    };
  },
  computed: {
    ...mapState(["accounts", "currentIndexAccount"]),
  },
  mounted() {
    this.getCurrentAddress();
  },
  methods: {
    getCurrentAddress() {
      const currentAccount = this.accounts[this.currentIndexAccount];
      if (currentAccount) {
        this.currentAddress = currentAccount.address;
      }
    },
    copyAddress() {
      if (this.currentAddress) {
        navigator.clipboard
          .writeText(this.currentAddress)
          .then(() => {
            this.$store.dispatch("setAlert", {
              show: true,
              type: "success",
              message: "Address copied to clipboard",
            });
          })
          .catch((err) => {
            console.error("Failed to copy address: ", err);
            this.$store.dispatch("setAlert", {
              show: true,
              type: "error",
              message: "Failed to copy address",
            });
          });
      }
    },
    close() {
      this.$router.push({ name: "Dashboard" });
    },
  },
};
</script>

<style scoped>
.receive-koin {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  padding: 2em;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

h1 {
  margin: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 24px;
  color: var(--kondor-light);
}

.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qr-code {
  margin-bottom: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
}

.account-info {
  background-color: #181818;
  padding: 1em;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 82%;
  color: var(--primary-gray);
  margin-bottom: 20px;
}

.account-label {
  font-size: 0.8em;
  word-break: break-all;
  margin-right: 10px;
}

.copy-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.copy-icon img {
  width: 20px;
  height: 20px;
}

.info-text {
  color: #888;
  font-size: 12px;
  text-align: center;
  width: 100%;
  margin: 0;
}
</style>
