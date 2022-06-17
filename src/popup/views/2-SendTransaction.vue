<template>
  <div>
    <Footnote v-if="footnoteMessage" :message="footnoteMessage" />
    <div>Signature request</div>
    <div>{{ requester.origin }}</div>
    <div>signer: {{ signerData }}</div>
    <div>{{ data }}</div>
    <div v-if="!unlocked">
      <Unlock @onUnlock="afterUnlocked()" @onError="alertDanger($event)" />
    </div>
    <button @click="sign" :disabled="!unlocked">Sign</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
import { Signer, Contract, Provider } from "koilib";
import * as koilib3 from "koilib3";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";
import Message from "@/shared/mixins/Message";

// components
import Unlock from "@/shared/components/Unlock.vue";
import Footnote from "@/shared/components/Footnote.vue";

export default {
  name: "Send transaction",
  data: function () {
    return {
      data: "",
      signerData: "",
      requester: "",
      footnoteMessage: "",
      account: null,
      unlocked: !!this.$store.state.accounts.length > 0,
      numErrors: 0,
      request: null,
      isOldKoilib: false,
      isOldKondor: false,
    };
  },

  mixins: [Storage, Sandbox, ViewHelper, Message],

  components: { Unlock, Footnote },

  mounted() {
    const requests = this.$store.state.requests.filter(
      (r) => r.command === "signer:sendTransaction"
    );
    /**
     * TODO: for several requests create a list of requesters
     * and ask to the user to select one to see the details
     */
    this.request = requests[0];
    this.requester = this.request.sender;
    this.decodeTransaction();
  },

  methods: {
    async decodeTransaction() {
      try {
        if (this.request.args.signerAddress) {
          this.signerData = this.request.args.signerAddress;
        } else {
          console.warn(
            `The function kondor.signer.sendTransaction will be deprecated in the future. Please use kondor.getSigner(signerAddress).sendTransaction. Consider using kondor-js@^0.2.0`
          );
          this.isOldKondor = true;
          this.signerData = "undefined";
        }
        const { operations } = this.request.args.tx;
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
          const abi = this.request.args.abis[contractId];
          let contract;
          if (typeof abi.types === "object") {
            console.warn(
              "koilib 3 will be deprecated in the future. Please use koilib version >= 4.0.0"
            );
            this.isOldKoilib = true;
            contract = new koilib3.Contract({
              id: contractId,
              abi,
              serializer: await this.newSandboxSerializer(abi.types),
            });
          } else if (typeof abi.koilib_types === "object") {
            contract = new Contract({
              id: contractId,
              abi,
              serializer: await this.newSandboxSerializer(abi.koilib_types),
            });
          }
          const { name, args } = await contract.decodeOperation(op);
          decodedOperations.push({
            call_contract: { contractId, name, args },
          });
        }

        if (this.isOldKoilib || this.isOldKondor)
          this.footnoteMessage = `This website is using an old version of ${
            this.isOldKondor ? "kondor" : ""
          }${this.isOldKondor && this.isOldKoilib ? " and " : ""}${
            this.isOldKoilib ? "koilib" : ""
          }. Its support will be deprecated in a future release`;

        this.data = JSON.stringify(decodedOperations, null, 2);
        // TODO: check nonce and limit mana
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    afterUnlocked() {
      this.unlocked = true;
      this.account = this.$store.state.accounts.find(
        (a) =>
          !this.request.args.signerAddress ||
          a.address === this.request.args.signerAddress
      );
      this.signerData = `${this.account.name} - ${this.account.address}`;
    },

    async sign() {
      // TODO: throw error if there are requests.length > 1
      const rpcNodes = await this._getRpcNodes();
      const provider = new Provider(rpcNodes);
      provider.onError = () => {
        this.numErrors += 1;
        return this.numErrors > 20;
      };
      const signer = Signer.fromWif(this.account.privateKey);
      signer.provider = provider;
      let message = { id: this.request.id };
      try {
        const transaction = await signer.sendTransaction(this.request.args.tx);
        message.result = transaction;
      } catch (err) {
        message.error = err;
      }
      this.sendResponse("extension", message, this.request.sender);
      window.close();
    },

    cancel() {
      const message = {
        id: this.request.id,
        error: "sendTransaction cancelled",
      };
      this.sendResponse("extension", message, this.request.sender);
      window.close();
    },
  },
};
</script>
<style scoped>
button {
  margin-bottom: 4em;
  border-bottom: 0.5px dashed;
}
</style>
