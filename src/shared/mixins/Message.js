/* eslint-disable no-undef */
import router from "@/index/router";
// import { Messenger } from "../../ts/Messenger.ts";

export default {
  name: "Message mixin",
  data: function () {
    return {
      messenger: null,
    };
  },

  created() {
    /* this.messenger = new Messenger(async (request) => {
      const { data } = request;
      const { command } = data;
      switch (command) {
        case "newWallet": {
          router.push("/dashboard");
          return "ok";
        }
        default:
          return undefined;
      }
    }); */

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const { id, data, error } = request;
      sendResponse({});
      const i = this.msgPool.findIndex(m => m.id === id);
      if (i >= 0) {
        // this is a response from a previous message
        if (error) {
          this.msgPool[i].error = error;
          return;
        }
        this.msgPool[i].response = data;
        return;
      }
      // processing the request
      if (sender.tab) { // reply to app
        this.processRequestFromTab(sender.tab.id, request);
      } else { // reply to background
        this.processRequestFromBackground(request);
      }
    });

    (async () => {
      console.log("asking to bg the tabId");
      const tabId = await this.sendMessage("extension", {
        command: "getTab",
      });
      console.log("resp background");
      console.log(tabId);
      console.log("sending message popupLoaded to webpage");
      const response2 = await this.sendMessage(tabId, {
        command: "popupLoaded",
      });
      console.log("resp tab");
      console.log(response2);
    })();
  },

  methods: {
    async sendMessage(to, data) {
      const id = Math.round(Math.random() * 10000);
      this.msgPool.push({id});
       if (to === "extension") {
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
      if (msgResp.error) throw msgResp.error;
      return msgResp.response;
    },
    
    async processRequestFromBackground(request) {
      const { id, data } = request;
      const { command } = data;
      switch (command) {
        case "a":
          chrome.runtime.sendMessage({ id, data: {
            test: "response ok 2",
          }});
          break;
        default:
          break;
      }
    },
    
    async processRequestFromTab(tabId, request) {
      const { id, data } = request;
      const { command } = data;
      switch (command) {
        case "newWallet":
          chrome.tabs.sendMessage(tabId, { id, data: {
            test: "response ok 3",
          }});
          router.push("/dashboard");
          break;
        default:
          break;
      }
    },
  },
};
