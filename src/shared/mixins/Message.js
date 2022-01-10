/* eslint-disable no-undef */
import router from "@/index/router";

export default {
  name: "Message mixin",
  data: function () {
    return {
      msgPool: [],
    };
  },

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

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      const { id, data } = request;
      sendResponse({});
      const i = this.msgPool.findIndex(m => m.id === id);
      if (i >= 0) {
        // this is a response from a previous message
        this.msgPool[i].response = data;
        return;
      }

      // processing the request
      if (sender.tab) { // reply to app

      } else { // reply to background
        this.processRequestBackground(request);
      }      
    });
  },

  methods: {
    async sendMessage(to, data) {
      const id = Math.round(Math.random() * 10000);
      this.msgPool.push({id});

      if (to === "background") {
        chrome.runtime.sendMessage({ id, data });
      } else { // 'to' is tab.id
        chrome.tabs.sendMessage(to, { id, data });
      }
      
      let i = this.msgPool.findIndex(m => m.id === id);
      while ( !this.msgPool[i].response ) {
        await new Promise(r => setTimeout(r, 20));
        i = this.msgPool.findIndex(m => m.id === id);
      }
      const [ msgResp ] = this.msgPool.splice(i, 1);
      if (msgResp.response.error) throw new Error(msgResp.response.error);
      return msgResp.response;
    },

    async processRequestBackground(request) {
      const { id, data } = request;
      const { command } = data;
      switch (command) {
        case "a":
          chrome.runtime.sendMessage({ id, data: {
            test: "response ok 2",
          }});
          break;
        default:
          chrome.runtime.sendMessage({ id, data: {
            error: `unknown command ${command}`,
          }});
      }
    },
  },
};
