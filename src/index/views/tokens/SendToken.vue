<template>
  <div class="transfer container">
    <div class="token">
      <label>Token</label>
      <select
        id="select-token"
        v-model="tokenId2"
        name="select-token"
      >
        <option
          v-for="token in miniTokens"
          :key="token.contractId"
          :value="token.contractId"
        >
          {{ token.nickname ? `@${token.nickname}` : token.contractId }}
        </option>
      </select>
    </div>
    <div class="send-to">
      <label>Send to</label>
      <input
        v-model="to"
        type="text"
        :placeholder="
          'Enter address' +
            (network && network.tag === 'mainnet'
              ? ', nickname or KAP name'
              : 'or nickname')
        "
        :class="
          isToValidated && !isToValidating && to.length > 0 && !isToValid
            ? 'invalid'
            : ''
        "
        @input="validateToDebounced()"
        @paste="onPaste"
        @keyup="changeTo()"
      >
      <span
        v-if="isToValidating"
        class="spinner material-icons"
      >sync</span>
      <span
        v-else-if="isToValid"
        class="success material-icons"
      >check_circle_outline</span>
      <span
        v-else-if="isToValidated && to.length > 0"
        class="error material-icons"
      >error_outline</span>
      <div
        v-if="!!resolvedAddress"
        class="info"
      >
        <span class="material-icons">info_outline</span>
        {{ resolvedMessage }}
      </div>
    </div>
    <label>Amount</label>
    <input
      v-model="amount"
      type="number"
      :min="0"
      :max="balance"
      :class="!isAmountValid ? 'invalid' : ''"
      @input="validateAmountDebounced()"
    >
    <label>Memo</label>
    <input
      v-model="memo"
      type="text"
    >
    <div class="row">
      <a
        class="balance"
        @click="setMaxAmount()"
      >Max: {{ balanceWithSymbol }}</a>
      <a
        class="advanced-toggle"
        @click="toggleAdvanced()"
      >Advanced
        <span
          v-if="!showAdvanced"
          class="material-icons"
        >expand_more</span><span
          v-else
          class="material-icons"
        >expand_less</span></a>
    </div>
    <div
      v-if="showAdvanced"
      class="advanced-content"
    >
      <div class="group-free-mana">
        <input
          v-model="useFreeMana"
          type="checkbox"
        >
        <label for="kondor-payer">Use free mana</label>
      </div>
      <label for="max-mana">Max mana</label>
      <input
        v-model="maxMana"
        type="text"
      >
      <div
        v-if="!useFreeMana"
        class="group-payer"
      >
        <label for="payer">Payer</label>
        <input
          v-model="payer"
          type="text"
        >
      </div>
    </div>
    <div class="actions">
      <button
        class="custom-button secondary"
        @click="cancel"
      >
        cancel
      </button>
      <button
        :disabled="!isSendButtonEnabled"
        class="custom-button primary"
        @click="transfer"
      >
        <span
          v-if="makingTransfer"
          class="loader2"
        />
        <span v-else>transfer</span>
      </button>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { Contract, Provider, Signer, Transaction, utils } from "koilib";
import router from "@/index/router";
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";
import { estimateAndAdjustMana } from "../../../../lib/utils";

const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000

function fromUtf8ToHex(text) {
  return utils.toHexString(new TextEncoder().encode(text));
}

