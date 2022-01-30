/* eslint-disable no-undef */
import router from "@/index/router";
import { Messenger } from "../../../lib/Messenger";

export default {
  name: "Message mixin",
  data: function () {
    return {
      messenger: null,
    };
  },

  created() {
    this.messenger = new Messenger({
      onExtensionRequest: async (message, id, sender) => {
        const { command, args } = message;
        switch (command) {
          case "newWallet": {
            router.push("/dashboard");
            return "ok";
          }
          case "signer:sendTransaction": {
            this.$store.state.requests.push({
              id,
              command,
              args,
              sender,
            });
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

    (async () => {
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
        "popupLoaded"
      );
      console.log("resp tab");
      console.log(response2);
    })();
  },
};
