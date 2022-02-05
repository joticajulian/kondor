<template>
  <div>
    <div>Signature request</div>
    <div>{{ requester }}</div>
    <div>{{ data }}</div>
  </div>
</template>

<script>
import { Signer, Contract, utils } from "koilib";
import AlertHelper from "@/shared/mixins/AlertHelper";
import Sandbox from "@/shared/mixins/Sandbox";

export default {
  name: "Send transaction",
  data: function () {
    return {
      data: "",
      requester: "",
    };
  },

  mixins: [Sandbox, AlertHelper],

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
      console.log("decoded tx");
      console.log(active);
      console.log("req");
      console.log(request);
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

      console.log("requester:");
      console.log(request.sender);
      this.data = JSON.stringify(decodedOperations, null, 2);
      // TODO: check nonce and limit mana
    },
  },
};
</script>