export default {
  mixins: [Storage, Sandbox, ViewHelper],

  props: {
    tokenId: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      address: "",
      balance: "",
      balanceWithSymbol: "",
      signer: null,
      provider: null,
      serializer: null,
      to: "",
      amount: "0",
      memo: "",
      mana: "",
      miniTokens: [],
      isToValid: false,
      isAmountValid: true,
      isToValidating: false,
      isToValidated: false,
      showAdvanced: false,
      maxMana: 10,
      payer: "",
      payee: "",
      useFreeMana: false,
      resolvedAddress: "",
      resolvedMessage: "",
      network: null,
      kapNameService: null,
      nicknames: null,
      tokenId2: "",
      tokenDecimals: undefined,
      makingTransfer: false,
    };
  },
  computed: {
    isSendButtonEnabled() {
      return (
        this.isToValid &&
        this.amount > 0 &&
        this.isAmountValid &&
        !this.makingTransfer
      );
    },
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork();
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
    tokenId2: function (newVal) {
      const token = this.miniTokens.find((t) => t.contractId === newVal);
      this.loadToken(token);
    },
    useFreeMana: function (newVal) {
      if (newVal) {
        this.payer = this.network.freeManaSharer;
        this.payee = this.address;
      } else {
        this.payer = this.address;
        this.payee = "";
      }
    },
  },

  created() {
    this.validateToDebounced = this.debounce(this.validateTo);
    this.validateAmountDebounced = this.debounce(this.validateAmount);
  },

  async mounted() {
    this.tokenId2 = this.tokenId;
    this.serializer = await this.newSandboxSerializer(
      utils.tokenAbi.koilib_types
    );
    await this.loadNetwork();
    let index = await this._getCurrentIndexAccount();
    if (Number.isNaN(Number(index))) index = 0;
    if (index === this.$store.state.currentIndexAccount) {
      await this.loadAccount(this.$store.state.currentIndexAccount);
    } else {
      this.$store.state.currentIndexAccount = index;
      // the change will trigger the watch function which will
      // call this.loadAccount
    }
  },

  methods: {
    async loadNetwork() {
      try {
        this.$store.state.networks = await this._getNetworks();
        const currentTag = await this._getCurrentNetwork();
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        );
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork];
        this.provider = new Provider(this.network.rpcNodes);
        this.provider.onError = (error) => {
          this.provider.currentNodeId = 0;
          throw error;
        };

        // load nicknames contract
        if (this.network.nicknamesContractId) {
          const nicknamesAbi = await this._getAbi(
            this.network.tag,
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
        }

        // load kap contract
        if (this.network.kapNameServiceContractId) {
          const kapAbi = await this._getAbi(
            this.network.tag,
            this.network.kapNameServiceContractId
          );
          this.kapNameServiceContract = new Contract({
            id: this.network.kapNameServiceContractId,
            abi: kapAbi,
            provider: this.provider,
            serializer: await this.newSandboxSerializer(kapAbi.koilib_types),
          });
          this.kapNameService = this.kapNameServiceContract.functions;
        }
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async loadTokenBalance(t) {
      const contract = new Contract({
        id: t.contractId,
        abi: utils.tokenAbi,
        provider: this.provider,
        serializer: this.serializer,
      });

      let balanceSatoshis;
      let balance;
      try {
        const { result } = await contract.functions.balanceOf({
          owner: this.address,
        });
        balanceSatoshis = result.value;
        // todo: update koilib
        balance = t.decimals
          ? utils.formatUnits(balanceSatoshis, t.decimals)
          : balanceSatoshis;
      } catch (error) {
        console.error(`error while loading the balance of @${t.nickname}`);
        console.error(error);
        return {
          balanceSatoshis: "Error",
          balance: "Error",
          balanceWithSymbol: "Error",
          balanceUSD: "Error",
        };
      }

      // load USD balance
      let balanceUSD = "$0 USD";
      if (this.network.tag === "mainnet" && t.nickname === "koin") {
        try {
          const response = await axios.get(
            "https://www.mexc.com/open/api/v2/market/ticker?symbol=koin_usdt"
          );
          const price = Number(response.data.data[0].last);
          const balanceSatoshisNumber = Number(balanceSatoshis);
          balanceUSD = `$${(balanceSatoshisNumber * price).toFixed(2)} USD`;
        } catch (error) {
          console.error("Error when loading price from MEXC");
          console.error(error);
          balanceUSD = "USD Error";
        }
      }

      if (t.nickname === "koin") {
        // load mana
        try {
          const balanceSatoshisNumber = Number(balanceSatoshis);
          const rc = await this.provider.getAccountRc(this.address);
          const initialMana = Number(rc);
          const lastUpdateMana = Date.now();

          // mana reserved in the mempool (pending state)
          let reserved = 0;
          try {
            const res = await this.provider.call(
              "mempool.get_reserved_account_rc",
              { account: this.address }
            );
            if (res && res.rc) {
              reserved = Number(res.rc);
              // in 3 minutes reserved will be 0
              setTimeout(() => {
                reserved = 0;
              }, 180000);
            }
          } catch {
            // empty
          }

          const delta = Math.min(Date.now() - lastUpdateMana, FIVE_DAYS);
          let mana = Math.floor(
            initialMana + (delta * balanceSatoshisNumber) / FIVE_DAYS
          );
          mana = Math.max(0, Math.min(mana, balanceSatoshisNumber) - reserved);
          this.mana = utils.formatUnits(mana.toString(), 8);
          this.maxMana = Math.min(10, this.mana);
        } catch (error) {
          console.error("error when loading mana");
          console.error(error);
        }
      }

      return {
        balanceSatoshis,
        balance,
        balanceWithSymbol: `${t.nickname === "koin" ? this.mana : balance} ${
          t.symbol
        }`,
        balanceUSD,
      };
    },

    async loadTokens() {
      const t = await this._getTokens();
      this.miniTokens = [];

      await Promise.all(
        t.map(async (token) => {
          // check network of token
          if (token.network !== this.network.tag) {
            return {};
          }

          // check current address
          if (token.addresses && token.addresses.length > 0) {
            if (!token.addresses.includes(this.address)) {
              return {};
            }
          }
          if (token.noAddresses && token.noAddresses.length > 0) {
            if (token.noAddresses.includes(this.address)) {
              return {};
            }
          }

          const balance = await this.loadTokenBalance(token);

          if (
            (!this.tokenId2 && token.nickname === "koin") ||
            token.contractId === this.tokenId2
          ) {
            this.tokenId2 = token.contractId;
            this.tokenDecimals = token.decimals;
            this.tokenName = token.nickname;
            this.tokenImage = token.image;
            this.tokenSymbol = token.symbol;
            this.balance = balance.balance;
            this.balanceWithSymbol = balance.balanceWithSymbol;
          }

          if (this.miniTokens.find((m) => m.contractId === token.contractId))
            return {};

          this.miniTokens.push({
            ...token,
            ...balance,
          });

          return {};
        })
      );

      this.miniTokens.sort((a, b) => {
        const idA = t.findIndex((tt) => tt.contractId === a.contractId);
        const idB = t.findIndex((tt) => tt.contractId === b.contractId);
        if (idA > idB) return 1;
        if (idA < idB) return -1;
        return 0;
      });
    },

    async loadAccount(index) {
      this.tokenName = "";
      this.tokenImage = "";
      this.tokenSymbol = "";
      this.balanceWithSymbol = "";
      this.balance = "";

      if (this.$store.state.accounts.length === 0) return;
      try {
        const currentAccount = this.$store.state.accounts[index];
        this.address = currentAccount.address;
        this.signer = undefined;
        if (currentAccount.privateKey) {
          this.signer = Signer.fromWif(currentAccount.privateKey, true);
          this.signer.provider = this.provider;
          this.signer.rcOptions = { estimateRc: false };
          this.watchMode = false;
        } else {
          this.watchMode = true;
        }
        await this.loadTokens();
      } catch (error) {
        this.tokenId2 = "";
        this.balance = "Error";

        this.alertDanger(error.message);
        throw error;
      }
    },

    async loadToken(t) {
      this.tokenId2 = t.contractId;
      this.tokenDecimals = t.decimals;
      this.tokenName = t.nickname;
      this.tokenImage = t.image;
      this.tokenSymbol = t.symbol;
      this.balance = t.balance;
      this.balanceWithSymbol = t.balanceWithSymbol;
    },

    setMaxAmount() {
      this.amount = this.tokenName === "koin" ? this.mana : this.balance;
    },

    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced;
    },

    changeTo() {
      this.isToValidated = false;
      this.resolvedAddress = "";
      this.resolvedMessage = "";
    },

    async validateTo() {
      this.isToValidating = true;

      // check if it is a public address
      try {
        this.isToValid = utils.isChecksumAddress(this.to);
      } catch (_) {
        this.isToValid = false;
      }
      if (this.isToValid) {
        this.isToValidating = false;
        this.isToValidated = true;
        return;
      }

      // check if it is a nickname
      if (this.network.nicknamesContractId) {
        try {
          const { result } = await this.nicknames.get_address({
            value: this.to,
          });
          this.resolvedAddress = result?.value;
          this.resolvedMessage = `@${this.to} resolves to ${this.resolvedAddress}`;
          this.isToValid = !!this.resolvedAddress;
        } catch (_) {
          this.isToValid = false;
        }
        if (this.isToValid) {
          this.isToValidating = false;
          this.isToValidated = true;
          return;
        }
      }

      // check if it is a KAP name
      if (this.network.kapNameServiceContractId) {
        try {
          const tokenId = `0x${fromUtf8ToHex(this.to)}`;
          const { result } = await this.kapNameService.owner_of({
            token_id: tokenId,
          });
          this.resolvedAddress = result?.value;
          this.resolvedMessage = `kap://${this.to} resolves to ${this.resolvedAddress}`;
          this.isToValid = !!this.resolvedAddress;
        } catch (_) {
          this.isToValid = false;
        }
        if (this.isToValid) {
          this.isToValidating = false;
          this.isToValidated = true;
          return;
        }
      }

      this.isToValid = false;
      this.isToValidating = false;
      this.isToValidated = true;
    },

    validateAmount() {
      const amount = parseFloat(this.amount);
      this.isAmountValid =
        !isNaN(this.amount) &&
        !isNaN(amount) &&
        0 <= amount &&
        this.balance >= amount;
    },

    async transfer() {
      this.makingTransfer = true;
      try {
        const contract = new Contract({
          id: this.tokenId2,
          abi: utils.tokenAbi,
          provider: this.provider,
          signer: this.signer,
          serializer: this.serializer,
        }).functions;

        const koinToken = this.miniTokens.find((t) => t.nickname === "koin");
        if (!koinToken) throw new Error("Koin contract id not found");

        const koinContract = new Contract({
          id: koinToken.contractId,
          abi: {
            ...utils.tokenAbi,
            events: {
              "koinos.contracts.token.transfer_event": {
                argument: "token.transfer_args",
              },
              "token.transfer_event": {
                argument: "token.transfer_args",
              },
            },
          },
          provider: this.provider,
          serializer: this.serializer,
        });

        const abiFreeManaSharer = await this._getAbi(
          this.network.tag,
          this.network.freeManaSharer
        );
        const freeManaSharer = new Contract({
          id: this.network.freeManaSharer,
          abi: abiFreeManaSharer,
          provider: this.provider,
          serializer: await this.newSandboxSerializer(
            abiFreeManaSharer.koilib_types
          ),
        });

        const transaction = new Transaction({
          provider: this.provider,
          signer: this.signer,
          options: {
            chainId: this.network.chainId,
            rcLimit: this.maxMana * 1e8,
            payer: this.payer,
          },
        });
        await transaction.pushOperation(contract.transfer, {
          from: this.address,
          to: this.resolvedAddress || this.to,
          value: utils.parseUnits(this.amount, this.tokenDecimals),
          memo: this.memo,
        });

        // use mana meter
        transaction.transaction.header.payee = this.address;
        transaction.transaction.header.payer = this.network.manaMeter;
        transaction.transaction.header.rc_limit = Math.floor(
          0.9 * Number(await this.provider.getAccountRc(this.network.manaMeter))
        );
        transaction.transaction.id = Transaction.computeTransactionId(
          transaction.transaction.header
        );
        await transaction.prepare();
        await transaction.sign();

        // adjust mana
        const { header, id } = await estimateAndAdjustMana({
          payer: this.payer || this.address,
          payee: this.payee,
          transaction,
          provider: this.provider,
          koinContract,
          freeManaSharer,
        });
        transaction.transaction.header = header;
        transaction.transaction.id = id;
        transaction.transaction.signatures = [];

        // sign and send with mana updated
        await transaction.sign();
        const receipt = await transaction.send();

        this.alertSuccess("Sent. Waiting to be mined ...");
        console.log(`Transaction id ${transaction.id} submitted. Receipt:`);
        console.log(receipt);
        const { blockNumber } = await transaction.wait("byTransactionId");
        console.log("block number " + blockNumber);
        this.alertSuccess(`Sent. Transaction mined in block ${blockNumber}`);
        this.makingTransfer = false;
        router.push("/dashboard");
      } catch (error) {
        this.makingTransfer = false;
        this.alertDanger(error.message);
        throw error;
      }
    },

    cancel() {
      router.back();
    },
    onPaste(event) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.to = event.target.value; // Force the v-model to update
          this.validateToDebounced(); // Trigger the validation again
        });
      });
    },
  },
};
</script>
<style scoped>
.transfer {
  overflow-y: auto;
}
.container {
  padding: 2.5em;
  margin: 0;
  background: var(--primary-dark) !important;
  padding: 2em 4em;
}

