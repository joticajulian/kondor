<template>
  <div class="tb-container">
    <div class="wallet-interaction">
      <div>Your wallet is interacting with:</div>
      <div class="wi-title">
        {{ simplifiedDomain }}
      </div>
      <div>{{ requester.origin }}</div>
    </div>

    <div class="check-events-row">
      <button
        class="check-events-btn"
        @click="toggleEventDetails"
      >
        Check events
      </button>

      <div
        class="advanced-toggle"
        @click="toggleAdvanced"
      >
        Advanced
        <div class="switch">
          <input
            v-model="showAdvanced"
            type="checkbox"
            @click.stop
          >
          <span class="slider round" />
        </div>
      </div>
    </div>

    <div class="sending-info">
      <p>You are sending</p>
      <h2 v-if="typeof koinTransferAmount === 'number'">
        {{ koinTransferAmount.toFixed(2) }} KOIN
      </h2>
      <h2 v-else>
        Loading transfer amount...
      </h2>
    </div>

    <div
      v-if="showAdvanced"
      class="advanced-container"
    >
      <div class="subtitle">
        Headers
      </div>
      <div class="tx-header">
        <div class="group-input">
          <label for="network">Network</label>
          <input
            v-model="networkTag"
            type="text"
            disabled
          >
        </div>
        <div class="group-input">
          <input
            v-model="useFreeMana"
            type="checkbox"
            :disabled="externalSigners"
          >
          <label for="payer">Use free mana</label>
        </div>
        <div class="group-input">
          <input
            v-model="optimizeMana"
            type="checkbox"
            :disabled="externalSigners"
          >
          <label for="payer">Optimize mana</label>
        </div>
        <div class="group-input">
          <label for="max-mana">Max. mana</label>
          <input
            v-model="maxMana"
            type="text"
            :disabled="optimizeMana || externalSigners"
          >
        </div>
        <div class="group-input">
          <label for="payer">Payer</label>
          <input
            v-model="payer"
            type="text"
            :disabled="externalSigners"
          >
        </div>
        <div class="group-input">
          <label for="payee">Payee</label>
          <input
            v-model="payee"
            type="text"
            :disabled="externalSigners"
          >
        </div>
        <div class="group-input">
          <label for="nonce">Nonce</label>
          <input
            v-model="nonce"
            type="text"
            :disabled="externalSigners"
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
          class="sig-delete"
          @click="removeSigner(i)"
        >
          <div class="x">
            X
          </div>
        </div>
      </div>
    </div>

    <div class="warning-message">
      Be careful of unknown contracts as they could be malicious. Please
      interact only with contracts you trust.
    </div>

    <div v-if="!unlocked">
      <Unlock
        @onUnlock="afterUnlocked()"
        @onError="alertDanger($event)"
      />
    </div>

    <div v-if="showDetailedEvents">
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
    </div>

    <div class="action-buttons">
      <button
        class="custom-button secondary"
        @click="cancel"
      >
        Cancel
      </button>
      <button
        class="custom-button primary"
        :disabled="!unlocked || !readyToSend"
        @click="sendTransaction"
      >
        Sign
      </button>
    </div>
  </div>
</template>

<script>
import { Signer, Contract, Provider, utils, Transaction } from "koilib"

// mixins
import Message from "@/popup/mixins/Message"
import ViewHelper from "@/shared/mixins/ViewHelper"
import Storage from "@/shared/mixins/Storage"
import Sandbox from "@/shared/mixins/Sandbox"

// components
import Unlock from "@/shared/components/Unlock.vue"
// import Footnote from "@/shared/components/Footnote.vue"

import { estimateAndAdjustMana } from "../../../lib/utils"

function firstUpperCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fromHexToUtf8(hex) {
  return new TextDecoder().decode(utils.toUint8Array(hex))
}

