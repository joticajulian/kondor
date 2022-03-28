<template>
  <div class="container">
    <div class="column">
      <div class="info container">
        <span>{{ address }}</span>
        <div>Balance {{ balance }} tKoin</div>
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
      numErrors: 0,
      toAddress: "",
      amount: "",
    };
  },

  mixins: [Storage, Sandbox, AlertHelper],

  mounted() {
    (async () => {
      try {
        const rpcNode = await this.getRpcNode();
        this.provider = new Provider([rpcNode]);
        this.provider.onError = () => {
          this.numErrors += 1;
          return this.numErrors > 20;
        };

        this.signer = Signer.fromWif(this.$store.state.privateKey);
        this.signer.provider = this.provider;
        this.signer.serializer = await this.newSandboxSerializer(
          utils.ProtocolTypes,
          {
            defaultTypeName: "active_transaction_data",
            bytesConversion: false,
          }
        );
        this.address = this.signer.getAddress();

        this.koinContract = new Contract({
          id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
          abi: utils.Krc20Abi,
          signer: this.signer,
          serializer: await this.newSandboxSerializer(utils.Krc20Abi.types),
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
        this.balance = result;
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
    async transfer() {
      let interval;
      try {
        const { transaction } = await this.koin.transfer({
          to: this.toAddress,
          value: this.amount,
        });
        this.alertSuccess("Sent. Waiting to be mined ...");
        console.log(`Transaction id ${transaction.id} submitted`);
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
  margin: 2em 0;
}
</style>