.container > * {
  width: 100%;
}

.token {
  margin-bottom: 1em;
}

.token select {
  width: 100%;
  max-width: unset;
  padding: 1.5em;
}

.actions {
  display: flex;
  flex-direction: row;
  gap: 1em;
  justify-content: stretch;
}

label,
input {
  box-sizing: border-box;
  max-width: 100%;
  width: 100%;
  margin-bottom: 0.5em;
}

input[type="checkbox"] {
  all: revert;
  margin: 0 0.7em 0 0;
}

label {
  margin-top: 0.5em;
  color: var(--primary-gray);
  margin-left: 0.5em;
}

input.invalid {
  border-color: red;
}

.send-to {
  position: relative;
}

.send-to .error,
.send-to .spinner,
.send-to .success {
  position: absolute;
  top: 32px;
  right: 10px;
}

.send-to .info {
  padding: 0.5em;
  margin-bottom: 0.5em;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: var(--primary-gray);
  padding-left: 2em;
}

.send-to .info .material-icons {
  font-size: 1.1em;
  position: absolute;
  left: 0.5em;
}

.advanced-toggle .material-icons {
  font-size: 1em;
  vertical-align: text-bottom;
}

.advanced-content {
  position: relative;
  margin-top: 1.5em;
}

.group-free-mana {
  display: flex;
  margin-left: 0.5em;
}

.success {
  color: green;
}

.error {
  color: red;
}

.spinner {
  animation: spin 2s linear infinite;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-left: 0.5em;
}

a {
  color: var(--kondor-purple);
}

@keyframes spin {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}
</style>
