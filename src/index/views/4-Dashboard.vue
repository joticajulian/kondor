<template>
  <div class="container">
    <div class="column">
      <div class="info container">
        <div class="address-container">
          <span>{{ address }}</span>
          <router-link to="/signers" class="signers">Signers</router-link>
        </div>
        <div class="balance">
          <div class="heading"></div>
          <div class="amount">
            <div class="balance">{{ balanceFormatted }}</div>
            <div class="tkoin">(t)KOIN</div>
          </div>
        </div>
      </div>
      <div class="transfer container">
        <label>Send to address</label>
        <input
          v-model="toAddress"
          type="text"
          placeholder="Enter address to send to ..."
        />
        <label>Send to amount</label>
        <input
          @keyup.enter="transfer"
          v-model="amount"
          type="text"
          placeholder="Enter amount to send ..."
        />
        <button @click="transfer" class="">transfer</button>
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

export default {
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
    };
  },

  mixins: [Storage, Sandbox, ViewHelper],

  mounted() {
    this.loadAccount(this.$store.state.currentIndexAccount);
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
  },

  methods: {
    async loadAccount(index) {
      try {
        const rpcNodes = await this._getRpcNodes();
        this.provider = new Provider(rpcNodes);
        const currentAccount = this.$store.state.accounts[index];
        this.signer = Signer.fromWif(currentAccount.privateKey, true);
        this.signer.provider = this.provider;
        this.address = this.signer.getAddress();

        this.koinContract = new Contract({
          id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
          abi: utils.tokenAbi,
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
        const blockNumber = await transaction.wait();
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
  computed: {
    balanceFormatted() {
      return this.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
};
</script>
<style scoped>
label {
  width: 100%;
  margin-left: -2em;
}
input {
  background: rgb(226 183 236 / 20%);
  border: none;
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
  font-weight: 100;
  font-size: 2.5rem;
}
.amount {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-weight: 100;
  margin: 1em 0;
}
.heading {
  font-size: 0.8em;
}
.info {
  text-transform: none;
  font-weight: 400;
}
.tkoin {
  font-size: 0.5em;
}
.signers {
  font-size: 0.8em;
  padding-left: 0.7em;
}
.transfer {
  margin-bottom: 3em;
}
.address-container {
  font-weight: 400;
}
</style>