export default {
  name: "SignSendTransaction",

  components: { Unlock },

  mixins: [Storage, Sandbox, ViewHelper, Message],

  props: {
    send: {
      type: Boolean,
      default: true,
    },
  },

  data: function () {
    return {
      koinTransferAmount: null,
      showAdvanced: false,
      data: "",
      abis: null,
      cacheAbis: {},
      abiUploadContract: null,
      requester: "",
      typeRequest: "",
      accounts: [],
      signerSelected: null,
      provider: null,
      network: {},
      networkTag: "mainnet",
      optimizeMana: true,
      maxMana: "",
      useFreeMana: false,
      payer: "",
      payee: "",
      nonce: "",
      transaction: null,
      operations: [],
      signers: [],
      externalSigners: false,
      events: [],
      receipt: null,
      manaUsed: "",
      readyToSend: false,
      footnoteMessage: "",
      unlocked: !!this.$store.state.accounts.length > 0,
      request: null,
      isOldKoilib: false,
      isOldKondor: false,
      nicknames: null,
      koinContract: null,
      freeManaSharer: null,
      cacheNicknames: {},
      loadingEvents: false,
      loadingSkipEvents: false,
      showDetailedEvents: false,
    }
  },
  computed: {
    simplifiedDomain() {
      try {
        const url = new URL(this.requester.origin)
        const hostname = url.hostname
        // Split the hostname by dots and get the second last part for the domain
        const parts = hostname.split(".")
        // Return the second last part, or the first part if there are only two parts
        return parts.length > 2 ? parts[parts.length - 2] : parts[0]
      } catch (error) {
        return this.requester.origin // Return the original if parsing fails
      }
    },
    sendingAmount() {
      if (!this.operations || this.operations.length === 0) return '0';
    
      const transferOperation = this.operations.find(op => 
        op.args && op.args.some(arg => arg.field === 'Amount_in')
      );
    
      if (transferOperation) {
        const amountArg = transferOperation.args.find(arg => arg.field === 'Amount_in');
        if (amountArg) {
        // Convert from satoshis to KOIN (assuming 8 decimal places)
          const amountInKoin = Number(amountArg.data) / 100000000;
          return amountInKoin.toFixed(8);
        }
      }
    
      return '0';
    },
  },

  watch: {
    useFreeMana: async function (newVal) {
      if (newVal) {
        this.payer = this.network.freeManaSharer
        this.payee = this.request.args.transaction.header.payer
      } else {
        this.payer = this.request.args.transaction.header.payer
      }
    },

    payer: async function () {
      this.nonce = await this.provider.getNextNonce(this.payee || this.payer)
    },

    payee: async function () {
      this.nonce = await this.provider.getNextNonce(this.payee || this.payer)
    },
    showAdvanced(newVal) {
      console.log('showAdvanced changed:', newVal);
    },
    koinTransferAmount(newVal, oldVal) {
      console.log(`koinTransferAmount changed from ${oldVal} to ${newVal}`);
    }
  },

  async mounted() {
    console.log("Component mounted");
    try {
      let requests
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
                  chain_id: "EiBncD4pKRIQWco_WRqo5Q-xnXR7JuO3PtZv983mKdKHSQ==",
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
        ]
      } else {
        requests = this.$store.state.requests.filter((r) => {
          if (this.send) return r.command === "signer:sendTransaction"
          return r.command === "signer:signTransaction"
        })
      }
      /**
     * TODO: for several requests create a list of requesters
     * and ask to the user to select one to see the details
     */
      this.request = requests[0]
      this.requester = this.request.sender
      this.typeRequest = this.send ? "send" : "sign"
      console.log("Starting decodeTransaction");
    
      await this.decodeTransaction()
    
    
        .then(() => {
          console.log("KOIN transfer amount:", this.koinTransferAmount)
        })
        .catch(error => {
          console.error("Error during setup:", error)
          this.alertDanger(error.message)
        })    
      console.log("Starting checkEvents");
      await this.checkEvents();
      console.log("checkEvents completed");

      console.log("Final KOIN transfer amount:", this.koinTransferAmount);
    } catch (error) {
      console.error("Error during component initialization:", error);
      this.alertDanger(error.message);
    }
    console.log(`Final KOIN transfer amount: ${this.koinTransferAmount}`);
  },

  methods: {
    async getAbi(contract) {
      const contractId = contract.getId()

      // take it from cache
      if (this.cacheAbis[contractId]) return this.cacheAbis[contractId]

      // try to get the ABI from local storage
      let abi = await this._getAbi(this.networkTag, contractId)
      if (abi) {
        this.cacheAbis[contractId] = abi
        return abi
      }

      // try to get the ABI from the network
      try {
        abi = await contract.fetchAbi({
          updateFunctions: false,
          updateSerializer: false,
        })
      } catch (error) {
        // empty
      }
      if (abi) {
        this.cacheAbis[contractId] = abi
        return abi
      }

      // try to get the ABI from contract upload
      if (
        this.abiUploadContract &&
        this.abiUploadContract.contractId === contractId
      ) {
        abi = JSON.parse(this.abiUploadContract.abi)
        this.cacheAbis[contractId] = abi
        return abi
      }

      // try to get ABI from the request
      if (this.abis && this.abis[contractId]) {
        abi = this.abis[contractId]
        this.cacheAbis[contractId] = abi
        return abi
      }
      return undefined
    },

    async applyFormat(format, argName, data) {
      // display address names
      const acc = this.accounts.find((a) => a.address === data)
      if (acc) {
        return `${acc.name} - ${data}`
      }

      // resolve nickname if it is an address
      try {
        const isAddress = utils.isChecksumAddress(data)
        if (isAddress) {
          const resolvedName = await this.resolveAddress(data)
          if (resolvedName) return `@${resolvedName} - ${data}`
        }
      } catch {
        // empty
      }

      if (!format || !format[argName]) return data

      // beautify numbers
      switch (format[argName].type) {
      case "number": {
        return `${utils.formatUnits(data, format[argName].decimals)} ${
          format[argName].symbol
        }`
      }
      default:
        return data
      }
    },

    async resolveAddress(address) {
      if (this.cacheNicknames[address]) return this.cacheNicknames[address]
      if (!address) return ""
      const { result } = await this.nicknames.get_tokens_by_owner({
        owner: address,
        limit: 1,
      })
      if (!result || !result.token_ids || !result.token_ids[0]) {
        return ""
      }
      this.cacheNicknames[address] = fromHexToUtf8(result.token_ids[0])
      return this.cacheNicknames[address]
    },

    /**
     * decode and beautify an operation
     * or an event
     */
    async beautifyAction(type, action) {
      const isOperation = type === "operation"
      const isEvent = type === "event"
      if (!isOperation && !isEvent) throw new Error(`invalid type ${type}`)
      const contractId = isOperation
        ? action.call_contract.contract_id
        : action.source

      const resolvedName = await this.resolveAddress(contractId)
      let contractIdName = resolvedName
        ? `${contractId} - @${resolvedName} contract`
        : contractId

      const accContract = this.accounts.find((a) => a.address === contractId)
      if (accContract) contractIdName = `${contractId} - ${accContract.name}`

      let impacted = []
      let impactsUserAccounts = false
      if (isEvent && action.impacted) {
        impacted = await Promise.all(
          action.impacted.map(async (imp) => {
            const acc = this.accounts.find((a) => a.address === imp)
            if (acc) {
              impactsUserAccounts = true
              return `${imp} - ${acc.name}`
            }

            const resolvedName = await this.resolveAddress(imp)
            if (resolvedName) return `${imp} - @${resolvedName}`
            return imp
          })
        )
      }

      try {
        const contract = new Contract({
          id: contractId,
          provider: this.provider,
        })
        const abi = await this.getAbi(contract)
        if (!abi) throw new Error(`no abi found for ${contractId}`)
        Object.keys(abi.methods).forEach((m) => {
          if (abi.methods[m].entry_point === undefined) {
            abi.methods[m].entry_point = Number(abi.methods[m]["entry-point"])
          }
          if (abi.methods[m].read_only === undefined) {
            abi.methods[m].read_only = abi.methods[m]["read-only"]
          }
        })
        contract.abi = abi
        let types
        if (abi.koilib_types) types = abi.koilib_types
        else if (abi.types) types = abi.types
        else throw new Error(`no koilib_types or types defined in the abi`)
        contract.serializer = await this.newSandboxSerializer(types)
        if (isOperation) {
          let { name, args } = await contract.decodeOperation(action)
          const { format } = contract.abi.methods[name]
          if (args) {
            args = await Promise.all(
              Object.keys(args).map(async (argName) => {
                const field = firstUpperCase(argName)
                return {
                  field,
                  data: await this.applyFormat(format, argName, args[argName]),
                }
              })
            )
          }

          this.operations.push({
            call_contract: true,
            contractId: contractIdName,
            title: firstUpperCase(contract.abi.methods[name].name || name),
            subtitle: contract.abi.methods[name].description || "",
            args,
            style: { bgOperation: true },
          })
        }

        if (isEvent) {
          let decodedEvent = await contract.decodeEvent(action)
          let format = null
          let subtitle = ""
          if (contract.abi.events && contract.abi.events[decodedEvent.name]) {
            format = contract.abi.events[decodedEvent.name].format
            subtitle = contract.abi.events[decodedEvent.name].description || ""
          }
          let args = await Promise.all(
            Object.keys(decodedEvent.args).map(async (argName) => {
              const field = firstUpperCase(argName)
              return {
                field,
                data: await this.applyFormat(
                  format,
                  argName,
                  decodedEvent.args[argName]
                ),
              }
            })
          )

          let title = firstUpperCase(decodedEvent.name)
          if (
            abi.events &&
            abi.events[action.name] &&
            abi.events[action.name].name
          )
            title = abi.events[action.name].name

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
          })
        }
      } catch (error) {
        console.log(error)
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
          })
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
          })
        }
      }
    },

    addSigner(address, signature = "") {
      const acc = this.accounts.find((a) => a.address === address)
      if (acc) {
        this.signers.push({
          name: acc.name,
          address,
          signature,
        })
      } else {
        this.signers.push({
          name: "Unknown account",
          address,
          signature,
        })
        this.externalSigners = true
        this.optimizeMana = false
      }
    },

    removeSigner(i) {
      this.signers.splice(i, 1)
    },

    async decodeTransaction() {
      try {
        this.accounts = await this._getAccounts()
        const networks = await this._getNetworks()

        const { header } = this.request.args.transaction
        this.network = networks.find((n) => n.chainId === header.chain_id)
        this.provider = new Provider(this.network.rpcNodes)
        this.provider.onError = (error) => {
          this.provider.currentNodeId = 0
          throw error
        }
        this.networkTag = this.network ? this.network.tag : "Unknown chain id"
        this.maxMana = utils.formatUnits(header.rc_limit, 8)
        this.nonce = header.nonce
        this.payer = header.payer
        this.payee = header.payee || ""

        const nicknamesAbi = await this._getAbi(
          this.networkTag,
          this.network.nicknamesContractId
        )
        this.nicknames = new Contract({
          id: this.network.nicknamesContractId,
          abi: nicknamesAbi,
          provider: this.provider,
          serializer: await this.newSandboxSerializer(
            nicknamesAbi.koilib_types
          ),
        }).functions

        const abiFreeManaSharer = await this._getAbi(
          this.network.tag,
          this.network.freeManaSharer
        )
        this.freeManaSharer = new Contract({
          id: this.network.freeManaSharer,
          abi: abiFreeManaSharer,
          provider: this.provider,
          serializer: await this.newSandboxSerializer(
            abiFreeManaSharer.koilib_types
          ),
        })

        this.koinContract = new Contract({
          id: this.network.koinContractId,
          abi: {
            ...utils.tokenAbi,
            events: {
              "koinos.contracts.token.transfer_event": {
                argument: "token.transfer_args",
              },
            },
          },
          provider: this.provider,
          serializer: await this.newSandboxSerializer(
            utils.tokenAbi.koilib_types
          ),
        })

        if (this.request.args.signerAddress) {
          this.addSigner(this.request.args.signerAddress)
        } else {
          this.addSigner(this.accounts[0].address)
          console.warn(
            `The function kondor.signer.sendTransaction will be deprecated in the future. Please use kondor.getSigner(signerAddress).sendTransaction. Consider using kondor-js@^0.2.6`
          )
          this.isOldKondor = true
        }

        if (this.request.args.transaction.signatures) {
          const signerAddresses = await Signer.fromSeed("x").recoverAddresses(
            this.request.args.transaction
          )
          signerAddresses.forEach((address, i) =>
            this.addSigner(address, this.request.args.transaction.signatures[i])
          )
        }

        if (this.request.args.optsSend && this.request.args.optsSend.abis) {
          this.abis = this.request.args.optsSend.abis
        } else if (this.request.args.abis) {
          this.abis = this.request.args.abis
        }

        const { operations } = this.request.args.transaction

        this.operations = []
        for (let i = 0; i < operations.length; i += 1) {
          const op = operations[i]
          if (op.upload_contract) {
            this.abiUploadContract = {
              contractId: op.upload_contract.contract_id,
              abi: op.upload_contract.abi,
            }
            const title = "Upload contract 😎"
            const bytecode = utils.decodeBase64url(op.upload_contract.bytecode)
            const authMessage = (a) =>
              a
                ? "The authorize function of the contract"
                : "The private key of the contract ID"
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
            })
          } else if (op.set_system_call) {
            const title = "Set system call ⚙️"
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
            })
          } else if (op.set_system_contract) {
            const title = "Set system contract ⚙️"
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
            })
          } else {
            await this.beautifyAction("operation", op)
          }
        }

        if (this.isOldKoilib || this.isOldKondor)
          this.footnoteMessage = `This website is using an old version of ${
            this.isOldKondor ? "kondor" : ""
          }${this.isOldKondor && this.isOldKoilib ? " and " : ""}${
            this.isOldKoilib ? "koilib" : ""
          }. Its support will be deprecated in a future release`
      } catch (error) {
        this.alertDanger(error.message)
        throw error
      }
    },

    afterUnlocked() {
      this.unlocked = true
    },

    async buildTransaction() {
      let rcLimit = 1e8 * Number(this.maxMana.replace("MANA", "").trim())

      if (!rcLimit) {
        if (this.externalSigners)
          throw new Error(
            [
              "no rc_limit set by the dApp and it's not possible to update",
              "it because the signatures of the external signers will",
              "become invalid",
            ].join(" ")
          )
        rcLimit = 1
        this.maxMana = "0.00000001"
      }

      this.transaction = new Transaction({
        provider: this.provider,
        options: {
          chainId: this.request.args.transaction.header.chain_id,
          rcLimit,
          nonce: this.nonce,
          payer: this.payer,
          ...(this.payee && { payee: this.payee }),
        },
      })
      this.transaction.transaction.operations =
        this.request.args.transaction.operations
      await this.transaction.prepare()
    },

    async useManaMeter() {
      const initialPayee = this.transaction.transaction.header.payee
      const initialPayer = this.transaction.transaction.header.payer
      this.transaction.transaction.header.payee = initialPayee || initialPayer
      this.transaction.transaction.header.payer = this.network.manaMeter
      this.transaction.transaction.header.rc_limit = Math.floor(
        0.9 * Number(await this.provider.getAccountRc(this.network.manaMeter))
      )
      this.transaction.transaction.id = Transaction.computeTransactionId(
        this.transaction.transaction.header
      )
      return { payee: initialPayee, payer: initialPayer }
    },

    /**
     * Sign transaction with all required signers
     */
    async signTransaction() {
      for (let i = 0; i < this.signers.length; i += 1) {
        const s = this.signers[i]
        const acc = this.$store.state.accounts.find(
          (a) => a.address === s.address
        )
        if (acc) {
          const signer = Signer.fromWif(acc.privateKey)
          signer.provider = this.provider
          signer.rcOptions = { estimateRc: false }
          await signer.signTransaction(this.transaction.transaction)
        } else {
          if (!s.signature) {
            throw new Error(`No signature for ${s.address}`)
          }
          const address = Signer.recoverAddress(
            utils.toUint8Array(this.transaction.transaction.id.slice(6)),
            utils.decodeBase64url(s.signature)
          )
          if (address !== s.address) {
            throw new Error(
              `The transaction has changed and it's not possible to generate a new signature of ${s.address}`
            )
          }
          if (!this.transaction.transaction.signatures) {
            this.transaction.transaction.signatures = []
          }
          this.transaction.transaction.signatures.push(s.signature)
        }
      }
    },

    async checkEvents() {
      console.log("checkEvents method started")
      this.loadingEvents = true
      try {
        // TODO: throw error if there are requests.length > 1
        if (process.env.VUE_APP_ENV === "test") {
          console.log("Running in test mode")
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
          }
        } else {
          await this.buildTransaction()
          console.log("Transaction built")
          if (this.optimizeMana) {
            const { payer, payee } = await this.useManaMeter()
            await this.signTransaction()
            const { header, id } = await estimateAndAdjustMana({
              payer,
              payee,
              freeManaSharer: this.freeManaSharer,
              transaction: this.transaction,
              provider: this.provider,
              koinContract: this.koinContract,
            })
            this.transaction.transaction.header = header
            this.transaction.transaction.id = id
            this.transaction.transaction.signatures = []
          }
          await this.signTransaction()
          this.receipt = await this.transaction.send({ broadcast: false })
          this.maxMana = utils.formatUnits(
            this.transaction.transaction.header.rc_limit,
            8
          )
          this.payee = this.transaction.transaction.header.payee
          this.payer = this.transaction.transaction.header.payer
        }
        console.log("Full receipt:", JSON.stringify(this.receipt, null, 2));
        this.events = []
        this.koinTransferAmount = 0
        if (this.receipt.events) {
          console.log(`Processing ${this.receipt.events.length} events`);
          for (let i = 0; i < this.receipt.events.length; i += 1) {
            const event = this.receipt.events[i]
            console.log(`Processing event ${i + 1}:`, JSON.stringify(event, null, 2));
            await this.beautifyAction("event", event)
            console.log(`Beautified event ${i + 1}:`, JSON.stringify(this.events[this.events.length - 1], null, 2));
            /*
            if (event.name === "koinos.contracts.token.transfer_event" &&
            event.source === this.network.koinContractId) {
              const decodedEvent = await this.koinContract.decodeEvent(event);
              this.koinTransferAmount = utils.formatUnits(decodedEvent.args.value, 8);
            }
            */

            if (event.source === this.network.koinContractId &&
            event.name === "koinos.contracts.token.transfer_event") {
              console.log("KOIN transfer event detected");
              const decodedEvent = await this.koinContract.decodeEvent(event);
              console.log("Decoded KOIN transfer event:", JSON.stringify(decodedEvent, null, 2));
              const amount = Number(utils.formatUnits(decodedEvent.args.value, 8));
              console.log(`KOIN transfer amount: ${amount}`);
              this.koinTransferAmount += amount; // A
            }
          }
        }
        console.log(`Final KOIN transfer amount: ${this.koinTransferAmount}`);

        console.log("Total KOIN transfer amount:", this.koinTransferAmount);
        this.manaUsed = `${utils.formatUnits(this.receipt.rc_used, 8)} mana`
        this.readyToSend = true
        this.loadingEvents = false
      } catch (error) {
        console.error("Error in checkEvents:", error);
        this.readyToSend = false
        this.loadingEvents = false
        this.alertDanger(error.message)
        throw error
      }
    },

    async skipEvents() {
      this.loadingSkipEvents = true
      try {
        await this.buildTransaction()
        if (this.optimizeMana) {
          const { payer, payee } = await this.useManaMeter()
          await this.signTransaction()
          const { header, id } = await estimateAndAdjustMana({
            payer,
            payee,
            freeManaSharer: this.freeManaSharer,
            transaction: this.transaction,
            provider: this.provider,
            koinContract: this.koinContract,
          })
          this.transaction.transaction.header = header
          this.transaction.transaction.id = id
          this.transaction.transaction.signatures = []
        }
        this.readyToSend = true
        this.loadingSkipEvents = false
      } catch (error) {
        this.readyToSend = false
        this.loadingSkipEvents = false
        this.alertDanger(error.message)
        throw error
      }
    },

    async sendTransaction() {
      let message = { id: this.request.id }

      try {
        if (
          !this.transaction.transaction.signatures ||
          this.transaction.transaction.signatures.length === 0
        ) {
          await this.signTransaction()
        }

        if (this.typeRequest === "send") {
          const receipt = await this.transaction.send({ broadcast: true })
          message.result = {
            receipt,
            transaction: this.transaction.transaction,
          }
        } else {
          message.result = this.transaction.transaction
        }
      } catch (err) {
        message.error = err.message
      }
      this.sendResponse("extension", message, this.request.sender)
      window.close()
    },

    cancel() {
      const message = {
        id: this.request.id,
        error: "sendTransaction cancelled",
      }
      this.sendResponse("extension", message, this.request.sender)
      window.close()
    },
    toggleAdvanced() {
      console.log("toggleAdvanced called, current state:", this.showAdvanced)
      this.showAdvanced = !this.showAdvanced
      console.log("New state:", this.showAdvanced)
    },
    toggleEventDetails() {
      this.showDetailedEvents = !this.showDetailedEvents;
    },
    
  },
}
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
  padding: 0 1.2em;
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

