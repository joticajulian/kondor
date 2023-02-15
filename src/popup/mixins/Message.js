/* eslint-disable no-undef */
import { Messenger } from "kondor-js";
import router from "@/popup/router";
import Sandbox from "@/shared/mixins/Sandbox";

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
        const request = { id, command, args, sender };

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
          this.$store.state.requests.push(request);
          this.messenger.removeListeners();
          router.push("/getAccounts");
          return { _derived: true };
        }
        case "signer:signHash": {
          this.$store.state.requests.push(request);
          this.messenger.removeListeners();
          router.push("/signHash");
          return { _derived: true };
        }
        case "signer:signMessage": {
          this.$store.state.requests.push(request);
          this.messenger.removeListeners();
          router.push("/signMessage");
          return { _derived: true };
        }
        case "signer:signTransaction": {
          this.$store.state.requests.push(request);
          this.messenger.removeListeners();
          router.push("/signTransaction");
          return { _derived: true };
        }
        case "signer:sendTransaction": {
          this.$store.state.requests.push(request);
          this.messenger.removeListeners();
          router.push("/sendTransaction");
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
