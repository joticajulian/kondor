/* eslint-disable no-undef */
import router from "@/index/router";
import Sandbox from "@/shared/mixins/Sandbox";
import { Messenger } from "../../../lib/Messenger";

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
        const { command, args, to } = message;

        if (to !== "popup") return undefined;

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
            this.$store.state.requests.push({
              id,
              command,
              args,
              sender,
            });
            this.messenger.removeListeners();
            router.push("/getAccounts");

            return { _derived: true };
          }
          case "signer:signHash": {
            throw new Error("function not implemented in this version");
          }
          case "signer:signTransaction": {
            throw new Error("function not implemented in this version");
          }
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
      const tabId = await this.messenger.sendExtensionMessage(
        "background",
        "getTab"
      );
      await this.messenger.sendExtensionMessage(tabId, "popupReady");
    },

    sendResponse(type, message, requester) {
      this.messenger.sendResponse(type, message, requester);

      // remove request
      const index = this.$store.state.requests.findIndex(
        (r) => r.id === message.id
      );
      if (index >= 0) this.$store.state.requests.splice(index, 1);
    },
  },
};
