<template>
  <div>
    <span>{{address}}</span>
    <div>Balance {{balance}}</div>
  </div>
</template>

<script>
import { Contract, Provider, Signer, utils } from 'koilib'
import Storage from '@/mixins/Storage'
import Sandbox from '@/mixins/Sandbox'

export default {
  data() {
    return {
      address: 'loading ',
      balance: 'loading...',
      signer: null,
      provider: null,
      koinSerializer: null,
      koinContract: null,
      koin: null,
    }
  },

  mixins: [Storage, Sandbox],

  mounted() {
    (async () => {
      const rpcNode = await this.getRpcNode();
      this.provider = new Provider([rpcNode]);
      this.signer = Signer.fromWif(this.$store.state.privateKey);
      this.signer.provider = this.provider;
      this.signer.serializer = {
        serialize: async (...args) => {
          return this.sendSandbox("serializeTx", args);
        },
        deserialize: async (...args) => {
          return this.sendSandbox("deserializeTx", args);
        },
      }
      this.koinSerializer = {
        serialize: async (...args) => {
          return this.sendSandbox("serialize", args);
        },
        deserialize: async (...args) => {
          return this.sendSandbox("deserialize", args);
        },  
      }
      await this.sendSandbox("setTypes", utils.Krc20Abi.types);
      this.koinContract = new Contract({
        id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
        abi: utils.Krc20Abi,
        signer: this.signer,
        serializer: this.koinSerializer,
      });
      this.koinContract.abi.methods.balanceOf.preformatInput = (owner) =>
        ({ owner });
      this.koinContract.abi.methods.balanceOf.preformatOutput = (res) =>
        utils.formatUnits(res.value, 8);
      this.koinContract.abi.methods.transfer.preformatInput = (input) => ({
        from: this.signer.getAddress(),
        to: input.to,
        value: utils.parseUnits(input.value, 8),
      });
      this.koin = this.koinContract.functions;
      this.address = this.signer.getAddress();
      await this.loadBalance();
    })()
  },

  methods: {
    async loadBalance() {
      const { result } = await this.koin.balanceOf(this.address);
      this.balance = result;
    }
  }
}
</script>