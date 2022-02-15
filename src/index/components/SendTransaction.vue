<template>
  <div>
    <div>Signature request</div>
    <div>{{ requester }}</div>
    <div>{{ data }}</div>
    <div v-if="!unlocked">
      <Unlock
        @onUnlock="unlocked = true"
        @onError="alertDanger($event.message)"
      />
    </div>
    <button @click="sign" :disabled="!unlocked">Sign</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
import { Signer, Contract, Provider, utils } from "koilib";
import Unlock from "@/index/components/Unlock.vue";
import AlertHelper from "@/shared/mixins/AlertHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";
import Message from "@/shared/mixins/Message";

export default {
  name: "Send transaction",
  data: function () {
    return {
      data: "",
      requester: "",
      id: -1,
      unlocked: !!this.$store.state.privateKey,
      numErrors: 0,
    };
  },

  mixins: [Storage, Sandbox, AlertHelper, Message],

  components: { Unlock },

  mounted() {
    const requests = this.$store.state.requests.filter(
      (r) => r.command === "signer:sendTransaction"
    );
    /**
     * TODO: for several requests create a list of requesters
     * and ask to the user to select one to see the details
     */
    const [request] = requests;
    this.decodeTransaction(request);
  },

  methods: {
    async decodeTransaction(request) {
      const signer = Signer.fromSeed("");
      signer.serializer = await this.newSandboxSerializer(utils.ProtocolTypes, {
        defaultTypeName: "active_transaction_data",
        bytesConversion: false,
      });
      const active = await signer.decodeTransaction(request.args.tx);
      const decodedOperations = [];
      for (let i = 0; i < active.operations.length; i += 1) {
        const op = active.operations[i];
        if (!op.call_contract) {
          // upload contract or set system call don't
          // require an extra decode
          decodedOperations.push(op);
          return;
        }
        const contractId = utils.encodeBase58(op.call_contract.contract_id);
        const abi = request.args.abis[contractId];
        const contract = new Contract({
          id: contractId,
          abi,
          serializer: await this.newSandboxSerializer(abi.types),
        });
        const { name, args } = await contract.decodeOperation(op);
        decodedOperations.push({
          call_contract: { contractId, name, args },
        });
      }

      this.data = JSON.stringify(decodedOperations, null, 2);
      this.requester = request.sender.origin;
      this.id = request.id;
      // TODO: check nonce and limit mana
    },

    async sign() {
      const requests = this.$store.state.requests.filter(
        (r) =>
          r.command === "signer:sendTransaction" &&
          r.id === this.id &&
          r.sender.origin === this.requester
      );
      const [request] = requests;
      // TODO: throw error if there are requests.length > 1
      const rpcNode = await this.getRpcNode();
      const provider = new Provider([rpcNode]);
      provider.onError = () => {
        this.numErrors += 1;
        return this.numErrors > 20;
      };
      const signer = Signer.fromWif(this.$store.state.privateKey);
      signer.provider = provider;
      signer.serializer = await this.newSandboxSerializer(utils.ProtocolTypes, {
        defaultTypeName: "active_transaction_data",
        bytesConversion: false,
      });
      let message = { id: request.id };
      try {
        const { operations } = await signer.decodeTransaction(request.args.tx);
        const tx = await signer.encodeTransaction({
          operations,
          rc_limit: 1e8,
        });
        const transaction = await signer.sendTransaction(tx);
        message.result = transaction;
      } catch (err) {
        message.error = err;
      }
      this.messenger.sendResponse("extension", message, request.sender);
    },

    cancel() {
      console.log("cancel not implemented");
    },
  },
};
</script>
