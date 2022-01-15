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
      onExtensionRequest: async (message) => {
        console.log("vue command extension: " + message.command);
        const { command, args } = message;
        switch (command) {
          case "newWallet": {
            router.push("/dashboard");
            return "ok";
          }
          case "sendTransaction": {
            return "transaction sent: " + JSON.stringify(args);
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
