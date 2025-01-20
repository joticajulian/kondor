<template>
  <div class="tb-container">
    <div class="wallet-interaction">
      <div>Your wallet is interacting with:</div>
      <div class="wi-title">
        {{ simplifiedDomain }}
      </div>
      <div>{{ requester.origin }}</div>
    </div>
    <div
      class="op-viewmore set-allowance-title"
      @click="toggleSettingAllowance()"
    >
      Set allowance {{ settingAllowance ? "▲" : "▼" }}
    </div>
    <div
      v-if="settingAllowance"
      class="setting-allowance"
    >
      <div class="group-input">
        <label>Token</label>
        <select
          id="select-token"
          v-model="tokenId2"
          name="select-token"
          class="flex2 pad1"
        >
          <option
            v-for="token in tokens"
            :key="token.contractId"
            :value="token.contractId"
          >
            {{ token.nickname ? `@${token.nickname}` : token.contractId }}
          </option>
        </select>
      </div>
      <div class="group-input">
        <label>Spender</label>
        <input
          v-model="spender"
          type="text"
          placeholder="Enter address or nickname"
          :class="
            isSpenderValidated &&
              !isSpenderValidating &&
              spender.length > 0 &&
              !isSpenderValid
              ? 'invalid'
              : ''
          "
          @input="validateSpenderDebounced()"
          @paste="onPaste"
          @keyup="changeSpender()"
        >
      </div>
      <div style="display: flex; align-items: center">
        <span
          v-if="isSpenderValidating"
          class="spinner material-icons"
        >sync</span>
        <span
          v-else-if="isSpenderValid"
          class="success material-icons"
        >check_circle_outline</span>
        <span
          v-else-if="isSpenderValidated && spender.length > 0"
          class="error material-icons"
        >error_outline</span>
        <div
          v-if="!!resolvedAddress"
          class="info"
        >
          {{ resolvedMessage }}
        </div>
      </div>
      <div class="group-input">
        <label>Amount</label>
        <input
          v-model="amount"
          type="number"
          :min="0"
          :class="!isAmountValid ? 'invalid' : ''"
          class="flex2 m0"
          @input="validateAmountDebounced()"
        >
      </div>
      <div class="action-allowance">
        <button
          :disabled="!isApprovalButtonEnabled"
          class="custom-button primary"
          @click="addApproval"
        >
          <span
            v-if="addingApproval"
            class="loader2"
          />
          <span v-else>approve</span>
        </button>
      </div>
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
        <div class="op-group">
          <div class="op-header-image">
            <img
              v-if="op.contractMetadata && op.contractMetadata.image"
              :src="op.contractMetadata.image"
              alt="operation-icon"
            >
            <img
              v-else
              src="../../../public/images/check.svg"
              alt="operation-icon"
            >
          </div>
          <div
            v-if="op.nickname || true"
            class="op-title"
          >
            {{
              op.contractMetadata && op.contractMetadata.nickname
                ? op.contractMetadata.nickname + " -"
                : ""
            }}
            {{ op.title }}
          </div>
        </div>
        <div
          class="op-viewmore"
          @click="toggleViewMoreOperation(i)"
        >
          {{ op.viewMore ? "▲" : "▼" }}
        </div>
      </div>
      <transition name="fade">
        <div
          v-if="op.viewMore"
          class="op-body"
        >
          <div class="op-contractid">
            {{ op.contractId }}
          </div>
          <div
            v-for="(arg, j) in op.args"
            :key="'f' + j"
            class="op-body-row"
          >
            <div class="field-name">
              {{ arg.field }}
            </div>
            <div class="field-data">
              {{ arg.data }}
            </div>
          </div>
          <div class="op-remove-section">
            <button
              class="op-button-remove"
              @click="removeOperation(i)"
            >
              <span
                v-if="true"
                class="s1 material-icons"
              >delete</span>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div
      v-if="true"
      style="width: 100%"
    >
      <div class="subtitle">
        Events
        <span
          v-if="loadingEvents"
          class="loader2"
          style="vertical-align: middle"
        />
        <div
          v-if="!loadingEvents"
          class="update-events"
          @click="checkEvents"
        >
          <img
            src="../../../public/images/circle-arrow-icon.svg"
            alt=""
          >
        </div>
      </div>
      <div
        v-for="(ev, i) in filteredEvents"
        :key="'ev' + i"
        class="operation"
      >
        <div
          v-if="receipt"
          class="op-header"
          :class="ev.style"
        >
          <div class="op-group">
            <div class="op-header-image2">
              <img
                v-if="ev.contractMetadata && ev.contractMetadata.image"
                :src="ev.contractMetadata.image"
              >
              <img
                v-else
                src="../../../public/images/check.svg"
                alt="operation-icon"
              >
            </div>
            <div class="op-title-group">
              <div class="op-title">
                {{
                  ev.contractMetadata && ev.contractMetadata.nickname
                    ? ev.contractMetadata.nickname + " -"
                    : ""
                }}
                {{ ev.title }}
              </div>
              <div
                v-if="ev.positiveValue"
                class="op-positive-value"
              >
                {{ ev.positiveValue }}
              </div>
            </div>
          </div>
          <div
            class="op-viewmore"
            @click="toggleViewMoreEvent(ev.id)"
          >
            {{ ev.viewMore ? "▲" : "▼" }}
          </div>
        </div>
        <transition name="fade">
          <div
            v-if="receipt && ev.viewMore"
            class="op-body2"
          >
            <div class="op-contractid">
              {{ ev.contractId }}
            </div>
            <div class="op-subtitle">
              {{ ev.subtitle }}
            </div>
            <div
              v-for="(arg, j) in ev.args"
              :key="'fe' + j"
              class="op-body-row"
            >
              <div class="field-name">
                {{ arg.field }}
              </div>
              <div class="field-data">
                {{ arg.data }}
              </div>
            </div>
          </div>
        </transition>
        <transition name="fade">
          <div
            v-if="receipt && ev.viewMore"
            class="op-body"
            :class="ev.style"
          >
            <div
              class="op-contractid"
              style="margin-bottom: 0.5em"
            >
              Impacted accounts
            </div>
            <div
              v-for="(imp, k) in ev.impacted"
              :key="'imp' + k"
              class="ev-impacted-account"
            >
              {{ imp }}
            </div>
            <div style="margin-top: 0.5em; color: var(--primary-gray)">
              {{
                ev.impactsUserAccounts
                  ? "It impacts your accounts"
                  : "It doesn't impact your accounts"
              }}
            </div>
          </div>
        </transition>
      </div>
      <div
        v-if="showAllEvents || events.length > filteredEvents.length"
        class="op-viewmore"
        style="padding: 0 2em"
        @click="toggleFilteredEvents"
      >
        {{
          showAllEvents
            ? "View less events"
            : `View the other ${events.length - filteredEvents.length} events`
        }}
      </div>
    </div>

    <div class="check-events-row">
      <!--<button
        class="check-events-btn"
        @click="toggleEventDetails"
      >
        Check events
      </button>-->

      <div
        class="op-viewmore"
        @click="toggleAdvanced"
      >
        {{ showAdvanced ? "View less" : "Advanced" }}
      </div>
    </div>

    <div
      v-if="showAdvanced"
      class="advanced-container"
    >
      <div
        v-if="externalSigners"
        class="warning-message"
      >
        It is not possible to modify the transaction because it is already
        signed by another address.
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

      <div class="group-add-signer">
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

    <div class="action-buttons">
      <button
        class="custom-button secondary"
        @click="cancel"
      >
        Cancel
      </button>
      <button
        class="custom-button primary"
        :disabled="!unlocked || loadingEvents || loadingSkipEvents"
        @click="sendTransaction"
      >
        Sign
      </button>
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
// import Footnote from "@/shared/components/Footnote.vue"

