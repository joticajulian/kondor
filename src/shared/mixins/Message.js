/* eslint-disable no-undef */
import router from "@/index/router";

export default {
  name: "Message mixin",
  created() {
    chrome.runtime.sendMessage(
      { greeting: "hi background, I'm popup" },
      function (response) {
        const { tabId } = response;
        chrome.tabs.sendMessage(
          tabId,
          { greeting: "hi tab, I'm popup" },
          function (response) {
            if (response.farewell === "hey popup!") {
              // todo: define the routing in response
              router.push("/newWallet");
            }
          }
        );
      }
    );
  },
};
