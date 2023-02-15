<template>
  <div class="container">
    <div class="column">
      <div class="info container">
        <div class="balance">
          <div class="heading">
            KOIN
          </div>
          <div class="amount">
            <div
              class="balance"
              :data-tooltip="satoshis"
            >
              {{ balanceFormatted }}
            </div>
            <!-- <div>
              <router-link to="/signers" class="signer-links"
                >Signers</router-link
              >
            </div> -->
          </div>
        </div>
        <!-- <div class="recharge-bar" :class="timeRechargeMana != 0 ? red : green"></div> -->
        <div class="mana-container">
          <div class="recharge-container">
            <div class="mana-title">
              MANA
            </div>
            <div class="recharge-time">
              {{ timeRechargeMana }}
            </div>
          </div>
          <div class="mana-info">
            <div class="title-gray">
              Available
            </div>
            <div class="mana-available">
              {{ mana }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!watchMode"
        class="transfer container"
      >
        <label>Send to address</label>
        <input
          v-model="toAddress"
          type="text"
        >
        <label>Send to amount</label>
        <input
          v-model="amount"
          type="text"
          @keyup.enter="transfer"
        >
        <button
          class=""
          @click="transfer"
        >
          transfer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Contract, Provider, Signer, utils } from "koilib";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

const CHAIN_ID_TESTNET = "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==";
const CHAIN_ID_MAINNET = "EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==";
const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000

