<template>
  <div class="wallet-balance">
    <h1 class="balance">
      ${{ totalBalance }}
    </h1>
    <p class="mana tooltip">
      Mana {{ manaPercent }}%
      <span class="tooltiptext">
        {{ liquidKoin }} <br>
        Liquid KOIN
      </span>
    </p>
    <div class="action-buttons">
      <button
        class="action-button send"
        @click="navigateToSendToken"
      >
        <span class="">
          <img
            src="../../../public/images/Paper_Plane.svg"
            alt=""
          >
        </span>
        Send
      </button>
      <button
        class="action-button receive"
        @click="navigateToReceiveToken"
      >
        <span class="">
          <img
            src="../../../public/images/Download.svg"
            alt=""
          >
        </span>
        Receive
      </button>
      <button
        class="action-button add-token"
        @click="navigateToAddToken"
      >
        <span class="icon">+</span>
        Add Token
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "WalletBalance",

  props: {
    balance: {
      type: String,
      required: true,
    },
    manaPercentage: {
      type: Number,
      required: true,
    },
    liquidKoin: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapState(["totalBalance"]),
    manaPercent() {
      return this.manaPercentage.toFixed(2);
    },
  },

  methods: {
    navigateToSendToken(tokenId = "") {
      this.$router.push({
        name: "Send Token",
        params: { tokenId: tokenId },
      });
    },
    navigateToReceiveToken(tokenId = "") {
      this.$router.push({
        name: "Receive Token",
        params: { tokenId: tokenId },
      });
    },
    navigateToAddToken() {
      this.$router.push({
        name: "Add Token",
      });
    },
  },
};
</script>

<style scoped>
.wallet-balance {
  padding: 0em 1.5em;
  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.balance {
  font-size: 3.5em;
  margin: 0;
  padding: 10px 0;
  font-weight: 600;
}

.mana {
  background-color: #2a2a2a;
  color: var(--primary-gray);
  display: inline-block;
  padding: 0.3em 1em;
  border-radius: 1.5em;
  font-size: 0.9em;
  margin: 10px 0;
  position: relative;
  cursor: help;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 9em;
  background-color: var(--primary-darker);
  color: var(--primary-light);
  text-align: center;
  border-radius: 6px;
  padding: 1em;
  position: absolute;
  z-index: 1;
  top: 125%;
  left: 75%;
  margin-left: -80px;
  opacity: 0;
  transition: opacity 1s;
  cursor: default;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #111 transparent;
  cursor: default;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
  cursor: default;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 1em;
}

.action-button {
  background-color: #2a2a2a;
  border: none;
  color: var(--kondor-light);
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
}

.action-button .icon {
  font-size: 20px;
  margin-bottom: 5px;
  font-weight: lighter;
}

.send .icon {
  transform: rotate(-45deg);
}

.receive .icon {
  color: #8b8bff;
}

.more {
  font-weight: bold;
  color: var(--primary-gray);
}
</style>