.group-input input[type="text"] {
  flex: 2;
  margin: 5px 0px;
}

.group-input input[type="checkbox"] {
  all: revert;
  margin: 1em 0.7em 1em 0;
}

.operation {
  margin-bottom: 1em;
  padding: 1.2em;
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
.top-bar {
  display: flex;
  padding: 1em;
  background: #000;
  width: 94%;
  justify-content: flex-start;
  flex-direction: column;
  padding-left: 4em;
}
.tb-title {
  color: white;
  font-size: 1.5em;
}
.tb-subtitle {
  color: #777777;
  font-size: 0.9em;
}
.tb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: space-between;
}
.logo img {
  display: none;
}
.wallet-interaction {
  text-align: left;
  background-color: var(--primary-darker);
  width: 94%;
  padding: 1em 1em 1em 2em;
  font-size: 0.8em;
  color: var(--primary-gray);
  margin-top: -1.2em;
  margin-bottom: 6em;
}

.wallet-interaction h2 {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.wallet-interaction h1 {
  font-size: 24px;
  color: #fff;
  margin-bottom: 5px;
}

.wallet-interaction p {
  font-size: 14px;
  color: #888;
}

.check-events-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 92%;
  position: absolute;
  top: 7.3em;
}

.check-events-btn {
  background-color: transparent;
  color: var(--primary-gray);
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  text-decoration: underline;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  color: var(--primary-gray);
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #7161ef;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.sending-info {
  background-color: var(--primary-darker);
  padding: 1.5em;
  border-radius: 0.9em;
  text-align: center;
  margin-bottom: 1.5em;
  width: 100%;
}

.sending-info p {
  color: #888;
  margin-bottom: 5px;
}

.sending-info h2 {
  color: #fff;
  font-size: 24px;
}

.warning-message {
  color: #ffa500;
  padding: 1.2em 3em;
}

.action-buttons {
  display: flex;
  margin-bottom: 4em;
  justify-content: space-between;
  width: 90%;
  padding: 0 2em;
  gap: 1em;
}

.cancel-btn,
.sign-btn {
  width: 48%;
  padding: 15px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #444;
  color: #fff;
}

.sign-btn {
  background-color: #7161ef;
  color: #fff;
}
.wi-title {
  font-size: 2.2em;
  color: #fff;
  font-weight: bold;
}
.advanced-toggle {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.advanced-toggle label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.advanced-toggle input[type="checkbox"] {
  margin-right: 8px;
}
.custom-checkbox {
  margin: 0 !important;
  width: 1px;
  height: 1px;
}
.advanced-container {
  width: 80%;
}
.mana-used {
  font-size: 1.2em;
  padding: 0 1.2em;
}
</style>
