/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/ts/Messenger.ts
/* eslint-disable no-undef */
function getError(e) {
    if (typeof e !== "object")
        return e;
    if (e.message)
        return e.message;
    // console.debug("unknown kondor error");
    // console.debug(e);
    return "unknown kondor error";
}
class Messenger {
    constructor(opts) {
        this.listeners = [];
        this.onExtensionRequest = async () => ({});
        this.onDomRequest = async () => ({});
        if (!opts)
            return;
        if (opts.onExtensionRequest) {
            this.onExtensionRequest = opts.onExtensionRequest;
            const listener = async (data, sender, res) => {
                res();
                const { id, command } = data;
                // check if it is a MessageRequest
                if (!command)
                    return;
                let message = { id };
                // console.debug("incoming request", id, ":", command);
                // console.debug((data as MessageRequest).args);
                try {
                    const result = await this.onExtensionRequest(data, id, sender);
                    // check if other process will send the response
                    if (typeof result === "object" &&
                        result !== null &&
                        result._derived) {
                        // console.debug("response", id, "derived");
                        return;
                    }
                    message.result = result;
                }
                catch (error) {
                    message.error = error.message;
                }
                if (typeof message.result === "undefined" && !message.error)
                    return;
                this.sendResponse("extension", message, sender);
            };
            this.listeners.push({ type: "extension", id: "onRequest", listener });
            chrome.runtime.onMessage.addListener(listener);
        }
        if (opts.onDomRequest) {
            this.onDomRequest = opts.onDomRequest;
            const listener = async (event) => {
                const { id, command } = event.data;
                // check if it is a MessageRequest
                if (!command)
                    return;
                let message = { id };
                // console.debug("incoming request", id, ":", command);
                // console.debug((event.data as MessageRequest).args);
                try {
                    const result = await this.onDomRequest(event, id);
                    // check if other process will send the response
                    if (typeof result === "object" &&
                        result !== null &&
                        result._derived) {
                        // console.debug("response", id, "derived");
                        return;
                    }
                    message.result = result;
                }
                catch (error) {
                    message.error = error.message;
                }
                if (typeof message.result === "undefined" && !message.error)
                    return;
                this.sendResponse("dom", message);
            };
            this.listeners.push({ type: "dom", id: "onRequest", listener });
            window.addEventListener("message", listener);
        }
    }
    sendResponse(type, message, sender) {
        // console.debug("outgoing response", message.id, ":");
        // console.debug(message);
        if (type === "dom")
            window.postMessage(message, "*");
        else {
            if (sender && sender.tab)
                chrome.tabs.sendMessage(sender.tab.id, message);
            else
                chrome.runtime.sendMessage(message);
        }
    }
    async sendDomMessage(to, command, args) {
        const reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (event) => {
                // ignore requests
                if (event.data.command)
                    return;
                const { id, result, error } = event.data;
                // ignore different ids
                if (id !== reqId)
                    return;
                // send response
                if (error) {
                    // console.debug("error received", id, ":");
                    // console.debug(getError(error));
                    reject(new Error(getError(error)));
                }
                else {
                    // console.debug("response received", id, ":");
                    // console.debug(result);
                    resolve(result);
                }
                this.removeListener(reqId);
            };
            // listen
            this.listeners.push({ type: "dom", id: reqId, listener });
            window.addEventListener("message", listener);
            // send request
            window.postMessage({
                id: reqId,
                command,
                args,
                to,
            }, "*");
            // console.debug("sending message", reqId, command, "to dom");
            // console.debug(args);
        });
    }
    async sendExtensionMessage(to, command, args, opts) {
        const reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (data, _sender, res) => {
                res();
                // ignore requests
                if (data.command)
                    return;
                const { id, result, error } = data;
                // ignore different ids
                if (id !== reqId)
                    return;
                // send response
                if (error) {
                    // console.debug("error received", id, ":");
                    // console.debug(getError(error));
                    reject(new Error(getError(error)));
                }
                else {
                    // console.debug("response received", id, ":");
                    // console.debug(result);
                    resolve(result);
                }
                this.removeListener(reqId);
            };
            // listen
            this.listeners.push({ type: "extension", id: reqId, listener });
            chrome.runtime.onMessage.addListener(listener);
            // send request
            const sendMessage = () => {
                if (["popup", "background"].includes(to)) {
                    chrome.runtime.sendMessage({
                        id: reqId,
                        command,
                        args,
                        to,
                    });
                }
                else {
                    // 'to' is tab.id
                    chrome.tabs.sendMessage(to, {
                        id: reqId,
                        command,
                        args,
                        to,
                    });
                }
                // console.debug("sending message", reqId, command, "to", to);
                // console.debug(args);
            };
            sendMessage();
            // define timeout
            if (opts && opts.timeout) {
                setTimeout(() => {
                    reject(new Error("Connection lost"));
                    this.removeListener(reqId);
                }, opts.timeout);
            }
            // ping
            if (opts && opts.ping) {
                (async () => {
                    let retries = (opts === null || opts === void 0 ? void 0 : opts.retries) || 0;
                    await new Promise((r) => setTimeout(r, 1000));
                    while (this.listeners.find((l) => l.id === reqId)) {
                        try {
                            await this.sendExtensionMessage(to, "ping", { id: reqId, to }, { timeout: 80 });
                            await new Promise((r) => setTimeout(r, 1000));
                        }
                        catch (error) {
                            if (retries <= 0) {
                                reject(error);
                                this.removeListener(reqId);
                                break;
                            }
                            retries -= 1;
                            console.log(`retrying ${reqId}. remaining retries: ${retries}`);
                            sendMessage();
                            await new Promise((r) => setTimeout(r, 100));
                        }
                    }
                })();
            }
        });
    }
    removeListener(id) {
        const index = this.listeners.findIndex((l) => l.id === id);
        if (index < 0)
            return;
        const removed = this.listeners.splice(index, 1);
        const { listener, type } = removed[0];
        if (type === "dom") {
            window.removeEventListener("message", listener);
        }
        else {
            chrome.runtime.onMessage.removeListener(listener);
        }
    }
    removeListeners() {
        this.listeners.forEach((l) => {
            const { type, listener } = l;
            if (type === "dom") {
                window.removeEventListener("message", listener);
            }
            else {
                chrome.runtime.onMessage.removeListener(listener);
            }
        });
        this.listeners = [];
    }
}


