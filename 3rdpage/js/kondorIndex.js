/******/ (function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/ var installedModules = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Flag the module as loaded
    /******/ module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/ __webpack_require__.c = installedModules;
  /******/
  /******/ // define getter function for harmony exports
  /******/ __webpack_require__.d = function (exports, name, getter) {
    /******/ if (!__webpack_require__.o(exports, name)) {
      /******/ Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter,
      });
      /******/
    }
    /******/
  };
  /******/
  /******/ // define __esModule on exports
  /******/ __webpack_require__.r = function (exports) {
    /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      /******/ Object.defineProperty(exports, Symbol.toStringTag, {
        value: "Module",
      });
      /******/
    }
    /******/ Object.defineProperty(exports, "__esModule", { value: true });
    /******/
  };
  /******/
  /******/ // create a fake namespace object
  /******/ // mode & 1: value is a module id, require it
  /******/ // mode & 2: merge all properties of value into the ns
  /******/ // mode & 4: return value when already ns object
  /******/ // mode & 8|1: behave like require
  /******/ __webpack_require__.t = function (value, mode) {
    /******/ if (mode & 1) value = __webpack_require__(value);
    /******/ if (mode & 8) return value;
    /******/ if (
      mode & 4 &&
      typeof value === "object" &&
      value &&
      value.__esModule
    )
      return value;
    /******/ var ns = Object.create(null);
    /******/ __webpack_require__.r(ns);
    /******/ Object.defineProperty(ns, "default", {
      enumerable: true,
      value: value,
    });
    /******/ if (mode & 2 && typeof value != "string")
      for (var key in value)
        __webpack_require__.d(
          ns,
          key,
          function (key) {
            return value[key];
          }.bind(null, key)
        );
    /******/ return ns;
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/ __webpack_require__.n = function (module) {
    /******/ var getter =
      module && module.__esModule
        ? /******/ function getDefault() {
            return module["default"];
          }
        : /******/ function getModuleExports() {
            return module;
          };
    /******/ __webpack_require__.d(getter, "a", getter);
    /******/ return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/ __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/ __webpack_require__.p = "";
  /******/
  /******/
  /******/ // Load entry module and return exports
  /******/ return __webpack_require__((__webpack_require__.s = 0));
  /******/
})(
  /************************************************************************/
  /******/ [
    /* 0 */
    /***/ function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // CONCATENATED MODULE: ./src/ts/Messenger.ts
      /* eslint-disable no-undef */
      class Messenger {
        constructor(opts) {
          this.onExtensionRequest = async () => ({});
          this.onDomRequest = async () => ({});
          if (!opts) return;
          if (opts.onExtensionRequest) {
            this.onExtensionRequest = opts.onExtensionRequest;
            chrome.runtime.onMessage.addListener(async (data, sender, res) => {
              res();
              const { id, command } = data;
              // check if it is a MessageRequest
              if (!command) return;
              let message = { id };
              try {
                const result = await this.onExtensionRequest(data, id, sender);
                // check if other process will send the response
                if (typeof result === "object" && result._derived) return;
                message.result = result;
              } catch (err) {
                message.error = err;
              }
              if (typeof message.result === "undefined" && !message.error)
                return;
              this.sendResponse("extension", message, sender);
            });
          }
          if (opts.onDomRequest) {
            this.onDomRequest = opts.onDomRequest;
            window.addEventListener("message", async (event) => {
              const { id, command } = event.data;
              // check if it is a MessageRequest
              if (!command) return;
              let message = { id };
              try {
                const result = await this.onDomRequest(event, id);
                // check if other process will send the response
                if (typeof result === "object" && result._derived) return;
                message.result = result;
              } catch (err) {
                message.error = err;
              }
              if (typeof message.result === "undefined" && !message.error)
                return;
              this.sendResponse("dom", message);
            });
          }
        }
        sendResponse(type, message, sender) {
          if (type === "dom") window.postMessage(message, "*");
          else {
            if (sender && sender.tab)
              chrome.tabs.sendMessage(sender.tab.id, message);
            else chrome.runtime.sendMessage(message);
          }
        }
        async sendDomMessage(command, args) {
          const reqId = Math.round(Math.random() * 10000);
          return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (event) => {
              // ignore requests
              if (event.data.command) return;
              const { id, result, error } = event.data;
              // ignore different ids
              if (id !== reqId) return;
              // send response
              if (error) reject(error);
              else resolve(result);
              window.removeEventListener("message", listener);
            };
            // listen
            window.addEventListener("message", listener);
            // send request
            window.postMessage(
              {
                id: reqId,
                command,
                args,
              },
              "*"
            );
          });
        }
        async sendExtensionMessage(to, command, args) {
          const reqId = Math.round(Math.random() * 10000);
          return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (data, _sender, res) => {
              res();
              // ignore requests
              if (data.command) return;
              const { id, result, error } = data;
              // ignore different ids
              if (id !== reqId) return;
              // send response
              if (error) reject(error);
              else resolve(result);
              chrome.runtime.onMessage.removeListener(listener);
            };
            // listen
            chrome.runtime.onMessage.addListener(listener);
            // send request
            if (to === "extension") {
              chrome.runtime.sendMessage({
                id: reqId,
                command,
                args,
              });
            } else {
              // 'to' is tab.id
              chrome.tabs.sendMessage(to, {
                id: reqId,
                command,
                args,
              });
            }
          });
        }
      }

      // CONCATENATED MODULE: ./src/ts/kondorProvider.ts

      const messenger = new Messenger({});
      const provider = {
        async call(method, params) {
          return messenger.sendDomMessage("provider:call", { method, params });
        },
        async getNonce(account) {
          return messenger.sendDomMessage("provider:getNonce", { account });
        },
        async getAccountRc(account) {
          return messenger.sendDomMessage("provider:getAccountRc", { account });
        },
        async getTransactionsById(transactionIds) {
          return messenger.sendDomMessage("provider:getTransactionsById", {
            transactionIds,
          });
        },
        async getBlocksById(blockIds) {
          return messenger.sendDomMessage("provider:getBlocksById", {
            blockIds,
          });
        },
        async getHeadInfo() {
          return messenger.sendDomMessage("provider:getHeadInfo");
        },
        async getBlocks(height, numBlocks = 1, idRef) {
          return messenger.sendDomMessage("provider:getBlocks", {
            height,
            numBlocks,
            idRef,
          });
        },
        async getBlock(height) {
          return messenger.sendDomMessage("provider:getBlock", { height });
        },
        async sendTransaction(transaction) {
          await messenger.sendDomMessage("provider:sendTransaction", {
            transaction,
          });
          return {};
        },
        async readContract(operation) {
          return messenger.sendDomMessage("provider:readContract", {
            operation,
          });
        },
      };
      /* harmony default export */ var kondorProvider = provider;

      // CONCATENATED MODULE: ./src/ts/kondorSigner.ts

      const kondorSigner_messenger = new Messenger({});
      const signer = {
        getAddress: () => {
          throw new Error(
            "getAddress is not available. Please use getAccounts from kondor"
          );
        },
        getPrivateKey: () => {
          throw new Error("getPrivateKey is not available");
        },
        signTransaction: () => {
          throw new Error(
            "signTransaction is not available. Use sendTransaction instead"
          );
        },
        encodeTransaction: async (activeData) => {
          return kondorSigner_messenger.sendDomMessage(
            "signer:encodeTransaction",
            { activeData }
          );
        },
        decodeTransaction: async (tx) => {
          return kondorSigner_messenger.sendDomMessage(
            "signer:decodeTransaction",
            { tx }
          );
        },
        sendTransaction: async (tx, abis) => {
          const transaction = await kondorSigner_messenger.sendDomMessage(
            "signer:sendTransaction",
            {
              tx,
              abis,
            }
          );
          return {
            ...transaction,
            wait: async (type = "byBlock", timeout = 30000) => {
              return kondorSigner_messenger.sendDomMessage("provider:wait", {
                txId: transaction.id,
                type,
                timeout,
              });
            },
          };
        },
      };
      /* harmony default export */ var kondorSigner = signer;

      // CONCATENATED MODULE: ./src/ts/kondorIndex.ts

      window.kondor = { provider: provider, signer: signer };

      /***/
    },
    /******/
  ]
);
