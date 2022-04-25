<template>
  <div class="container">
    <div class="column">
      <div class="info container">
        <span>{{ address }}</span>
        <div class="balance">
          <div class="heading"></div>
          <div class="amount">
            <div class="balance">{{ balance }}</div>
            <div class="tkoin">(t)KOIN</div>
          </div>
        </div>
      </div>
      <div class="transfer container">
        <input v-model="toAddress" type="text" placeholder="To address" />
        <input v-model="amount" type="text" placeholder="Amount" />
        <button @click="transfer" class="link">transfer</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Contract, Provider, Signer, utils } from "koilib";
import AlertHelper from "@/shared/mixins/AlertHelper";
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

  mixins: [Storage, Sandbox, AlertHelper],

  mounted() {
    (async () => {
      try {
        const rpcNodes = await this._getRpcNodes();
        this.provider = new Provider(rpcNodes);

        this.signer = Signer.fromWif(this.$store.state.privateKey, true);
        this.signer.provider = this.provider;
        this.address = this.signer.getAddress();

        this.koinContract = new Contract({
          id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
          abi: utils.tokenAbi,
          signer: this.signer,
          serializer: await this.newSandboxSerializer(utils.tokenAbi.types),
        });
        this.koinContract.abi.methods.balanceOf.preformatInput = (owner) => ({
          owner,
        });
        this.koinContract.abi.methods.balanceOf.preformatOutput = (res) =>
          utils.formatUnits(res.value, 8);
        this.koinContract.abi.methods.transfer.preformatInput = (input) => ({
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
    })();
  },

  methods: {
    async loadBalance() {
      try {
        const { result } = await this.koin.balanceOf(this.address);
        this.balance = result.toLocaleString('en');
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
}
.amount {
  font-size: 2em;
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
  font-weight: 300;
}
.tkoin {
  font-size: 0.5em;
}
.balance {
  font-weight: 100;
  font-size: 1.5em;
}
</style>
