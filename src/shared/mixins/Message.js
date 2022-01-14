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
    this.messenger = new Messenger(async (request) => {
      const { data } = request;
      const { command } = data;
      switch (command) {
        case "newWallet": {
          router.push("/dashboard");
          return "ok";
        }
        case "sendTransaction": {
          return "ok";
        }
        default:
          return undefined;
      }
    });

    (async () => {
      console.log("asking to bg the tabId");
      const tabId = await this.messenger.sendMessage("extension", {
        command: "getTab",
      });
      console.log("resp background");
      console.log(tabId);
      console.log("sending message popupLoaded to webpage");
      const response2 = await this.messenger.sendMessage(tabId, {
        command: "popupLoaded",
      });
      console.log("resp tab");
      console.log(response2);
    })();
  },
};
