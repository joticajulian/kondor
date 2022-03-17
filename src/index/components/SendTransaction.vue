<template>
  <div>
    <div>Signature request</div>
    <div>{{ requester.origin }}</div>
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
    this.requester = request.sender;
    this.id = request.id;
    this.decodeTransaction(request);
  },

  methods: {
    async decodeTransaction(request) {
      const { operations } = request.args.tx;
      const decodedOperations = [];
      for (let i = 0; i < operations.length; i += 1) {
        const op = operations[i];
        if (!op.call_contract) {
          // upload contract or set system call don't
          // require an extra decode
          decodedOperations.push(op);
          return;
        }
        const contractId = op.call_contract.contract_id;
        const abi = request.args.abis[contractId];
        const contract = new Contract({
          id: contractId,
          abi,
          serializer: await this.newSandboxSerializer(abi.types),
        });
        const { name, args } = await contract.decodeOperation({
          call_contract: {
            contract_id: utils.decodeBase58(op.call_contract.contract_id),
            entry_point: op.call_contract.entry_point,
            args: utils.decodeBase64url(op.call_contract.args),
          }
        });
        decodedOperations.push({
          call_contract: { contractId, name, args },
        });
      }

      this.data = JSON.stringify(decodedOperations, null, 2);
      // TODO: check nonce and limit mana
    },

    async sign() {
      const requests = this.$store.state.requests.filter(
        (r) =>
          r.command === "signer:sendTransaction" &&
          r.id === this.id &&
          r.sender.origin === this.requester.origin
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
      let message = { id: request.id };
      try {
        const transaction = await signer.sendTransaction(request.args.tx);
        message.result = transaction;
      } catch (err) {
        message.error = err;
      }
      this.sendResponse("extension", message, this.requester);
    },

    cancel() {
      const message = {
        id: this.id,
        error: "sendTransaction cancelled",
      };
      this.sendResponse("extension", message, this.requester);
    },
  },
};
</script>
