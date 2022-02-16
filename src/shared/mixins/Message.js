/* eslint-disable no-undef */
import { Signer, utils } from "koilib";
import router from "@/index/router";
import Sandbox from "@/shared/mixins/Sandbox";
import { Messenger } from "../../../lib/Messenger";

// {0: 23, 1: 34} ==> [23, 34]
function objToArray(obj) {
  return Object.keys(obj).map((k) => obj[k]);
}

export default {
  name: "Message mixin",
  data: function () {
    return {
      messenger: null,
    };
  },

  mixins: [Sandbox],

  mounted() {
    this.messenger = new Messenger({
      onExtensionRequest: async (message, id, sender) => {
        const { command, args } = message;
        switch (command) {
          case "newWallet": {
            this.messenger.removeListeners();
            router.push("/dashboard");
            return "ok";
          }
          case "ping": {
            const request = this.$store.state.requests.find(
              (r) => r.id === args.id
            );
            if (!request) throw new Error("Connection closed");
            return "ok";
          }
          case "ping2": {
            this.returnPopupReady();
            return "ok";
          }
          case "getAccounts": {
            console.log("1");
            this.$store.state.requests.push({
              id,
              command,
              args,
              sender,
            });
            console.log("2");
            this.messenger.removeListeners();
            router.push("/getAccounts");
            console.log("3");

            return { _derived: true };
          }
          case "signer:encodeTransaction": {
            const signer = Signer.fromSeed("");
            signer.serializer = await this.newSandboxSerializer(
              utils.ProtocolTypes,
              {
                defaultTypeName: "active_transaction_data",
                bytesConversion: false,
              }
            );
            const operations = args.activeData.operations.map((op) => {
              if (op.call_contract) {
                return {
                  call_contract: {
                    contract_id: new Uint8Array(
                      objToArray(op.call_contract.contract_id)
                    ),
                    args: new Uint8Array(objToArray(op.call_contract.args)),
                    entry_point: op.call_contract.entry_point,
                  },
                };
              }
              // TODO: other types of operations
              return op;
            });
            return signer.encodeTransaction({
              operations,
              nonce: 0,
            });
          }
          /*case "signer:decodeTransaction": {
          }*/
          case "signer:sendTransaction": {
            this.$store.state.requests.push({
              id,
              command,
              args,
              sender,
            });
            this.messenger.removeListeners();
            router.push("/sendTransaction");

            /**
             * _derived:true is returned to not send a response
             * yet (see Messenger.ts). The /sendTransaction view
             * will take care of the response
             */
            return { _derived: true };
          }
          default:
            return undefined;
        }
      },
    });

    this.returnPopupReady();
  },

  methods: {
    async returnPopupReady() {
      console.log("asking to bg the tabId");
      const tabId = await this.messenger.sendExtensionMessage(
        "extension",
        "getTab"
      );
      console.log("resp background");
      console.log(tabId);
      console.log("sending message popupLoaded to webpage");
      const response2 = await this.messenger.sendExtensionMessage(
        tabId,
        "popupReady"
      );
      console.log("resp tab");
      console.log(response2);
    },

    sendResponse(type, message, requester) {
      this.messenger.sendResponse(type, message, requester);

      // remove request
      const index = this.$store.state.requests.find((r) => r.id === message.id);
      if (index >= 0) this.$store.state.requests.splice(index, 1);
    },
  },
};
