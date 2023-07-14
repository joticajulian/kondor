<template>
  <div class="column">
    <div class="row">
      <div class="amount">
        <div
          :data-tooltip="satoshis"
        >
          <span class="balance">{{ balanceFormatted }}</span> <span class="koin-label">KOIN</span>
        </div>
        <div class="usd">
          {{ balanceUSD }}
        </div>
      </div>
      <ManaOrb 
        :mana-percent="manaPercent" 
        :time-recharge="timeRechargeMana" 
      />
    </div>
    <div
      v-if="!watchMode"
      class="actions container"
    >
      <button
        @click="clickBuy()"
      >
        <span class="material-icons">add</span><span>Buy</span>
      </button>
      <button
        :disabled="!(balance > 0)"
        @click="clickSend()"
      >
        <span class="material-icons">arrow_outward</span><span>Send</span>
      </button>
      <button
        disabled
        @click="clickSwap()"
      >
        <span class="material-icons">swap_horiz</span><span>Swap</span>
      </button>
    </div>
    <TabPanel :address="address" />
  </div>
</template>

<script>
import axios from "axios";
import router from "@/index/router";
import { Contract, Provider, Signer, utils } from "koilib";
import ManaOrb from "../components/ManaOrb.vue";
import TabPanel from "../components/TabPanel.vue";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000

function deltaTimeToString(milliseconds) {
  if (Number.isNaN(milliseconds)) return "";

  var seconds = Math.floor(milliseconds / 1000);

  var interval = seconds / 86400;
  if (interval > 2) return Math.floor(interval) + " days";

  interval = seconds / 3600;
  if (interval > 2) return Math.floor(interval) + " hours";

  interval = seconds / 60;
  if (interval > 2) return Math.floor(interval) + " minutes";

  interval = Math.floor(seconds);
  if (interval === 0) return "Mana recharged";
  return interval + " seconds";
}

export default {
  components: { ManaOrb, TabPanel },
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      address: "loading ",
      balance: "loading...",
      balanceUSD: "$0 USD",
      signer: null,
      provider: null,
      koinContract: null,
      koin: null,
      toAddress: "",
      amount: "",
      intervalMana: null,
      mana: "",
      lastUpdateMana: 0,
      timeRechargeMana: "loading...",
      watchMode: false,
      manaPercent: 1
    };
  },
  computed: {
    balanceFormatted() {
      const balanceNumber = Number(this.balance) || 0;
      // return this.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "")
      return balanceNumber.toLocaleString("en");
    },
    satoshis() {
      return this.balance;
    },
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
    "$store.state.currentNetwork": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
  },

  mounted() {
    this.loadAccount(this.$store.state.currentIndexAccount);
  },

  methods: {
    async loadAccount(index) {
      if (this.$store.state.accounts.length === 0) return;
      try {
        this.$store.state.networks = await this._getNetworks();
        const currentTag = await this._getCurrentNetwork();
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        );
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork];
        this.provider = new Provider(this.network.rpcNodes);
        const currentAccount = this.$store.state.accounts[index];
        this.address = currentAccount.address;
        this.signer = undefined;
        if (currentAccount.privateKey) {
          this.signer = Signer.fromWif(currentAccount.privateKey, true);
          this.signer.provider = this.provider;
          this.watchMode = false;
        } else {
          this.watchMode = true;
        }

        this.koinContract = new Contract({
          id: this.network.koinContractId,
          abi: utils.tokenAbi,
          provider: this.provider,
          signer: this.signer,
          serializer: await this.newSandboxSerializer(
            utils.tokenAbi.koilib_types
          ),
        });
        this.koin = this.koinContract.functions;
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
      await this.loadBalance();
    },

    async loadBalanceInUsd() {
      if (this.network.tag !== "mainnet") {
        this.balanceUSD = "$0 USD";
        return;
      }

      try {
        const response = await axios.get(
          "https://www.mexc.com/open/api/v2/market/ticker?symbol=koin_usdt"
        );
        const price = Number(response.data.data[0].last);
        const balanceKoin = Number(this.balance);
        const balanceUSD = balanceKoin * price;
        this.balanceUSD = `$${balanceUSD.toFixed(2)} USD`;
      } catch (error) {
        console.error("Error when loading price from MEXC");
        console.error(error);
        this.balanceUSD = "Error";
      }
    },

    async loadBalance() {
      try {
        const { result } = await this.koin.balanceOf({ owner: this.address });
        this.balance = utils.formatUnits(result.value, 8).toLocaleString("en");

        this.loadBalanceInUsd();

        const balance = Number(this.balance);
        const rc = await this.provider.getAccountRc(this.address);
        const initialMana = Number(rc) / 1e8;
        this.mana = Number(initialMana.toFixed(8));
        this.lastUpdateMana = Date.now();
        this.timeRechargeMana = deltaTimeToString(
          ((balance - this.mana) * FIVE_DAYS) / balance
        );
        this.manaPercent = Math.floor(this.mana / balance * 100);

        clearInterval(this.intervalMana);
        this.intervalMana = setInterval(() => {
          const delta = Math.min(Date.now() - this.lastUpdateMana, FIVE_DAYS);
          let mana = initialMana + (delta * balance) / FIVE_DAYS;
          mana = Math.min(mana, balance);
          this.timeRechargeMana = deltaTimeToString(
            ((balance - mana) * FIVE_DAYS) / balance
          );
          this.mana = Number(mana.toFixed(8));
          this.manaPercent = Math.floor(this.mana / balance * 100);
        }, 1000);
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    clickBuy() {
      router.push('/buy');
    },

    clickSend() {
      router.push('/send');
    },

    clickSwap() {
      router.push('/swap');
    },
  },
};
</script>
<style scoped>
label {
  width: 100%;
  margin-left: -2em;
  text-align: left;
}
.column {
  display: flex;
  flex-direction: column;
  margin-top: 2em;
  width: 100%;
}
.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 2em;
}
input {
  margin: 1em 0;
}
.balance {
  font-size: 2.5em;
  font-weight: bold;
  cursor: default;
}
.usd, .koin-label {
  font-weight: 300;
  cursor: default;
}
.actions {
  margin-top: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}

.actions > button {
  background: white;
  color: var(--kondor-purple);
  border: 0;
  display: flex;
  flex-direction: column;
  width: auto;
}

.actions > button > .material-icons {
  background: var(--kondor-purple);
  color: white;
  padding: 0.3em;
  border-radius: 50%;
}

.actions > button:disabled {
  background: white;
  color: #999;
}
.actions > button:disabled > .material-icons {
  background: #999;
}
</style>