function deltaTimeToString(milliseconds) {
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

  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      address: "loading ",
      balance: "loading...",
      signer: null,
      provider: null,
      koinContract: null,
      koin: null,
      toAddress: "",
      amount: "",
      intervalMana: null,
      mana: "",
      lastUpdateMana: 0,
      timeRechargeMana: "",
      watchMode: false,
    };
  },
  computed: {
    balanceFormatted() {
      const balanceNumber = Number(this.balance);
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
  },

  mounted() {
    this.loadAccount(this.$store.state.currentIndexAccount);
  },

  methods: {
    async loadAccount(index) {
      try {
        /**
         * Temporal solution to be able to load the balance
         * and make transfers in testnet
         * TODO: Define networks
         */
        let chainId = await this._getChainId(false);
        if (!chainId) {
          chainId = await this.provider.getChainId();
          await this._setChainId(chainId);
        }

        let koinContractId;
        if (chainId === CHAIN_ID_MAINNET) {
          koinContractId = "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL";
          this.$store.state.network = "Koinos Mainnet";
        } else if (chainId === CHAIN_ID_TESTNET) {
          koinContractId = "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ";
          this.$store.state.network = "Koinos Testnet";
        } else {
          koinContractId = "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL";
          this.$store.state.network = "Unknown network";
        }

        const rpcNodes = await this._getRpcNodes();
        this.provider = new Provider(rpcNodes);
        const currentAccount = this.$store.state.accounts[index];
        this.address = currentAccount.address;
        this.signer = undefined;
        if (currentAccount.privateKey) {
          this.signer = Signer.fromWif(currentAccount.privateKey, true);
          this.signer.provider = this.provider;
        } else {
          this.watchMode = true;
        }

        this.koinContract = new Contract({
          id: koinContractId,
          abi: utils.tokenAbi,
          provider: this.provider,
          signer: this.signer,
          serializer: await this.newSandboxSerializer(
            utils.tokenAbi.koilib_types
          ),
        });
        this.koinContract.abi.methods.balanceOf.preformat_argument = (
          owner
        ) => ({
          owner,
        });
        this.koinContract.abi.methods.balanceOf.preformat_return = (res) =>
          utils.formatUnits(res.value, 8);
        this.koinContract.abi.methods.transfer.preformat_argument = (
          input
        ) => ({
          from: this.address,
          to: input.to,
          value: utils.parseUnits(input.value, 8),
        });
        this.koin = this.koinContract.functions;
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
      await this.loadBalance();
    },
    async loadBalance() {
      try {
        const { result } = await this.koin.balanceOf(this.address);
        this.balance = result.toLocaleString("en");

        const balance = Number(this.balance);
        const rc = await this.provider.getAccountRc(this.address);
        const initialMana = Number(rc) / 1e8;
        this.mana = initialMana;
        this.lastUpdateMana = Date.now();
        this.timeRechargeMana = deltaTimeToString(
          ((balance - this.mana) * FIVE_DAYS) / balance
        );

        clearInterval(this.intervalMana);
        this.intervalMana = setInterval(() => {
          const delta = Math.min(Date.now() - this.lastUpdateMana, FIVE_DAYS);
          const manaUpdated = initialMana + (delta * balance) / FIVE_DAYS;
          this.mana = Math.min(manaUpdated, balance);
          this.timeRechargeMana = deltaTimeToString(
            ((balance - this.mana) * FIVE_DAYS) / balance
          );
        }, 1000);
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
    async transfer() {
      let interval;
      try {
        let chainId = await this._getChainId(false);
        if (!chainId) {
          chainId = await this.provider.getChainId();
          await this._setChainId(chainId);
        }

        if (!utils.isChecksumAddress(this.toAddress)) {
          throw new Error(`${this.toAddress} is an invalid address`);
        }

        const { transaction, receipt } = await this.koin.transfer(
          {
            to: this.toAddress,
            value: this.amount,
          },
          { chainId }
        );
        this.alertSuccess("Sent. Waiting to be mined ...");
        console.log(`Transaction id ${transaction.id} submitted. Receipt:`);
        console.log(receipt);
        if (receipt.logs) throw new Error(`Error: ${receipt.logs.join(", ")}`);
        interval = setInterval(() => {
          console.log("firing interval");
          this.loadBalance();
        }, 2000);
        const { blockNumber } = await transaction.wait();
        clearInterval(interval);
        console.log("block number " + blockNumber);
        this.alertSuccess(`Sent. Transaction mined in block ${blockNumber}`);
        this.toAddress = "";
        this.amount = "";
      } catch (error) {
        clearInterval(interval);
        this.alertDanger(error.message);
        throw error;
      }
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
  margin-top: 3em;
}
input {
  margin: 1em 0;
}
.balance {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-size: 1.5em;
  font-weight: bold;
}
.amount {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-weight: 100;
  margin: 0.3em 0 1em 0;
}
.heading {
  font-size: 0.7em;
  font-weight: 300;
}
.info {
  text-transform: none;
  font-weight: 400;
  color: #000;
  width: 100vw;
}
.tkoin {
  font-size: 0.7em;
  color: rgb(91, 91, 91);
}
.signer-links {
  font-size: 0.5em;
  color: var(--kondor-purple);
  font-weight: 500;
  margin-top: 0.4em;
  text-decoration: underline;
}
.transfer {
  margin-bottom: 3em;
}
.address-container {
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 1em;
}
.addr {
  font-size: 0.9em;
  margin-bottom: 0.5em;
}
.addr-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mana {
  font-size: 0.8em;
  font-weight: 400;
  display: flex;
  flex-direction: row;
}
.mana-container {
  display: flex;
  width: 88vw;
  justify-content: space-between;
  align-items: flex-start;
}
.mana-info {
  text-align: right;
}
.mana-title {
  font-weight: 700;
}
.mana-available {
  font-size: 1.2em;
  font-weight: 400;
}
.title-gray {
  font-size: 0.8em;
  color: var(--kondor-lighter);
}
.recharge-container {
  margin-bottom: 2em;
}
.recharge-bar {
  width: 88vw;
  height: 0.4em;
  background-color: rgb(15, 201, 142);
  color: white;
  font-size: 0.5em;
}
.recharge-time {
  font-weight: 400;
  color: var(--kondor-lighter);
}
.green {
  background-color: rgb(15, 201, 142);
}
.red {
  background-color: rgb(223, 57, 57);
}
/* TOOLTIP */
/* Add this attribute to the element that needs a tooltip */
[data-tooltip] {
  position: relative;
  z-index: 2;
  cursor: pointer;
}

/* Hide the tooltip content by default */
[data-tooltip]:before,
[data-tooltip]:after {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

/* Position tooltip above the element */
[data-tooltip]:before {
  position: absolute;
  bottom: 115%;
  left: 50%;
  margin-bottom: 5px;
  margin-left: -90px;
  padding: 7px;
  width: 160px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
  background-color: var(--kondor-purple);
  color: #fff;
  content: attr(data-tooltip);
  text-align: center;
  font-size: 14px;
  line-height: 1.2;
}

/* Show tooltip content on hover */
[data-tooltip]:hover:before,
[data-tooltip]:hover:after {
  visibility: visible;
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
  filter: progid: DXImageTransform.Microsoft.Alpha(Opacity=100);
  opacity: 1;
}
</style>