// CONCATENATED MODULE: ./src/ts/kondorProvider.ts

const messenger = new Messenger({});
const provider = {
    async call(method, params) {
        return messenger.sendDomMessage("background", "provider:call", {
            method,
            params,
        });
    },
    async getNonce(account) {
        return messenger.sendDomMessage("background", "provider:getNonce", {
            account,
        });
    },
    async getAccountRc(account) {
        return messenger.sendDomMessage("background", "provider:getAccountRc", {
            account,
        });
    },
    async getTransactionsById(transactionIds) {
        return messenger.sendDomMessage("background", "provider:getTransactionsById", {
            transactionIds,
        });
    },
    async getBlocksById(blockIds) {
        return messenger.sendDomMessage("background", "provider:getBlocksById", {
            blockIds,
        });
    },
    async getHeadInfo() {
        return messenger.sendDomMessage("background", "provider:getHeadInfo");
    },
    async getChainId() {
        return messenger.sendDomMessage("background", "provider:getChainId");
    },
    async getBlocks(height, numBlocks = 1, idRef) {
        return messenger.sendDomMessage("background", "provider:getBlocks", {
            height,
            numBlocks,
            idRef,
        });
    },
    async getBlock(height) {
        return messenger.sendDomMessage("background", "provider:getBlock", {
            height,
        });
    },
    async wait(txId, type = "byBlock", timeout = 30000) {
        return messenger.sendDomMessage("background", "provider:wait", {
            txId,
            type,
            timeout,
        });
    },
    async sendTransaction(transaction) {
        await messenger.sendDomMessage("background", "provider:sendTransaction", {
            transaction,
        });
        return {};
    },
    async submitBlock(block) {
        return messenger.sendDomMessage("background", "provider:submitBlock", {
            block,
        });
    },
    async readContract(operation) {
        return messenger.sendDomMessage("background", "provider:readContract", {
            operation,
        });
    },
};
/* harmony default export */ var kondorProvider = (provider);

// CONCATENATED MODULE: ./src/ts/kondorSigner.ts

const kondorSigner_messenger = new Messenger({});
const signer = {
    getAddress: () => {
        throw new Error("getAddress is not available. Please use getAccounts from kondor");
    },
    getPrivateKey: () => {
        throw new Error("getPrivateKey is not available");
    },
    signTransaction: () => {
        throw new Error("signTransaction is not available. Use sendTransaction instead");
    },
    signHash: () => {
        throw new Error("signHash is not available. Use sendTransaction instead");
    },
    prepareBlock: () => {
        throw new Error("prepareBlock is not available");
    },
    signBlock: () => {
        throw new Error("signBlock is not available");
    },
    prepareTransaction: async (transaction) => {
        const tx = await kondorSigner_messenger.sendDomMessage("background", "signer:prepareTransaction", { transaction });
        return tx;
    },
    sendTransaction: async (tx, abis) => {
        const { transaction, receipt } = await kondorSigner_messenger.sendDomMessage("popup", "signer:sendTransaction", {
            tx,
            abis,
        });
        return {
            receipt,
            transaction: {
                ...transaction,
                wait: async (type = "byBlock", timeout = 30000) => {
                    return kondorSigner_messenger.sendDomMessage("background", "provider:wait", {
                        txId: transaction.id,
                        type,
                        timeout,
                    });
                },
            },
        };
    },
};
/* harmony default export */ var kondorSigner = (signer);

// CONCATENATED MODULE: ./src/ts/kondorAccount.ts

const kondorAccount_messenger = new Messenger();
async function getAccounts() {
    return kondorAccount_messenger.sendDomMessage("popup", "getAccounts", {});
}
/* harmony default export */ var kondorAccount = (getAccounts);

// CONCATENATED MODULE: ./src/ts/kondorIndex.ts



window.kondor = { provider: provider, signer: signer, getAccounts: getAccounts };


/***/ })
/******/ ]);