<template>
  <div class="container">
    <div class="column">
      <Footnote
        v-if="footnoteMessage"
        :message="footnoteMessage"
      />
      <div class="title">
        Signature request {{ send ? "and send" : "" }}
      </div>
      <Footnote
        message="Be careful of unknown contracts as they could be malicious. Please interact only with contracts you trust"
      />
      <div class="advanced">
        Advanced
        <div class="checkbox-wrapper-2">
          <input
            v-model="advanced"
            type="checkbox"
            class="sc-gJwTLC ikxBAC"
          >
        </div>
      </div>
      <div>
        Signature {{ send ? "and send" : "" }} requested by
        <div class="requester">
          {{ requester.origin }}
        </div>
      </div>
      <div
        v-if="advanced"
        class="group-add-signer"
      >
        <select v-model="typeRequest">
          <option value="sign">
            Only sign transaction
          </option>
          <option value="send">
            Sign and send transaction
          </option>
        </select>
      </div>

      <div
        v-if="advanced"
        class="subtitle"
      >
        Headers
      </div>
      <div
        v-if="advanced"
        class="tx-header"
      >
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
        :key="'op' + i"
        class="operation"
      >
        <div
          class="op-header"
          :class="op.style"
        >
          <div
            v-if="op.call_contract"
            class="contract-id"
          >
            {{ op.contractId }}
          </div>
          <div class="op-title">
            {{ op.title }}
          </div>
          <div class="op-subtitle">
            {{ op.subtitle }}
          </div>
        </div>
        <div class="op-body">
          <div
            v-for="(arg, j) in op.args"
            :key="'f' + j"
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
      <div
        v-for="(signer, i) in signers"
        :key="'s' + i"
        class="signature"
      >
        <div class="sig-details">
          <div class="name">
            {{ signer.name }}
          </div>
          <div class="address">
            {{ signer.address }}
          </div>
        </div>
        <div
          v-if="advanced"
          class="sig-delete"
          @click="removeSigner(i)"
        >
          <div class="x">
            X
          </div>
        </div>
      </div>

      <div
        v-if="advanced"
        class="group-add-signer"
      >
        <select v-model="signerSelected">
          <option
            v-for="account in accounts"
            :key="account.address"
            :value="account.address"
          >
            {{ account.name }} - {{ account.address }}
          </option>
        </select>

        <button @click="addSigner(signerSelected)">
          Add signer
        </button>
      </div>

      <div v-if="!unlocked">
        <Unlock
          @onUnlock="afterUnlocked()"
          @onError="alertDanger($event)"
        />
      </div>
      <div class="container">
        <button
          :disabled="!unlocked"
          @click="checkEvents"
        >
          Check events
        </button>
        <div
          class="cancel-button"
          @click="skipEvents"
        >
          Skip <br><span class="not-recommended">(not recommended)</span>
        </div>
      </div>
      <div
        v-if="receipt"
        class="subtitle"
      >
        Events
      </div>
      <div
        v-for="(ev, i) in events"
        :key="'ev' + i"
        class="operation"
      >
        <div
          v-if="receipt"
          class="ev-header"
          :class="ev.style"
        >
          <div class="contract-id">
            {{ ev.contractId }}
          </div>
          <div class="op-title">
            {{ ev.title }}
          </div>
          <div class="op-subtitle">
            {{ ev.subtitle }}
          </div>
        </div>
        <div
          v-if="receipt"
          class="ev-body"
        >
          <div
            v-for="(arg, j) in ev.args"
            :key="'fe' + j"
          >
            <div class="field-name">
              {{ arg.field }}
            </div>
            <div class="field-data">
              {{ arg.data }}
            </div>
          </div>
        </div>
        <div
          v-if="receipt"
          class="ev-foot"
          :class="ev.style"
        >
          <div>Impacted accounts</div>
          <div
            v-for="(imp, k) in ev.impacted"
            :key="'imp' + k"
            class="ev-impacted-account"
          >
            {{ imp }}
          </div>
          <div style="margin-top: 0.5em">
            {{
              ev.impactsUserAccounts
                ? "It impacts your accounts"
                : "It doesn't impact your accounts"
            }}
          </div>
        </div>
      </div>
      <div
        v-if="receipt"
        class="mana-used"
      >
        Mana limit: {{ maxMana }}
      </div>
      <div
        v-if="receipt"
        class="mana-used"
      >
        Mana consumption: {{ manaUsed }}
      </div>
      <div
        v-if="readyToSend"
        class="container"
      >
        <button
          :disabled="!unlocked"
          @click="sendTransaction"
        >
          Send
        </button>
        <div
          class="cancel-button"
          @click="cancel"
        >
          Cancel
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Signer, Contract, Provider, utils, Transaction } from "koilib";

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
      advanced: false,
      data: "",
      abis: null,
      abiUploadContract: null,
      requester: "",
      typeRequest: "",
      accounts: [],
      signerSelected: null,
      provider: null,
      network: "mainnet",
      maxMana: "",
      payer: "1KRHqJ7uy5b4HZa5Une2dydYYFysVDyBwx",
      payee: "1KRHqJ7uy5b4HZa5Une2dydYYFysVDyBwx",
      nonce: "",
      transaction: null,
      transactionSigned: false,
      operations: [],
      signers: [],
      events: [],
      receipt: null,
      manaUsed: "",
      readyToSend: false,
      footnoteMessage: "",
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
                {
                  call_contract: {
                    args: "ChkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LEhkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LGAo=",
                    contract_id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
                    entry_point: 6703981540,
                  },
                },
                {
                  upload_contract: {
                    contract_id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
                    bytecode:
                      "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gTWF4aW1lIG1vbGxpdGlhLAptb2xlc3RpYWUgcXVhcyB2ZWwgc2ludCBjb21tb2RpIHJlcHVkaWFuZGFlIGNvbnNlcXV1bnR1ciB2b2x1cHRhdHVtIGxhYm9ydW0KbnVtcXVhbSBibGFuZGl0aWlzIGhhcnVtIHF1aXNxdWFtIGVpdXMgc2VkIG9kaXQgZnVnaWF0IGl1c3RvIGZ1Z2EgcHJhZXNlbnRpdW0Kb3B0aW8sIGVhcXVlIHJlcnVtISBQcm92aWRlbnQgc2ltaWxpcXVlIGFjY3VzYW50aXVtIG5lbW8gYXV0ZW0uIFZlcml0YXRpcwpvYmNhZWNhdGkgdGVuZXR1ciBpdXJlIGVpdXMgZWFydW0gdXQgbW9sZXN0aWFzIGFyY2hpdGVjdG8gdm9sdXB0YXRlIGFsaXF1YW0KbmloaWwsIGV2ZW5pZXQgYWxpcXVpZCBjdWxwYSBvZmZpY2lhIGF1dCEgSW1wZWRpdCBzaXQgc3VudCBxdWFlcmF0LCBvZGl0LAp0ZW5ldHVyIGVycm9yLCBoYXJ1bSBuZXNjaXVudCBpcHN1bSBkZWJpdGlzIHF1YXMgYWxpcXVpZC4gUmVwcmVoZW5kZXJpdCwKcXVpYS4gUXVvIG5lcXVlIGVycm9yIHJlcHVkaWFuZGFlIGZ1Z2E_IElwc2EgbGF1ZGFudGl1bSBtb2xlc3RpYXMgZW9zIApzYXBpZW50ZSBvZmZpY2lpcyBtb2RpIGF0IHN1bnQgZXhjZXB0dXJpIGV4cGVkaXRhIHNpbnQ_IFNlZCBxdWlidXNkYW0KcmVjdXNhbmRhZSBhbGlhcyBlcnJvciBoYXJ1bSBtYXhpbWUgYWRpcGlzY2kgYW1ldCBsYWJvcnVtLiBQZXJzcGljaWF0",
                    abi: "{}",
                    authorizes_call_contract: true,
                    authorizes_transaction_application: true,
                    authorizes_upload_contract: false,
                  },
                },
              ],
              header: {
                chain_id: "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==",
                rc_limit: "0",
                nonce: "KAE=",
                operation_merkle_root:
                  "EiBCeHF0tLBk6Dq0yIrlZ2Z9CzO4tv5FsYv868D6fjHeAg==",
                payer: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
              },
              signatures: [
                "IEUp4G5lT_6kuCvCKEvq20ZvBZoiJd-U3vs4MdZ8u7XgKDm4X7gmyUugp8ggt0lX1hjvA3KJYVRfV63FWnko35A=",
              ],
              id: "0x1220d66c608bf375cdd310f021fc61d2c084f7bcc52734a688dfd302dce2daa6c2e3",
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
                    format: {
                      value: {
                        type: "number",
                        decimals: 8,
                        symbol: "KOIN",
                      },
                    },
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
                events: {
                  "koinos.contracts.token.transfer_event": {
                    argument: "koinos.contracts.token.transfer_event",
                    format: {
                      value: {
                        type: "number",
                        decimals: 8,
                        symbol: "KOIN",
                      },
                    },
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
    this.typeRequest = this.send ? "send" : "sign";
    this.decodeTransaction();
  },

  methods: {
    async getAbi(contract) {
      const contractId = contract.getId();
      // try to get the ABI from local storage
      let abi = await this._getAbi(this.network, contractId);
      if (abi) return abi;

      // try to get the ABI from the network
      try {
        abi = await contract.fetchAbi({
          updateFunctions: false,
          updateSerializer: false,
        });
      } catch (error) {
        // empty
      }
      if (abi) return abi;

      // try to get the ABI from contract upload
      if (
        this.abiUploadContract &&
        this.abiUploadContract.contractId === contractId
      ) {
        return JSON.parse(this.abiUploadContract.abi);
      }

      // try to get ABI from the request
      return this.abis ? this.abis[contractId] : undefined;
    },

    applyFormat(format, argName, data) {
      // display address names
      const acc = this.accounts.find((a) => a.address === data);
      if (acc) {
        return `${acc.name} - ${data}`;
      }

      if (!format || !format[argName]) return data;

      // beautify numbers
      switch (format[argName].type) {
      case "number": {
        return `${utils.formatUnits(data, format[argName].decimals)} ${
          format[argName].symbol
        }`;
      }
      default:
        return data;
      }
    },

    /**
     * decode and beautify an operation
     * or an event
     */
    async beautifyAction(type, action) {
      const isOperation = type === "operation";
      const isEvent = type === "event";
      if (!isOperation && !isEvent) throw new Error(`invalid type ${type}`);
      const contractId = isOperation
        ? action.call_contract.contract_id
        : action.source;

      let contractIdName = contractId;
      switch (contractId) {
      // mainnet
      case "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL":
        contractIdName = `${contractId} - KOIN Token ☑️`;
        break;
      case "1AdzuXSpC6K9qtXdCBgD5NUpDNwHjMgrc9":
        contractIdName = `${contractId} - VHP Token ☑️`;
        break;
      case "159myq5YUhhoVWu3wsHKHiJYKPKGUrGiyv":
        contractIdName = `${contractId} - PoB Contract ☑️`;
        break;
      case "18zw3ZokdfHtudzaWAUnU4tUvKzKiJeN76":
        contractIdName = `${contractId} - Claim Contract ☑️`;
        break;
      case "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS":
        contractIdName = `${contractId} - Burnkoin pool ☑️`;
        break;
      case "1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy":
        contractIdName = `${contractId} - pVHP Token ☑️`;
        break;
      case "1DGNQQimsyBQajzQdWXY96m84YyDC2pUpB":
        contractIdName = `${contractId} - Fogata JGA#1 ☑️`;
        break;
      case "1MbsVfNw6yzQqA8499d8KQj8qdLyRs8CzW":
        contractIdName = `${contractId} - Fogata JGA#2 ☑️`;
        break;
      case "14iHqMGBznBM7xJXhkrQ266FgoFdymCqLM":
        contractIdName = `${contractId} - Fogata KoinForge ☑️`;
        break;
      case "1KfD7n93LnnihyygopWUVTkbtWVe5aXXGW":
        contractIdName = `${contractId} - Fogata Koinos en español ☑️`;
        break;
      case "18UYKhWVCbTpFs8oYC54xoiCQQthhEkX7m":
        contractIdName = `${contractId} - Fogata Koinnoisseur's pure KOIN Pool ☑️`;
        break;
      case "15jueaBcMieDCMGw6wAmEK6cNSUVicknG1":
        contractIdName = `${contractId} - Fogata Koinnoisseur's pure VAPOR Pool ☑️`;
        break;

        // harbinger
      case "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ":
        contractIdName = `${contractId} - tKOIN Token ☑️`;
        break;
      case "1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8":
        contractIdName = `${contractId} - VHP Token ☑️`;
        break;
      case "198RuEouhgiiaQm7uGfaXS6jqZr6g6nyoR":
        contractIdName = `${contractId} - PoB Contract ☑️`;
        break;
      default:
        break;
      }

      const accContract = this.accounts.find((a) => a.address === contractId);
      if (accContract) contractIdName = `${contractId} - ${accContract.name}`;

      let impacted = [];
      let impactsUserAccounts = false;
      if (isEvent && action.impacted) {
        impacted = action.impacted.map((imp) => {
          const acc = this.accounts.find((a) => a.address === imp);
          if (!acc) return imp;
          impactsUserAccounts = true;
          return `${imp} - ${acc.name}`;
        });
      }

      try {
        const contract = new Contract({
          id: contractId,
          provider: this.provider,
        });
        const abi = await this.getAbi(contract);
        if (!abi) throw new Error(`no abi found for ${contractId}`);
        Object.keys(abi.methods).forEach((m) => {
          if (abi.methods[m].entry_point === undefined) {
            abi.methods[m].entry_point = Number(abi.methods[m]["entry-point"]);
          }
          if (abi.methods[m].read_only === undefined) {
            abi.methods[m].read_only = abi.methods[m]["read-only"];
          }
        });
        contract.abi = abi;
        let types;
        if (abi.koilib_types) types = abi.koilib_types;
        else if (abi.types) types = abi.types;
        else throw new Error(`no koilib_types or types defined in the abi`);
        contract.serializer = await this.newSandboxSerializer(types);
        if (isOperation) {
          let { name, args } = await contract.decodeOperation(action);
          const { format } = contract.abi.methods[name];
          if (args) {
            args = Object.keys(args).map((argName) => {
              const field = firstUpperCase(argName);
              return {
                field,
                data: this.applyFormat(format, argName, args[argName]),
              };
            });
          }

          this.operations.push({
            call_contract: true,
            contractId: contractIdName,
            title: firstUpperCase(contract.abi.methods[name].name || name),
            subtitle: contract.abi.methods[name].description || "",
            args,
            style: { bgOperation: true },
          });
        }

        if (isEvent) {
          let decodedEvent = await contract.decodeEvent(action);
          let format = null;
          let subtitle = "";
          if (contract.abi.events && contract.abi.events[decodedEvent.name]) {
            format = contract.abi.events[decodedEvent.name].format;
            subtitle = contract.abi.events[decodedEvent.name].description || "";
          }
          let args = Object.keys(decodedEvent.args).map((argName) => {
            const field = firstUpperCase(argName);
            return {
              field,
              data: this.applyFormat(
                format,
                argName,
                decodedEvent.args[argName]
              ),
            };
          });

          let title = firstUpperCase(decodedEvent.name);
          if (
            abi.events &&
            abi.events[action.name] &&
            abi.events[action.name].name
          )
            title = abi.events[action.name].name;

          this.events.push({
            contractId: contractIdName,
            title,
            subtitle,
            args,
            impactsUserAccounts,
            impacted,
            style: {
              bgEvent: impactsUserAccounts,
              gray: !impactsUserAccounts,
            },
          });
        }
      } catch (error) {
        console.log(error);
        if (isOperation) {
          this.operations.push({
            call_contract: true,
            contractId: contractIdName,
            title: action.call_contract.entry_point,
            subtitle:
              "⚠️ This operation couldn't be decoded. Only continue if you know what you are doing.",
            args: [
              {
                field: "Args",
                data: action.call_contract.args,
              },
            ],
            style: {
              red: true,
            },
          });
        }

        if (isEvent) {
          this.events.push({
            contractId: contractIdName,
            title: firstUpperCase(action.name),
            subtitle:
              "⚠️ This event couldn't be decoded. Only continue if you understand the risks.",
            args: [
              {
                field: "Args",
                data: action.data,
              },
            ],
            impactsUserAccounts,
            impacted,
            style: {
              red: impactsUserAccounts,
              gray: !impactsUserAccounts,
            },
          });
        }
      }
    },

    addSigner(address, signature = "") {
      const acc = this.accounts.find((a) => a.address === address);
      if (acc) {
        this.signers.push({
          name: acc.name,
          address,
          signature,
        });
      } else {
        this.signers.push({
          name: "Unknown account",
          address,
          signature,
        });
      }
    },

    removeSigner(i) {
      this.signers.splice(i, 1);
    },

    async decodeTransaction() {
      try {
        this.accounts = await this._getAccounts();
        const networks = await this._getNetworks();

        const { header } = this.request.args.transaction;
        const network = networks.find((n) => n.chainId === header.chain_id);
        this.provider = new Provider(network.rpcNodes);
        this.network = network ? network.tag : "Unknown chain id";
        this.maxMana = utils.formatUnits(header.rc_limit, 8);
        this.nonce = header.nonce;
        this.payer = header.payer;
        this.payee = header.payee || "";
        if (this.request.args.signerAddress) {
          this.addSigner(this.request.args.signerAddress);
        } else {
          this.addSigner(this.accounts[0].address);
          console.warn(
            `The function kondor.signer.sendTransaction will be deprecated in the future. Please use kondor.getSigner(signerAddress).sendTransaction. Consider using kondor-js@^0.2.6`
          );
          this.isOldKondor = true;
        }

        if (this.request.args.transaction.signatures) {
          const signerAddresses = await Signer.fromSeed("x").recoverAddresses(
            this.request.args.transaction
          );
          signerAddresses.forEach((address, i) =>
            this.addSigner(address, this.request.args.transaction.signatures[i])
          );
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
          if (op.upload_contract) {
            this.abiUploadContract = {
              contractId: op.upload_contract.contract_id,
              abi: op.upload_contract.abi,
            };
            const title = "Upload contract 😎";
            const bytecode = utils.decodeBase64url(op.upload_contract.bytecode);
            const authMessage = (a) =>
              a
                ? "The authorize function of the contract"
                : "The private key of the contract ID";
            this.operations.push({
              upload_contract: true,
              title,
              args: [
                {
                  field: "Contract ID",
                  data: op.upload_contract.contract_id,
                },
                {
                  field: "Bytecode size",
                  data: bytecode.length,
                },
                {
                  field: "SHA256",
                  data: utils.toHexString(
                    new Uint8Array(
                      await crypto.subtle.digest("SHA-256", bytecode)
                    )
                  ),
                },
                {
                  field: "Who approves contract calls?",
                  data: authMessage(
                    op.upload_contract.authorizes_call_contract
                  ),
                },
                {
                  field: "Who approves consumption of mana?",
                  data: authMessage(
                    op.upload_contract.authorizes_transaction_application
                  ),
                },
                {
                  field: "Who approves new contract updates?",
                  data: authMessage(
                    op.upload_contract.authorizes_upload_contract
                  ),
                },
              ],
              style: { bgUploadContract: true },
            });
          } else if (op.set_system_call) {
            const title = "Set system call ⚙️";
            this.operations.push({
              set_system_call: true,
              title,
              args: [
                {
                  field: "Call ID",
                  data: op.set_system_call.call_id,
                },
                {
                  field: "Target",
                  data: JSON.stringify(op.set_system_call.target),
                },
              ],
              style: { bgUploadContract: true },
            });
          } else if (op.set_system_contract) {
            const title = "Set system contract ⚙️";
            this.operations.push({
              set_system_contract: true,
              title,
              args: [
                {
                  field: "Contract ID",
                  data: op.set_system_contract.contract_id,
                },
                {
                  field: "System contract",
                  data: op.set_system_contract.system_contract,
                },
              ],
              style: { bgUploadContract: true },
            });
          } else {
            await this.beautifyAction("operation", op);
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
    },

    async buildTransaction() {
      this.transaction = new Transaction({
        provider: this.provider,
        options: {
          chainId: this.request.args.transaction.header.chain_id,
          rcLimit: utils.parseUnits(this.maxMana.replace("MANA", "").trim(), 8),
          nonce: this.nonce,
          payer: this.payer,
          ...(this.payee && { payee: this.payee }),
        },
      });
      this.transaction.transaction.operations =
        this.request.args.transaction.operations;
      await this.transaction.prepare();
    },

    async signTransaction() {
      await Promise.all(
        this.signers.map(async (s) => {
          const acc = this.$store.state.accounts.find(
            (a) => a.address === s.address
          );
          if (acc) {
            const signer = Signer.fromWif(acc.privateKey);
            await signer.signTransaction(this.transaction.transaction);
          } else {
            if (!s.signature) {
              throw new Error(`No signature for ${s.address}`);
            }
            const address = Signer.recoverAddress(
              utils.toUint8Array(this.transaction.transaction.id.slice(6)),
              utils.decodeBase64url(s.signature)
            );
            if (address !== s.address) {
              throw new Error(
                `The transaction has changed and it's not possible to generate a new signature of ${s.address}`
              );
            }
            if (!this.transaction.transaction.signatures) {
              this.transaction.transaction.signatures = [];
            }
            this.transaction.transaction.signatures.push(s.signature);
          }
        })
      );
      this.transactionSigned = true;
    },

    async checkEvents() {
      try {
        // TODO: throw error if there are requests.length > 1
        if (process.env.VUE_APP_ENV === "test") {
          this.receipt = {
            id: "0x1220cf763bc42c18091fddf7a9d3c2963f95102b64a019d76c20215163ca9d900ff2",
            payer: "16MT1VQFgsVxEfJrSGinrA5buiqBsN5ViJ",
            max_payer_rc: "930000000",
            rc_limit: "930000000",
            rc_used: "470895",
            network_bandwidth_used: "311",
            compute_bandwidth_used: "369509",
            events: [
              {
                source: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
                name: "koinos.contracts.token.transfer_event",
                data: "ChkAOraorkYwQTkrfp9ViHFI2CJvmCQh2mz7EhkArriH22GZ1VJLkeJ-x4JUGF4zPAEZrNUiGMCEPQ==",
                impacted: [
                  "1Gvqdo9if6v6tFomEuTuMWP1D7H7U9yksb",
                  "16MT1VQFgsVxEfJrSGinrA5buiqBsN5ViJ",
                ],
              },
              {
                source: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
                name: "koinos.contracts.token.transfer_event",
                data: "ChkAOraorkYwQTkrfp9ViHFI2CJvmCQh2mz7EhkArriH22GZ1VJLkeJ-x4JUGF4zPAEZrNUiGMCEPQ==",
                impacted: [
                  "1Gvqdo9if6v6tFomEuTuMWP1D7H7U9yksb",
                  "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
                ],
              },
            ],
          };
        } else {
          await this.buildTransaction();
          await this.signTransaction();
          this.receipt = await this.transaction.send({ broadcast: false });
        }
        this.events = [];
        if (this.receipt.events) {
          for (let i = 0; i < this.receipt.events.length; i += 1) {
            const event = this.receipt.events[i];
            await this.beautifyAction("event", event);
          }
        }
        this.manaUsed = `${utils.formatUnits(this.receipt.rc_used, 8)} MANA`;
        this.readyToSend = true;
      } catch (error) {
        this.readyToSend = false;
        this.alertDanger(error.message);
        throw error;
      }
    },

    async skipEvents() {
      try {
        await this.buildTransaction();
        this.readyToSend = true;
      } catch (error) {
        this.readyToSend = false;
        this.alertDanger(error.message);
        throw error;
      }
    },

    async sendTransaction() {
      let message = { id: this.request.id };

      try {
        if (!this.transactionSigned) {
          await this.signTransaction();
        }

        if (this.typeRequest === "send") {
          const receipt = await this.transaction.send({ broadcast: true });
          message.result = {
            receipt,
            transaction: this.transaction.transaction,
          };
        } else {
          message.result = this.transaction.transaction;
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
  margin: 1em 0em 0.5em 0em;
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
  text-align: center;
  margin-bottom: 2em;
  cursor: pointer;
}
.cancel-button .not-recommended {
  font-size: 0.8em;
  text-transform: none;
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

.operation {
  margin-bottom: 1em;
}

.red {
  background: #dd3d3d;
}

.gray {
  background: #7e7e7e;
}

.bgUploadContract {
  background: #308b9b;
}

.bgEvent {
  background: #c19b10;
}

.bgOperation {
  background: var(--kondor-purple);
}

.op-header {
  padding: 8px 6px;
  color: white;
  margin-top: 0.5em;
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;
}

.contract-id {
  font-size: 0.8em;
}

.op-title {
  font-size: 1.2em;
  margin-top: 0.5em;
}

.op-subtitle {
  margin-top: 0.5em;
  font-size: 0.8em;
}

.op-body {
  background: #dedede;
  padding: 1px 6px 8px 6px;
  word-break: break-all;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
}

.field-name {
  margin: 9px 0 5px 0;
  color: gray;
}

.ev-header {
  padding: 8px 6px;
  color: white;
  margin-top: 0.5em;
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;
}

.ev-body {
  background: #dedede;
  padding: 1px 6px 8px 6px;
  word-break: break-all;
}

.ev-foot {
  padding: 8px 6px;
  color: white;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
}

.ev-impacted-account {
  font-size: 0.8em;
}

.signature {
  display: flex;
  margin-bottom: 1em;
}

.sig-details {
  flex: 8;
  background: #dedede;
  padding: 0.7em 0.5em;
}

.sig-details .name {
  font-size: 1.2em;
}

.sig-details .address {
  font-size: 0.8em;
}

.sig-delete {
  flex: 1;
  display: flex;
  background: #dd3d3d;
  font-size: 1.5em;
  color: #ffffff;
  cursor: pointer;
}

.sig-delete .x {
  margin: auto;
}

.group-add-signer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.group-add-signer button {
  width: 7em;
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
