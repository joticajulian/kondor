<template>
  <div>
    <span>{{ address }}</span>
    <div>Balance {{ balance }} tKoin</div>
    <input v-model="toAddress" type="text" placeholder="To address" />
    <input v-model="amount" type="text" placeholder="Amount" />
    <button @click="transfer">Transfer</button>
  </div>
</template>

<script>
import { Contract, Provider, Signer, utils } from "koilib";
import AlertHelper from "@/mixins/AlertHelper";
import Storage from "@/mixins/Storage";
import Sandbox from "@/mixins/Sandbox";

export default {
  data() {
    return {
      address: "loading ",
      balance: "loading...",
      signer: null,
      provider: null,
      koinSerializer: null,
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
        this.signer.serializer = {
          serialize: async (...args) => {
            return this.sendSandbox("serializeTx", args);
          },
          deserialize: async (...args) => {
            return this.sendSandbox("deserializeTx", args);
          },
        };
        this.koinSerializer = {
          serialize: async (...args) => {
            return this.sendSandbox("serialize", args);
          },
          deserialize: async (...args) => {
            return this.sendSandbox("deserialize", args);
          },
        };
        await this.sendSandbox("setTypes", utils.Krc20Abi.types);
        this.koinContract = new Contract({
          id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
          abi: utils.Krc20Abi,
          signer: this.signer,
          serializer: this.koinSerializer,
        });
        this.koinContract.abi.methods.balanceOf.preformatInput = (owner) => ({
          owner,
        });
        this.koinContract.abi.methods.balanceOf.preformatOutput = (res) =>
          utils.formatUnits(res.value, 8);
        this.koinContract.abi.methods.transfer.preformatInput = (input) => ({
          from: this.signer.getAddress(),
          to: input.to,
          value: utils.parseUnits(input.value, 8),
        });
        this.koin = this.koinContract.functions;
        this.address = this.signer.getAddress();
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
        const { transaction, transactionResponse } = await this.koin.transfer({
          to: this.toAddress,
          value: this.amount,
        });
        this.alertSuccess("Sent. Waiting to be mined ...");
        console.log(`Transaction id ${transaction.id} submitted`);
        interval = setInterval(() => {
          console.log("firing interval");
          this.loadBalance();
        }, 2000);
        const blockNumber = await transactionResponse.wait("byBlock");
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
