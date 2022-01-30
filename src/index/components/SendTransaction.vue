<template>
  <div>
    <div>Signature request</div>
    <div>{{ requester }}</div>
    <div>{{ data }}</div>
  </div>
</template>

<script>
import { Signer, Contract } from "koilib";
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
      const signer = new Signer();
      const active = signer.decodeTransaction(request.args.tx);
      const decodedOperations = [];
      active.operations.forEach((op) => {
        if (!op.call_contract) {
          // upload contract or set system call don't
          // require an extra decode
          decodedOperations.push(op);
          return;
        }
        const contract = new Contract({
          id: op.call_contract.contract_id,
          abi: request.args.abis[op.call_contract.contract_id],
          serializer: await this.newSandboxSerializer(utils.Krc20Abi.types),
        });
        const { name, args } = await contract.decodeOperation(op);
        decodedOperations.push({
          call_contract: { contractId: contract.id, name, args },
        });
      });

      console.log("requester:");
      console.log(request.sender);
      this.data = JSON.stringify(decodedOperations, null, 2);
      // TODO: check nonce and limit mana
    },
  },
};
</script>