import { estimateAndAdjustMana } from "../../../lib/utils";
import { testReceipt, testRequests } from "../../services/utils";

function firstUpperCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatFieldName(f) {
  return firstUpperCase(
    f
      .slice(f.lastIndexOf(".") + 1)
      .split("_")
      .join(" ")
  );
}

function fromHexToUtf8(hex) {
  return new TextDecoder().decode(utils.toUint8Array(hex));
}

function fromUtf8ToHex(utf8) {
  return "0x" + utils.toHexString(new TextEncoder().encode(utf8));
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
      showAdvanced: false,
      showAllEvents: false,
      data: "",
      abis: null,
      cacheAbis: {},
      abiUploadContract: null,
      requester: "",
      typeRequest: "",
      accounts: [],
      signerSelected: null,
      provider: null,
      serializerToken: null,
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
      rawOperations: [],
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
      cacheNicknameImages: {},
      loadingEvents: false,
      loadingSkipEvents: false,
      showDetailedEvents: false,
      tokens: null,
      // approval
      settingAllowance: false,
      addingApproval: false,
      tokenId2: "",
      spender: "",
      isSpenderValidated: false,
      isSpenderValidating: false,
      isSpenderValid: false,
      isAmountValid: false,
      resolvedAddress: false,
      resolvedMessage: false,
      amount: 0,
    };
  },
  computed: {
    filteredEvents() {
      if (this.showAllEvents) return this.events;
      return this.events.filter((e) => {
        return (
          !!e.contractMetadata &&
          !!e.contractMetadata.symbol &&
          e.impactsUserAccounts
        );
      });
      // return this.events;
    },
    simplifiedDomain() {
      try {
        const url = new URL(this.requester.origin);
        const hostname = url.hostname;
        // Split the hostname by dots and get the second last part for the domain
        const parts = hostname.split(".");
        // Return the second last part, or the first part if there are only two parts
        return parts.length > 2 ? parts[parts.length - 2] : parts[0];
      } catch (error) {
        return this.requester.origin; // Return the original if parsing fails
      }
    },

    isApprovalButtonEnabled() {
      console.log(`
        ${this.isSpenderValid}
        ${this.amount > 0}
        ${this.isAmountValid}
        ${!this.addingApproval}
      `);
      return (
        this.isSpenderValid &&
        this.amount > 0 &&
        this.isAmountValid &&
        !this.addingApproval
      );
    },
  },

  watch: {
    useFreeMana: function (newVal) {
      if (newVal) {
        this.payer = this.network.freeManaSharer;
        this.payee = this.request.args.transaction.header.payer;
        this.readyToSend = false;
      } else {
        this.payer = this.request.args.transaction.header.payer;
        this.readyToSend = false;
      }
    },

    payer: async function () {
      this.nonce = await this.provider.getNextNonce(this.payee || this.payer);
      this.readyToSend = false;
    },

    payee: async function () {
      this.nonce = await this.provider.getNextNonce(this.payee || this.payer);
      this.readyToSend = false;
    },

    maxMana: function () {
      this.readyToSend = false;
    },

    nonce: function () {
      this.readyToSend = false;
    },

    showAdvanced(newVal) {
      console.log("showAdvanced changed:", newVal);
    },
  },

  created() {
    this.validateSpenderDebounced = this.debounce(this.validateSpender);
    this.validateAmountDebounced = this.debounce(this.validateAmount);
  },

  async mounted() {
    console.log("Component mounted");
    try {
      let requests;
      if (process.env.VUE_APP_ENV === "test") {
        requests = testRequests;
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

      console.log("Starting decodeTransaction");
      await this.decodeTransaction();
      if (this.unlocked) {
        await this.checkEvents();
      }
    } catch (error) {
      console.error("Error during component initialization:", error);
      this.alertDanger(error.message);
    }
  },

  methods: {
    async getAbi(contract) {
      const contractId = contract.getId();

      // take it from cache
      if (this.cacheAbis[contractId]) return this.cacheAbis[contractId].abi;

      // use the default abi for tokens
      const token = this.tokens.find((t) => t.contractId === contractId);
      if (token) {
        const abi = JSON.parse(JSON.stringify(utils.tokenAbi));
        abi.methods.burn = {
          argument: "token.burn_args",
          return: "",
          description: "Burn tokens",
          read_only: false,
          entry_point: 0x859facc5,
        };
        const format = {
          value: {
            type: "number",
            decimals: token.decimals,
            symbol: token.symbol,
          },
        };
        abi.methods.mint.format = format;
        abi.methods.burn.format = format;
        abi.methods.transfer.format = format;
        abi.methods.approve.format = format;

        abi.events = {
          "token.transfer_event": { argument: "token.transfer_args", format },
          "token.mint_event": { argument: "token.mint_args", format },
          "token.burn_event": { argument: "token.burn_args", format },
          "token.approve_event": { argument: "token.approve_args", format },
          "token.transfer": { argument: "token.transfer_args", format },
          "token.mint": { argument: "token.mint_args", format },
          "token.burn": { argument: "token.burn_args", format },
          "token.approve": { argument: "token.approve_args", format },
          "koinos.contracts.token.transfer_event": {
            argument: "token.transfer_args",
            format,
          },
          "koinos.contracts.token.mint_event": {
            argument: "token.mint_args",
            format,
          },
          "koinos.contracts.token.burn_event": {
            argument: "token.burn_args",
            format,
          },
          "koinos.contracts.token.approve_event": {
            argument: "token.approve_args",
            format,
          },
        };

        this.cacheAbis[contractId] = { success: true, abi };
        return abi;
      }

      // try to get the ABI from local storage
      let abi = await this._getAbi(this.networkTag, contractId);
      if (abi) {
        this.cacheAbis[contractId] = { success: true, abi };
        return abi;
      }

      // try to get the ABI from the network
      try {
        abi = await contract.fetchAbi({
          updateFunctions: false,
          updateSerializer: false,
        });
      } catch (error) {
        // empty
      }
      if (abi) {
        this.cacheAbis[contractId] = { success: true, abi };
        return abi;
      }

      // try to get the ABI from contract upload
      if (
        this.abiUploadContract &&
        this.abiUploadContract.contractId === contractId
      ) {
        abi = JSON.parse(this.abiUploadContract.abi);
        this.cacheAbis[contractId] = { success: true, abi };
        return abi;
      }

      // try to get ABI from the request
      if (this.abis && this.abis[contractId]) {
        abi = this.abis[contractId];
        this.cacheAbis[contractId] = { success: true, abi };
        return abi;
      }

      this.cacheAbis[contractId] = { success: false, abi: undefined };
      return undefined;
    },

    async applyFormat(format, argName, data) {
      // display address names
      const acc = this.accounts.find((a) => a.address === data);
      if (acc) {
        return `${acc.name} - ${data}`;
      }

      // resolve nickname if it is an address
      try {
        const isAddress = utils.isChecksumAddress(data);
        if (isAddress) {
          const resolvedName = await this.resolveAddress(data);
          if (resolvedName) return `@${resolvedName} - ${data}`;
        }
      } catch {
        // empty
      }

      if (!format || !format[argName]) {
        // Try to find a matching key ignoring case
        const matchingKey = Object.keys(format || {}).find(
          (key) => key.toLowerCase() === argName.toLowerCase()
        );
        if (matchingKey) {
          format = { [argName]: format[matchingKey] };
        } else {
          return data;
        }
      }

      // beautify numbers
      switch (format[argName].type) {
      case "number": {
        const decimals = format[argName].decimals || 0;
        const symbol = format[argName].symbol || "";
        // todo: update koilib
        const amount = decimals ? utils.formatUnits(data, decimals) : data;

        // Format the number with commas for thousands separators
        const formattedAmount = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimals,
        }).format(parseFloat(amount));

        return `${formattedAmount} ${symbol}`.trim();
      }
      default:
        return data;
      }
    },

    async resolveAddress(address) {
      if (!address) return "";
      if (this.cacheNicknames[address]) {
        return this.cacheNicknames[address].value;
      }
      const { result } = await this.nicknames.get_main_token({
        value: address,
      });
      if (result && result.token_id) {
        this.cacheNicknames[address] = {
          success: true,
          value: fromHexToUtf8(result.token_id),
        };
      } else {
        this.cacheNicknames[address] = {
          success: false,
          value: "",
        };
      }
      return this.cacheNicknames[address].value;
    },

    async getNicknameImage(nickname) {
      if (!nickname) return "";
      if (this.cacheNicknameImages[nickname]) {
        return this.cacheNicknameImages[nickname].value;
      }

      try {
        const { result: resultMetadata } = await this.nicknames.metadata_of({
          token_id: fromUtf8ToHex(nickname),
        });
        const metadata = JSON.parse(resultMetadata.value);
        if (!metadata.image) {
          throw new Error(`no image in metadata of ${nickname}`);
        }
        this.cacheNicknameImages[nickname] = {
          success: true,
          value: metadata.image,
        };
      } catch (error) {
        console.error(`error when loading metadata of token @${nickname}`);
        console.error(error);

        this.cacheNicknameImages[nickname] = {
          success: false,
          value: "",
        };
      }
      return this.cacheNicknameImages[nickname].value;
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
      let contractMetadata = this.tokens.find(
        (t) => t.contractId === contractId
      );
      const resolvedName = await this.resolveAddress(contractId);
      if (!contractMetadata) {
        contractMetadata = {
          nickname: resolvedName,
          image: await this.getNicknameImage(resolvedName),
        };
      }

      let contractIdName = contractId;

      const accContract = this.accounts.find((a) => a.address === contractId);
      if (accContract) contractIdName = `${contractId} - ${accContract.name}`;

      let impacted = [];
      let impactsUserAccounts = false;
      if (isEvent && action.impacted) {
        impacted = await Promise.all(
          action.impacted.map(async (imp) => {
            const acc = this.accounts.find((a) => a.address === imp);
            if (acc) {
              impactsUserAccounts = true;
              return `${imp} - ${acc.name}`;
            }

            const resolvedName = await this.resolveAddress(imp);
            if (resolvedName) return `${imp} - @${resolvedName}`;
            return imp;
          })
        );
      }

      try {
        const contract = new Contract({
          id: contractId,
          provider: this.provider,
        });
        const abi = await this.getAbi(contract);
        if (!abi || !abi.methods)
          throw new Error(`no abi found for ${contractId}`);
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
          const format = contract.abi.methods[name].format || {};
          if (args) {
            if (
              args.amount_in &&
              args.amount_out_min &&
              args.path &&
              Array.isArray(args.path)
            ) {
              // special case for KoinDX
              const tokenA = this.tokens.find(
                (t) =>
                  t.contractId === args.path[0] || t.nickname === args.path[0]
              );
              format.amount_in = format.amount_in || {
                type: "number",
                decimals: tokenA ? tokenA.decimals : 8,
                symbol: tokenA ? tokenA.symbol : "",
              };

              const tokenB = this.tokens.find(
                (t) =>
                  t.contractId === args.path[1] || t.nickname === args.path[1]
              );
              format.amount_out_min = format.amount_out_min || {
                type: "number",
                decimals: tokenB ? tokenB.decimals : 8,
                symbol: tokenB ? tokenB.symbol : "",
              };
            }

            args = await Promise.all(
              Object.keys(args).map(async (argName) => {
                const field = formatFieldName(argName);
                return {
                  field,
                  data: await this.applyFormat(format, argName, args[argName]),
                };
              })
            );
          }

          this.operations.push({
            call_contract: true,
            contractId: contractIdName,
            nickname: resolvedName,
            title: formatFieldName(contract.abi.methods[name].name || name),
            subtitle: contract.abi.methods[name].description || "",
            args,
            style: { bgOperation: true },
            viewMore: false,
            contractMetadata,
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

          // Create a format object for all fields ending with "_amount"
          format = format || {};
          Object.keys(decodedEvent.args).forEach((argName) => {
            if (argName.toLowerCase().endsWith("_amount")) {
              const tokenName = argName.slice(0, -7).toUpperCase(); // Remove '_amount' and capitalize
              const token = this.tokens.find(
                (t) => t.symbol.toUpperCase() === tokenName
              );
              format[argName] = {
                type: "number",
                decimals: token ? token.decimals : 8,
                symbol: token ? token.symbol : tokenName,
              };
            }
          });

          let args = await Promise.all(
            Object.keys(decodedEvent.args).map(async (argName) => {
              const field = formatFieldName(argName);
              return {
                field,
                data: await this.applyFormat(
                  format,
                  argName.toLowerCase(),
                  decodedEvent.args[argName]
                ),
              };
            })
          );

          let title = decodedEvent.name;
          if (
            abi.events &&
            abi.events[action.name] &&
            abi.events[action.name].name
          )
            title = abi.events[action.name].name;

          title = formatFieldName(title);

          // Determine the positive value to display
          let positiveValue = null;
          if (title.toLowerCase().includes("transfer")) {
            const valueArg = args.find(
              (arg) => arg.field.toLowerCase() === "value"
            );
            if (valueArg) {
              positiveValue = valueArg.data;
            }
          } else {
            // Fallback to previous logic for non-transfer events
            const positiveValueArg = args.find((arg) => {
              return !isNaN(arg.data.split(" ")[0]);
            });
            if (positiveValueArg) {
              positiveValue = positiveValueArg.data;
            }
          }

          this.events.push({
            id: this.events.length,
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
            viewMore: false,
            contractMetadata,
            positiveValue,
          });
        }
      } catch (error) {
        console.log(error);
        if (isOperation) {
          this.operations.push({
            call_contract: true,
            contractId: contractIdName,
            title: action.call_contract.entry_point,
            subtitle: "⚠️ This operation couldn't be decoded",
            args: [
              {
                field: "Args",
                data: action.call_contract.args,
              },
            ],
            style: {
              red: true,
            },
            viewMore: false,
            contractMetadata,
          });
        }

        if (isEvent) {
          this.events.push({
            id: this.events.length,
            contractId: contractIdName,
            title: firstUpperCase(action.name),
            subtitle: "⚠️ This event couldn't be decoded",
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
            viewMore: false,
            contractMetadata,
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
        this.externalSigners = true;
        this.optimizeMana = false;
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
        this.network = networks.find((n) => n.chainId === header.chain_id);
        this.provider = new Provider(this.network.rpcNodes);
        this.provider.onError = (error) => {
          this.provider.currentNodeId = 0;
          throw error;
        };
        this.networkTag = this.network ? this.network.tag : "Unknown chain id";
        this.maxMana = utils.formatUnits(header.rc_limit, 8);
        this.nonce = header.nonce;
        this.payer = header.payer;
        this.payee = header.payee || "";

        const nicknamesAbi = await this._getAbi(
          this.networkTag,
          this.network.nicknamesContractId
        );
        this.nicknames = new Contract({
          id: this.network.nicknamesContractId,
          abi: nicknamesAbi,
          provider: this.provider,
          serializer: await this.newSandboxSerializer(
            nicknamesAbi.koilib_types
          ),
        }).functions;

        const abiFreeManaSharer = await this._getAbi(
          this.network.tag,
          this.network.freeManaSharer
        );
        this.freeManaSharer = new Contract({
          id: this.network.freeManaSharer,
          abi: abiFreeManaSharer,
          provider: this.provider,
          serializer: await this.newSandboxSerializer(
            abiFreeManaSharer.koilib_types
          ),
        });

        this.tokens = (await this._getTokens()).filter(
          (t) => t.network === this.network.tag
        );
        const koinToken = this.tokens.find((t) => t.nickname === "koin");
        console.log({ tokens: this.tokens, network: this.network });
        if (!koinToken) throw new Error("Koin contract ID not found");

        this.serializerToken = await this.newSandboxSerializer(
          utils.tokenAbi.koilib_types
        );
        this.koinContract = new Contract({
          id: koinToken.contractId,
          abi: {
            ...utils.tokenAbi,
            events: {
              "koinos.contracts.token.transfer_event": {
                argument: "token.transfer_args",
              },
            },
          },
          provider: this.provider,
          serializer: this.serializerToken,
        });

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
          const signerAddresses = await Signer.recoverAddresses(
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
        this.rawOperations = operations;

        await this.decodeOperations();

        if (this.isOldKoilib || this.isOldKondor)
          this.footnoteMessage = `This website is using an old version of ${
            this.isOldKondor ? "kondor" : ""
          }${this.isOldKoilib ? " and " : ""}${
            this.isOldKoilib ? "koilib" : ""
          }. Its support will be deprecated in a future release`;
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async decodeOperations() {
      this.operations = [];
      for (let i = 0; i < this.rawOperations.length; i += 1) {
        const op = this.rawOperations[i];
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
                data: authMessage(op.upload_contract.authorizes_call_contract),
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
            viewMore: false,
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
            viewMore: false,
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
            viewMore: false,
          });
        } else {
          await this.beautifyAction("operation", op);
        }
      }
    },

    afterUnlocked() {
      this.unlocked = true;
      this.checkEvents();
    },

    async buildTransaction() {
      let rcLimit = 1e8 * Number(this.maxMana.replace("MANA", "").trim());

      if (!rcLimit) {
        if (this.externalSigners)
          throw new Error(
            [
              "no rc_limit set by the dApp and it's not possible to update",
              "it because the signatures of the external signers will",
              "become invalid",
            ].join(" ")
          );
        rcLimit = 1;
        this.maxMana = "0.00000001";
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
      });
      this.transaction.transaction.operations = this.rawOperations;
      await this.transaction.prepare();
    },

    async useManaMeter() {
      const initialPayee = this.transaction.transaction.header.payee;
      const initialPayer = this.transaction.transaction.header.payer;
      this.transaction.transaction.header.payee = initialPayee || initialPayer;
      this.transaction.transaction.header.payer = this.network.manaMeter;
      this.transaction.transaction.header.rc_limit = Math.floor(
        0.9 * Number(await this.provider.getAccountRc(this.network.manaMeter))
      );
      this.transaction.transaction.id = Transaction.computeTransactionId(
        this.transaction.transaction.header
      );
      return { payee: initialPayee, payer: initialPayer };
    },

    /**
     * Sign transaction with all required signers
     */
    async signTransaction() {
      for (let i = 0; i < this.signers.length; i += 1) {
        const s = this.signers[i];
        const acc = this.$store.state.accounts.find(
          (a) => a.address === s.address
        );
        if (acc) {
          const signer = Signer.fromWif(acc.privateKey);
          signer.provider = this.provider;
          signer.rcOptions = { estimateRc: false };
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
      }
    },

    async checkEvents() {
      console.log("checkEvents method started");
      if (this.loadingEvents) {
        console.error("loading events is already processing");
        return;
      }
      this.loadingEvents = true;
      try {
        if (process.env.VUE_APP_ENV === "test") {
          console.log("Running in test mode");
          this.receipt = testReceipt;
        } else {
          await this.buildTransaction();
          console.log("Transaction built");
          if (this.optimizeMana && !this.externalSigners) {
            const { payer, payee } = await this.useManaMeter();
            await this.signTransaction();
            const { header, id } = await estimateAndAdjustMana({
              payer,
              payee,
              freeManaSharer: this.freeManaSharer,
              transaction: this.transaction,
              provider: this.provider,
              koinContract: this.koinContract,
            });
            this.transaction.transaction.header = header;
            this.transaction.transaction.id = id;
            this.transaction.transaction.signatures = [];
          }
          await this.signTransaction();

          for (let i = 0; i < 5; i += 1) {
            try {
              this.receipt = await this.transaction.send({ broadcast: false });
            } catch (error) {
              if (i >= 4 || this.externalSigners) throw error;
              if (
                error.message.includes("transaction reverted: insufficient rc")
              ) {
                this.transaction.transaction.header.rc_limit = (
                  Number(this.transaction.transaction.header.rc_limit) +
                  Number("100000000")
                ).toString();
                const id = Transaction.computeTransactionId(
                  this.transaction.transaction.header
                );
                this.transaction.transaction.id = id;
                this.transaction.transaction.signatures = [];
                await this.signTransaction();
              }
            }
          }

          this.maxMana = utils.formatUnits(
            this.transaction.transaction.header.rc_limit,
            8
          );
          this.payee = this.transaction.transaction.header.payee;
          this.payer = this.transaction.transaction.header.payer;
        }
        console.log("Full receipt:", JSON.stringify(this.receipt, null, 2));
        this.events = [];
        if (this.receipt.events) {
          console.log(`Processing ${this.receipt.events.length} events`);
          for (let i = 0; i < this.receipt.events.length; i += 1) {
            const event = this.receipt.events[i];
            console.log(
              `Processing event ${i + 1}:`,
              JSON.stringify(event, null, 2)
            );
            await this.beautifyAction("event", event);
            console.log(
              `Beautified event ${i + 1}:`,
              JSON.stringify(this.events[this.events.length - 1], null, 2)
            );
          }
        }
        this.manaUsed = `${utils.formatUnits(this.receipt.rc_used, 8)} mana`;
        this.readyToSend = true;
        this.loadingEvents = false;
      } catch (error) {
        console.error("Error in checkEvents:", error);
        this.readyToSend = false;
        this.loadingEvents = false;
        this.alertDanger(error.message);
        throw error;
      }
    },

    async skipEvents() {
      this.loadingSkipEvents = true;
      try {
        await this.buildTransaction();
        if (this.optimizeMana && !this.externalSigners) {
          const { payer, payee } = await this.useManaMeter();
          await this.signTransaction();
          const { header, id } = await estimateAndAdjustMana({
            payer,
            payee,
            freeManaSharer: this.freeManaSharer,
            transaction: this.transaction,
            provider: this.provider,
            koinContract: this.koinContract,
          });
          this.transaction.transaction.header = header;
          this.transaction.transaction.id = id;
          this.transaction.transaction.signatures = [];
        }
        this.readyToSend = true;
        this.loadingSkipEvents = false;
      } catch (error) {
        this.readyToSend = false;
        this.loadingSkipEvents = false;
        this.alertDanger(error.message);
        throw error;
      }
    },

    async sendTransaction() {
      if (!this.readyToSend) await this.skipEvents();
      let message = { id: this.request.id };

      try {
        if (
          !this.transaction.transaction.signatures ||
          this.transaction.transaction.signatures.length === 0
        ) {
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

    toggleViewMoreOperation(i) {
      this.$set(this.operations[i], "viewMore", !this.operations[i].viewMore);
    },

    toggleViewMoreEvent(i) {
      this.$set(this.events[i], "viewMore", !this.events[i].viewMore);
    },

    toggleAdvanced() {
      console.log("toggleAdvanced called, current state:", this.showAdvanced);
      this.showAdvanced = !this.showAdvanced;
      console.log("New state:", this.showAdvanced);
    },

    toggleFilteredEvents() {
      this.showAllEvents = !this.showAllEvents;
    },

    toggleEventDetails() {
      this.showDetailedEvents = !this.showDetailedEvents;
    },

    toggleSettingAllowance() {
      this.settingAllowance = !this.settingAllowance;
    },

    changeSpender() {
      this.isSpenderValidated = false;
      this.resolvedAddress = "";
      this.resolvedMessage = "";
    },

    async validateSpender() {
      this.isSpenderValidating = true;

      // check if it is a public address
      try {
        this.isSpenderValid = utils.isChecksumAddress(this.spender);
      } catch (_) {
        this.isSpenderValid = false;
      }
      if (this.isSpenderValid) {
        this.isSpenderValidating = false;
        this.isSpenderValidated = true;
        return;
      }

      // check if it is a nickname
      if (this.network.nicknamesContractId) {
        try {
          const { result } = await this.nicknames.get_address({
            value: this.spender,
          });
          this.resolvedAddress = result?.value;
          this.resolvedMessage = `@${this.spender} resolves to ${this.resolvedAddress}`;
          this.isSpenderValid = !!this.resolvedAddress;
        } catch (_) {
          this.isSpenderValid = false;
        }
        if (this.isSpenderValid) {
          this.isSpenderValidating = false;
          this.isSpenderValidated = true;
          return;
        }
      }

      this.isSpenderValid = false;
      this.isSpenderValidating = false;
      this.isSpenderValidated = true;
    },

    validateAmount() {
      const amount = parseFloat(this.amount);
      this.isAmountValid = !isNaN(this.amount) && !isNaN(amount) && 0 <= amount;
    },

    async addApproval() {
      this.addingApproval = true;
      try {
        const tokenContract = new Contract({
          id: this.tokenId2,
          abi: utils.tokenAbi,
          serializer: this.serializerToken,
          options: { onlyOperation: true },
        });
        const approveArgs = {
          owner: this.signers[this.signers.length - 1].address,
          spender: this.resolvedAddress || this.spender,
          value: utils.parseUnits(this.amount, 8),
        };
        const { operation: op1 } = await tokenContract.functions.approve(
          approveArgs
        );
        // add approval at the beginning
        this.rawOperations.unshift(op1);

        // remove remaining value at the end
        approveArgs.value = "0";
        const { operation: op2 } = await tokenContract.functions.approve(
          approveArgs
        );
        this.rawOperations.push(op2);

        this.readyToSend = false;
        this.settingAllowance = false;

        await this.decodeOperations();
        this.addingApproval = false;
        if (this.unlocked) await this.checkEvents();
      } catch (error) {
        this.addingApproval = false;
        this.alertDanger(error.message);
        throw error;
      }
    },

    async removeOperation(i) {
      this.rawOperations.splice(i, 1);
      this.operations.splice(i, 1);
      this.readyToSend = false;
      if (this.unlocked) await this.checkEvents();
    },

    onPaste(event) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.spender = event.target.value; // Force the v-model to update
          this.validateSpenderDebounced(); // Trigger the validation again
        });
      });
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
  padding: 1.2em;
  box-sizing: border-box;
  width: 100%;
}

.red {
  background: var(--kondor-red);
}

.gray {
  background: var(--primary-gray);
}

.bgUploadContract {
  background: #308b9b;
}

.op-header {
  padding: 1rem;
  color: var(--kondor-light);
  margin-top: 0.5em;
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--primary-dark-light);
  justify-content: space-between;
  gap: 1em;
}

.op-header-image {
  width: 3em;
  height: 3em;
  padding: 0.8em;
  background-color: var(--kondor-purple30);
  border-radius: 50%;
  display: flex;
  justify-content: center;
}

.op-group {
  display: flex;
  gap: 1em;
  align-items: center;
}

.op-header-image2 {
  width: 3em;
  height: 3em;
  padding: 0.8em;
  background-color: var(--kondor-purple30);
  border-radius: 50%;
  display: flex;
  justify-content: center;
}

.op-header-image img,
.op-header-image2 img {
  max-width: 100%;
  height: 100%;
  border-radius: 50%;
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
  text-align: center;
}

.op-viewmore {
  font-size: 1.2em;
  color: white;
  margin-top: 0.3rem;
  cursor: pointer;
}

.op-contractid {
  width: 100%;
  color: gray;
}

.op-body,
.op-body2 {
  padding: 0 0.8rem 0.5rem 0.8rem;
  word-break: break-all;
  background-color: var(--primary-dark-light);
}

.op-body {
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
}

.op-body-row {
  display: flex;
  margin: 0.5rem 0;
  justify-content: space-between;
  flex-direction: column;
}

.op-remove-section {
  text-align: end;
}

.op-button-remove {
  padding: 0.2rem;
  width: 1rem;
  border-color: var(--kondor-red);
  background-color: var(--kondor-red);
}

.s1 {
  font-size: 1rem;
}

.field-name {
  color: gray;
  min-width: 5.5rem;
  max-width: 5.5rem;
  margin-right: 0.5rem;
}

.field-data {
}

.update-events {
  height: 1rem;
  display: inline-flex;
  vertical-align: middle;
  cursor: pointer;
}

.ev-header {
  padding: 8px 6px;
  color: var(--kondor-light);
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
  color: var(--kondor-light);
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
}

.ev-impacted-account {
  /* font-size: 0.8em; */
  margin-top: 0.3em;
}

.signature {
  display: flex;
  margin-bottom: 1em;
}

.sig-details {
  flex: 8;
  padding: 0.7em 0em;
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
  background: var(--kondor-red);
  font-size: 1.5em;
  color: var(--primary-light);
  cursor: pointer;
}

.sig-delete .x {
  margin: auto;
}

.group-add-signer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.group-add-signer button {
  width: 7em;
}

.checkbox-wrapper-2 {
  margin-left: 8px;
}

.checkbox-wrapper-2 .ikxBAC {
  appearance: none;
  background-color: var(--primary-light);
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
  background-color: var(--primary-light);
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
  background-color: var(--primary-light);
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
  background: var(--primary-darker);
  width: 94%;
  justify-content: flex-start;
  flex-direction: column;
  padding-left: 4em;
}
.tb-title {
  color: var(--kondor-light);
  font-size: 1.5em;
}
.tb-subtitle {
  color: var(--primary-gray);
  font-size: 0.9em;
}
.tb-container {
  width: 342px;
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
}

.wallet-interaction h2 {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.wallet-interaction h1 {
  font-size: 24px;
  color: var(--primary-light);
  margin-bottom: 5px;
}

.wallet-interaction p {
  font-size: 14px;
  color: #888;
}

.check-events-row {
  display: flex;
  flex-direction: column;
  align-items: end;
  width: 100%;
  padding: 0 1em;
  box-sizing: border-box;
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
  background-color: var(--kondor-light);
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
  box-sizing: border-box;
}

.sending-info p {
  color: #888;
  margin-bottom: 5px;
}

.sending-info h2 {
  color: var(--primary-light);
  font-size: 24px;
}

.warning-message {
  background-color: #ffa500;
  color: var(--primary-darker);
  padding: 1em;
  margin: 1rem;
  border-radius: 1em;
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
  color: var(--primary-light);
}

.sign-btn {
  background-color: #7161ef;
  color: var(--primary-light);
}
.wi-title {
  font-size: 2.2em;
  color: var(--primary-light);
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
  width: 100%;
  padding: 0 1em;
  box-sizing: border-box;
  /* background-color: var(--primary-dark-light); */
}
.mana-used {
  font-size: 1.2em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, max-height 0.5s ease;
  max-height: 1000px;
  overflow: hidden;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.op-title-group {
  display: flex;
  flex-direction: column;
}

.op-positive-value {
  font-size: 0.8em;
  color: var(--kondor-green);
  margin-top: 0.2em;
}

.set-allowance-title {
  width: 100%;
  text-align: end;
  padding-right: 2rem;
}

.setting-allowance {
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

.flex2 {
  flex: 2;
}

.pad1 {
  padding: 1rem;
}

.m0 {
  margin: 0;
}

.action-allowance {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
