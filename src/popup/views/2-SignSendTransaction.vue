<template>
  <div class="container">
    <div class="column">
      <Footnote
        v-if="footnoteMessage"
        :message="footnoteMessage"
      />
      <div class="title">
        Signature request {{ send ? "and send" : "" }}
        {{ broadcast ? "" : "but not broadcast (testing)" }}
      </div>
      <div class="advanced">
        Advanced
        <div class="checkbox-wrapper-2">
          <input
            type="checkbox"
            class="sc-gJwTLC ikxBAC"
          >
        </div>
      </div>
      <div>
        Signature requested by
        <div class="requester">
          {{ requester.origin }}
        </div>
      </div>
      <div class="tx-header">
        <div class="group-input">
          <label for="network">Network</label>
          <input
            v-model="network"
            type="text"
            disabled
          >
        </div>
        <div class="group-input">
          <label for="max-mana">Max. mana</label>
          <input
            v-model="maxMana"
            type="text"
          >
        </div>
        <div class="group-input">
          <label for="payer">Payer</label>
          <input
            v-model="payer"
            type="text"
          >
        </div>
        <div class="group-input">
          <label for="payee">Payee</label>
          <input
            v-model="payee"
            type="text"
          >
        </div>
        <div class="group-input">
          <label for="nonce">Nonce</label>
          <input
            v-model="nonce"
            type="text"
          >
        </div>
      </div>
      <div class="subtitle">
        Operations
      </div>
      <div
        v-for="(op, i) in operations"
        :key="i"
      >
        <div class="op-header">
          <div
            v-if="op.call_contract"
            class="contract-id"
          >
            {{ op.call_contract.contractId }}
          </div>
          <div class="op-title">
            {{ op.title }}
          </div>
        </div>
        <div class="op-body">
          <div
            v-for="(arg, j) in op.args"
            :key="j"
          >
            <div class="field-name">
              {{ arg.field }}
            </div>
            <div class="field-data">
              {{ arg.data }}
            </div>
          </div>
        </div>
      </div>
      <div class="subtitle">
        Signatures
      </div>

      <div>signer: {{ signerData }}</div>
      <div v-if="!unlocked">
        <Unlock
          @onUnlock="afterUnlocked()"
          @onError="alertDanger($event)"
        />
      </div>
      <Footnote
        v-if="footnoteMessage2"
        :message="footnoteMessage2"
      />
      <div class="container">
        <button
          :disabled="!unlocked"
          @click="sign"
        >
          Sign
        </button>
        <button
          class="cancel-button"
          @click="cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Signer, Contract, Provider } from "koilib";

// mixins
import Message from "@/popup/mixins/Message";
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

// components
import Unlock from "@/shared/components/Unlock.vue";
import Footnote from "@/shared/components/Footnote.vue";

function firstUpperCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default {
  name: "SignSendTransaction",

  components: { Unlock, Footnote },

  mixins: [Storage, Sandbox, ViewHelper, Message],

  props: {
    send: {
      type: Boolean,
      default: true,
    },
  },

  data: function () {
    return {
      data: "",
      broadcast: true,
      abis: null,
      signerData: "",
      requester: "",
      network: "mainnet",
      maxMana: "",
      payer: "1KRHqJ7uy5b4HZa5Une2dydYYFysVDyBwx",
      payee: "1KRHqJ7uy5b4HZa5Une2dydYYFysVDyBwx",
      nonce: "",
      operations: [],
      footnoteMessage: "",
      footnoteMessage2: "",
      account: null,
      unlocked: !!this.$store.state.accounts.length > 0,
      request: null,
      isOldKoilib: false,
      isOldKondor: false,
    };
  },

  mounted() {
    let requests;
    if (process.env.VUE_APP_ENV === "test") {
      requests = [
        {
          id: "270815b4-8c3e-4b53-b9ac-82ba3854c206",
          command: "signer:signTransaction",
          args: {
            signerAddress: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
            transaction: {
              operations: [
                {
                  call_contract: {
                    args: "ChkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LEhkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LGAo=",
                    contract_id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
                    entry_point: 670398154,
                  },
                },
              ],
              header: {
                chain_id: "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==",
                rc_limit: "0",
                nonce: "KAE=",
                operation_merkle_root:
                  "EiA2MNjxw_XH8Vzh2HQB1jQRG7vuNNAjDvG4-sOZ84Hdqg==",
                payer: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
              },
              id: "0x122003f0aaaa1442106df056828b737e7ea43e5e804a2234e583aa19a3270900c60e",
            },
            abis: {
              "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ": {
                methods: {
                  name: {
                    argument: "koinos.contracts.token.name_arguments",
                    return: "koinos.contracts.token.name_result",
                    "entry-point": "0x82a3537f",
                    description: "Returns the token name",
                    "read-only": true,
                    entry_point: 2191741823,
                  },
                  symbol: {
                    argument: "koinos.contracts.token.symbol_arguments",
                    return: "koinos.contracts.token.symbol_result",
                    "entry-point": "0xb76a7ca1",
                    description: "Returns the token symbol",
                    "read-only": true,
                    entry_point: 3077209249,
                  },
                  decimals: {
                    argument: "koinos.contracts.token.decimals_arguments",
                    return: "koinos.contracts.token.decimals_result",
                    "entry-point": "0xee80fd2f",
                    description: "Returns the token decimal precision",
                    "read-only": true,
                    entry_point: 4001430831,
                  },
                  total_supply: {
                    argument: "koinos.contracts.token.total_supply_arguments",
                    return: "koinos.contracts.token.total_supply_result",
                    "entry-point": "0xb0da3934",
                    description: "Returns the token total supply",
                    "read-only": true,
                    entry_point: 2967091508,
                  },
                  balance_of: {
                    argument: "koinos.contracts.token.balance_of_arguments",
                    return: "koinos.contracts.token.balance_of_result",
                    "entry-point": "0x5c721497",
                    description: "Checks the balance at an address",
                    "read-only": true,
                    entry_point: 1550980247,
                  },
                  transfer: {
                    argument: "koinos.contracts.token.transfer_arguments",
                    return: "koinos.contracts.token.transfer_result",
                    "entry-point": "0x27f576ca",
                    description: "Transfers the token",
                    "read-only": false,
                    entry_point: 670398154,
                  },
                  mint: {
                    argument: "koinos.contracts.token.mint_arguments",
                    return: "koinos.contracts.token.mint_result",
                    "entry-point": "0xdc6f17bb",
                    description: "Mints the token",
                    "read-only": false,
                    entry_point: 3698268091,
                  },
                  burn: {
                    argument: "koinos.contracts.token.burn_arguments",
                    return: "koinos.contracts.token.burn_result",
                    "entry-point": "0x859facc5",
                    description: "Burns the token",
                    "read-only": false,
                    entry_point: 2241834181,
                  },
                },
                koilib_types: {
                  nested: {
                    koinos: {
                      nested: {
                        contracts: {
                          nested: {
                            token: {
                              nested: {
                                name_arguments: {
                                  fields: {},
                                },
                                name_result: {
                                  fields: {
                                    value: {
                                      type: "string",
                                      id: 1,
                                    },
                                  },
                                },
                                symbol_arguments: {
                                  fields: {},
                                },
                                symbol_result: {
                                  fields: {
                                    value: {
                                      type: "string",
                                      id: 1,
                                    },
                                  },
                                },
                                decimals_arguments: {
                                  fields: {},
                                },
                                decimals_result: {
                                  fields: {
                                    value: {
                                      type: "uint32",
                                      id: 1,
                                    },
                                  },
                                },
                                total_supply_arguments: {
                                  fields: {},
                                },
                                total_supply_result: {
                                  fields: {
                                    value: {
                                      type: "uint64",
                                      id: 1,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                balance_of_arguments: {
                                  fields: {
                                    owner: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                  },
                                },
                                balance_of_result: {
                                  fields: {
                                    value: {
                                      type: "uint64",
                                      id: 1,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                transfer_arguments: {
                                  fields: {
                                    from: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    to: {
                                      type: "bytes",
                                      id: 2,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    value: {
                                      type: "uint64",
                                      id: 3,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                transfer_result: {
                                  fields: {},
                                },
                                mint_arguments: {
                                  fields: {
                                    to: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    value: {
                                      type: "uint64",
                                      id: 2,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                mint_result: {
                                  fields: {},
                                },
                                burn_arguments: {
                                  fields: {
                                    from: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    value: {
                                      type: "uint64",
                                      id: 2,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                burn_result: {
                                  fields: {},
                                },
                                balance_object: {
                                  fields: {
                                    value: {
                                      type: "uint64",
                                      id: 1,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                mana_balance_object: {
                                  fields: {
                                    balance: {
                                      type: "uint64",
                                      id: 1,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                    mana: {
                                      type: "uint64",
                                      id: 2,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                    last_mana_update: {
                                      type: "uint64",
                                      id: 3,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                burn_event: {
                                  fields: {
                                    from: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    value: {
                                      type: "uint64",
                                      id: 2,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                mint_event: {
                                  fields: {
                                    to: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    value: {
                                      type: "uint64",
                                      id: 2,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                                transfer_event: {
                                  fields: {
                                    from: {
                                      type: "bytes",
                                      id: 1,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    to: {
                                      type: "bytes",
                                      id: 2,
                                      options: {
                                        "(koinos.btype)": "ADDRESS",
                                      },
                                    },
                                    value: {
                                      type: "uint64",
                                      id: 3,
                                      options: {
                                        jstype: "JS_STRING",
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          sender: {
            id: "eghigpjkddlhegjaibgjlnfnkgdnmnlh",
            url: "https://koinosblocks.com/address/19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
            origin: "https://koinosblocks.com",
            frameId: 0,
            documentId: "F6D0BCBD9A19559A679F6714294A63A2",
            documentLifecycle: "active",
            tab: {
              active: true,
              audible: false,
              autoDiscardable: true,
              discarded: false,
              groupId: -1,
              height: 577,
              highlighted: true,
              id: 2018223012,
              incognito: false,
              index: 14,
              mutedInfo: {
                muted: false,
              },
              openerTabId: 2018223007,
              pinned: false,
              selected: true,
              status: "complete",
              title: "Koinosblocks.com - address details",
              url: "https://koinosblocks.com/address/19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
              width: 1280,
              windowId: 2018222470,
            },
          },
        },
      ];
    } else {
      requests = this.$store.state.requests.filter((r) => {
        if (this.send) return r.command === "signer:sendTransaction";
        return r.command === "signer:signTransaction";
      });
    }
    /**
     * TODO: for several requests create a list of requesters
     * and ask to the user to select one to see the details
     */
    this.request = requests[0];
    this.requester = this.request.sender;
    this.decodeTransaction();
  },

  methods: {
    async decodeTransaction() {
      try {
        if (this.request.args.signerAddress) {
          this.signerData = this.request.args.signerAddress;
        } else {
          console.warn(
            `The function kondor.signer.sendTransaction will be deprecated in the future. Please use kondor.getSigner(signerAddress).sendTransaction. Consider using kondor-js@^0.2.6`
          );
          this.isOldKondor = true;
          this.signerData = "undefined";
        }

        if (
          (this.request.args.optsSend &&
            this.request.args.optsSend.broadcast === false) ||
          this.request.args.broadcast === false
        ) {
          this.broadcast = false;
        }

        if (this.request.args.optsSend && this.request.args.optsSend.abis) {
          this.abis = this.request.args.optsSend.abis;
        } else if (this.request.args.abis) {
          this.abis = this.request.args.abis;
        }

        const { operations } = this.request.args.transaction;
        this.operations = [];
        for (let i = 0; i < operations.length; i += 1) {
          const op = operations[i];
          if (!op.call_contract) {
            // upload contract or set system call don't
            // require an extra decode
            let title = "";
            if (op.upload_contract) title = "Upload contract";
            else if (op.set_system_call) title = "Set system call";
            else if (op.set_system_contract) title = "Set system contract";
            else title = "Unknown operation";
            this.operations.push({
              ...op,
              title,
            });
            continue;
          }
          const contractId = op.call_contract.contract_id;
          try {
            const abi = this.abis[contractId];
            const contract = new Contract({
              id: contractId,
              abi,
              serializer: await this.newSandboxSerializer(abi.koilib_types),
            });
            const { name, args } = await contract.decodeOperation(op);
            this.operations.push({
              call_contract: { contractId, name, args },
              title: firstUpperCase(name),
              args: Object.keys(args).map((arg) => ({
                field: firstUpperCase(arg),
                data: args[arg],
              })),
            });
          } catch (error) {
            this.operations.push(op);
            this.footnoteMessage2 = [
              "Warning: Some of the operations could not be decoded.",
              "Only continue if you trust in",
              this.requester.origin,
            ].join(" ");
            console.log(error);
          }
        }

        if (this.isOldKoilib || this.isOldKondor)
          this.footnoteMessage = `This website is using an old version of ${
            this.isOldKondor ? "kondor" : ""
          }${this.isOldKondor && this.isOldKoilib ? " and " : ""}${
            this.isOldKoilib ? "koilib" : ""
          }. Its support will be deprecated in a future release`;
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    afterUnlocked() {
      this.unlocked = true;
      this.account = this.$store.state.accounts.find(
        (a) =>
          !this.request.args.signerAddress ||
          a.address === this.request.args.signerAddress
      );
      this.signerData = `${this.account.name} - ${this.account.address}`;
    },

    async sign() {
      // TODO: throw error if there are requests.length > 1
      const rpcNodes = await this._getRpcNodes();
      const provider = new Provider(rpcNodes);
      const signer = Signer.fromWif(this.account.privateKey);
      signer.provider = provider;
      let message = { id: this.request.id };
      const optsSend = { broadcast: this.broadcast };

      try {
        if (this.send) {
          // TODO: update when the support to the old kondor is finished
          message.result = await signer.sendTransaction(
            this.request.args.transaction || this.request.args.tx,
            optsSend
          );
        } else {
          // TODO: update when the support to the old kondor is finished
          message.result = await signer.signTransaction(
            this.request.args.transaction || this.request.args.tx
          );
        }
      } catch (err) {
        message.error = err.message;
      }
      this.sendResponse("extension", message, this.request.sender);
      window.close();
    },

    cancel() {
      const message = {
        id: this.request.id,
        error: "sendTransaction cancelled",
      };
      this.sendResponse("extension", message, this.request.sender);
      window.close();
    },
  },
};
</script>
<style scoped>
.title {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 0.5em;
}

.subtitle {
  font-size: 1.2em;
  font-weight: 600;
  margin-top: 0.5em;
}

.wrapper {
  width: 75%;
  margin-top: 2em;
}

input {
  margin-top: 2em;
}
.cancel-button {
  border: none;
  text-decoration: underline;
  color: var(--kondor-purple);
  background-color: transparent;
}

.advanced {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.requester {
  background-color: #c7c7c7;
  padding: 6px;
  margin: 5px 0px;
}

.tx-header {
  margin-top: 15px;
}

.group-input {
  display: flex;
  align-items: center;
}

.group-input label {
  flex: 1;
}

.group-input input {
  flex: 2;
  margin: 5px 0px;
}

.op-header {
  background: var(--kondor-purple);
  padding: 8px 6px;
  color: white;
  margin-top: 0.5em;
}

.op-header .contract-id {
  font-size: 0.8em;
}

.op-header .op-title {
  margin-top: 6px;
  font-size: 1.2em;
}

.op-body {
  background: #dedede;
  padding: 1px 6px 8px 6px;
}

.op-body .field-name {
  margin: 9px 0 5px 0;
  color: gray;
}

.checkbox-wrapper-2 {
  margin-left: 8px;
}

.checkbox-wrapper-2 .ikxBAC {
  appearance: none;
  background-color: #dfe1e4;
  border-radius: 72px;
  border-style: none;
  flex-shrink: 0;
  height: 20px;
  margin: 0;
  position: relative;
  height: 0px;
  width: 10px;
  padding: 10px;
}

.checkbox-wrapper-2 .ikxBAC::before {
  bottom: -6px;
  content: "";
  left: -6px;
  position: absolute;
  right: -6px;
  top: -6px;
}

.checkbox-wrapper-2 .ikxBAC,
.checkbox-wrapper-2 .ikxBAC::after {
  transition: all 100ms ease-out;
}

.checkbox-wrapper-2 .ikxBAC::after {
  background-color: #fff;
  border-radius: 50%;
  content: "";
  height: 14px;
  left: 3px;
  position: absolute;
  top: 3px;
  width: 14px;
}

.checkbox-wrapper-2 input[type="checkbox"] {
  cursor: default;
}

.checkbox-wrapper-2 .ikxBAC:hover {
  background-color: #c9cbcd;
  transition-duration: 0s;
}

.checkbox-wrapper-2 .ikxBAC:checked {
  background-color: #6e79d6;
}

.checkbox-wrapper-2 .ikxBAC:checked::after {
  background-color: #fff;
  left: 13px;
}

.checkbox-wrapper-2 :focus:not(.focus-visible) {
  outline: 0;
}

.checkbox-wrapper-2 .ikxBAC:checked:hover {
  background-color: #535db3;
}
</style>
