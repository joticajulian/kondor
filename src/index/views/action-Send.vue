<template>
  <div class="transfer container">
    <div class="send-to">
      <label>Send to</label>
      <input
        v-model="to"
        type="text"
        :placeholder="
          'Enter public address' +
            (network && network.tag === 'mainnet' ? ' or KAP name' : '')
        "
        :class="
          isToValidated && !isToValidating && to.length > 0 && !isToValid
            ? 'invalid'
            : ''
        "
        @input="validateToDebounced()"
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
        v-if="!!resolvedKap"
        class="info"
      >
        <span class="material-icons">info_outline</span>
        Will send to {{ resolvedKap }}
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
    <div class="row">
      <a
        class="balance"
        @click="setMaxAmount()"
      >Max: {{ balance }} KOIN</a>
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
      <label for="max-mana">Max mana</label>
      <input
        v-model="maxMana"
        type="text"
      >
    </div>
    <div class="actions">
      <button
        class="secondary"
        @click="cancel"
      >
        cancel
      </button>
      <button
        :disabled="!isToValidated || !isToValid || !isAmountValid"
        class="primary"
        @click="transfer"
      >
        transfer
      </button>
    </div>
  </div>
</template>
<script>
import router from "@/index/router";
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";
import { Contract, Provider, Signer, utils } from "koilib";

export default {
  mixins: [Storage, Sandbox, ViewHelper],

  data() {
    return {
      address: "loading ",
      balance: "0",
      signer: null,
      provider: null,
      koinContract: null,
      koin: null,
      to: "",
      amount: "0",
      mana: "",
      isToValid: false,
      isAmountValid: true,
      isToValidating: false,
      isToValidated: false,
      showAdvanced: false,
      maxMana: 10,
      resolvedKap: "",
      network: null,
    };
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
    "$store.state.currentNetwork": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
  },

  created() {
    this.validateToDebounced = this.debounce(this.validateTo);
    this.validateAmountDebounced = this.debounce(this.validateAmount);
  },

  mounted() {
    this.loadAccount(this.$store.state.currentIndexAccount);
  },

  methods: {
    setMaxAmount() {
      this.amount = this.balance;
    },
    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced;
    },
    changeTo() {
      this.isToValidated = false;
      this.resolvedKap = "";
    },
    async validateTo() {
      this.isToValidating = true;
      let isAddress;
      try {
        isAddress = utils.isChecksumAddress(this.to);
      } catch (_) {
        isAddress = false;
      }
      if (isAddress) {
        this.isToValid = true;
      } else if (this.network.kapNameServiceContractId) {
        try {
          const buffer = new TextEncoder().encode(this.to);
          const kapHex = `0x${utils.toHexString(buffer)}`;
          const { result } = await this.kapNameService.owner_of({
            token_id: kapHex,
          });
          this.resolvedKap = result?.value;
          this.isToValid = !!this.resolvedKap;
        } catch (_) {
          this.isToValid = false;
        }
      } else {
        this.isToValid = false;
      }
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
    async loadAccount(index) {
      if (this.$store.state.accounts.length === 0) return;
      try {
        this.$store.state.networks = await this._getNetworks();
        const currentTag = await this._getCurrentNetwork();
        this.$store.state.currentNetwork = this.$store.state.networks.findIndex(
          (n) => n.tag === currentTag
        );
        this.network =
          this.$store.state.networks[this.$store.state.currentNetwork];
        this.provider = new Provider(this.network.rpcNodes);
        const currentAccount = this.$store.state.accounts[index];
        this.address = currentAccount.address;
        this.signer = undefined;
        if (currentAccount.privateKey) {
          this.signer = Signer.fromWif(currentAccount.privateKey, true);
          this.signer.provider = this.provider;
        } else {
          router.back();
        }

        this.koinContract = new Contract({
          id: this.network.koinContractId,
          abi: utils.tokenAbi,
          provider: this.provider,
          signer: this.signer,
          serializer: await this.newSandboxSerializer(
            utils.tokenAbi.koilib_types
          ),
        });
        this.koin = this.koinContract.functions;

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
      await this.loadBalance();
    },

    async loadBalance() {
      try {
        const { result } = await this.koin.balanceOf({ owner: this.address });
        this.balance = utils.formatUnits(result.value, 8).toLocaleString("en");
        const rc = await this.provider.getAccountRc(this.address);
        const initialMana = Number(rc) / 1e8;
        this.mana = Number(initialMana.toFixed(8));
        this.maxMana = Math.min(10, this.mana);
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async transfer() {
      let interval;
      try {
        const { transaction, receipt } = await this.koin.transfer(
          {
            from: this.address,
            to: this.resolvedKap || this.to,
            value: utils.parseUnits(this.amount, 8),
          },
          { chainId: this.network.chainId, rcLimit: this.maxMana * 1e8 }
        );
        this.alertSuccess("Sent. Waiting to be mined ...");
        console.log(`Transaction id ${transaction.id} submitted. Receipt:`);
        console.log(receipt);
        if (receipt.logs) throw new Error(`Error: ${receipt.logs.join(", ")}`);
        interval = setInterval(() => {
          console.log("firing interval");
          this.loadBalance();
        }, 2000);
        const { blockNumber } = await transaction.wait("byBlock", 60_000);
        clearInterval(interval);
        console.log("block number " + blockNumber);
        this.alertSuccess(`Sent. Transaction mined in block ${blockNumber}`);
        router.push("/dashboard");
      } catch (error) {
        clearInterval(interval);
        this.alertDanger(error.message);
        throw error;
      }
    },

    cancel() {
      router.back();
    },
  },
};
</script>
<style scoped>
.container {
  padding: 2em 2em;
}

.container > * {
  width: 100%;
}

.actions {
  display: flex;
  flex-direction: row;
  gap: 1em;
  justify-content: stretch;
}

button.secondary {
  background-color: #ddd;
  border-color: #ddd;
  color: #000;
}

label,
input {
  box-sizing: border-box;
  max-width: 100%;
  width: 100%;
  margin-bottom: 0.5em;
}

label {
  margin-top: 0.5em;
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
  color: #777;
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
  margin-top: 0.5em;
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
