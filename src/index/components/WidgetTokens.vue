<template>
  <div class="column">
    <div class="row">
      <div class="token">
        <div
          class="token-image"
          :data-tooltip="'@' + tokenName"
        >
          <img :src="tokenImage">
        </div>
        <div class="amount">
          <div :data-tooltip="balanceWithSymbol">
            <span class="balance">{{ balanceFormatted }}</span>
            <span class="token-symbol">{{ tokenSymbol }}</span>
          </div>
          <div
            v-if="showLiquidKoin && balance !== liquidKoin"
            class="liquid-koin"
          >
            {{ liquidKoin }} Liquid KOIN
          </div>
          <div class="usd">
            {{ balanceUSD }}
          </div>
        </div>
      </div>
      <ManaOrb
        :mana-percent="manaPercent"
        :available-percent="availablePercent"
        :time-recharge="timeRechargeMana"
      />
    </div>
    <div class="other-tokens">
      <div
        v-for="(miniToken, i) in miniTokens"
        :key="i"
        class="mini-token"
        @click="loadToken(miniToken)"
      >
        <img :src="miniToken.image">
      </div>
    </div>
    <div
      v-if="!watchMode"
      class="actions container"
    >
      <button @click="clickBuy()">
        <span class="material-icons">add</span><span>Buy</span>
      </button>
      <button @click="sendToken()">
        <span class="material-icons">arrow_outward</span><span>Send</span>
      </button>
      <button @click="tokenSettings()">
        <span class="material-icons">settings</span><span>Settings</span>
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "@/index/router";
import { Contract, Provider, Signer, utils } from "koilib";
import ManaOrb from "./ManaOrb.vue";
import emptyToken from "@/shared/assets/empty-token.png";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";
import { formatTime } from "../../../lib/utils";

const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000

export default {
  components: { ManaOrb },
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      tokenId: "",
      tokenName: "",
      tokenImage: "",
      tokenSymbol: "",
      miniTokens: [],
      address: "",
      balance: "",
      balanceWithSymbol: "",
      balanceUSD: "",
      showLiquidKoin: false,
      liquidKoin: "",
      signer: null,
      provider: null,
      serializer: null,
      intervalMana: null,
      timeRechargeMana: "",
      watchMode: false,
      manaPercent: 0,
      availablePercent: 0,
    };
  },

  computed: {
    balanceFormatted() {
      if (!this.balance) return this.balance;
      const balanceNumber = Number(this.balance) || 0;
      if (Number.isNaN(balanceNumber)) return `Error ${balanceNumber}`;
      return balanceNumber.toLocaleString("en");
    },
  },

  watch: {
    "$store.state.currentIndexAccount": function () {
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork();
      this.tokenId = "";
      this.loadAccount(this.$store.state.currentIndexAccount);
    },
  },

  async mounted() {
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
    await this.updateSavedTokens();
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
        balance = utils.formatUnits(balanceSatoshis, t.decimals);
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
          const balanceNumber = Number(balance);
          balanceUSD = `$${(balanceNumber * price).toFixed(2)} USD`;
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

          const updateMana = () => {
            const delta = Math.min(Date.now() - lastUpdateMana, FIVE_DAYS);
            let mana = Math.floor(
              initialMana + (delta * balanceSatoshisNumber) / FIVE_DAYS
            );
            mana = Math.min(mana, balanceSatoshisNumber);
            const timeRechargeMana = formatTime(balanceSatoshisNumber, {
              current: mana,
              reserved,
              balance: balanceSatoshisNumber,
            });
            if (timeRechargeMana === "0 seconds")
              this.timeRechargeMana = "Mana recharged";
            else {
              this.timeRechargeMana = `Time to recharge: ${timeRechargeMana}`;
            }
            this.manaPercent = Math.floor((mana / balanceSatoshisNumber) * 100);
            mana = Math.max(0, mana - reserved);
            this.availablePercent = Math.floor(
              (mana / balanceSatoshisNumber) * 100
            );
            this.liquidKoin = utils.formatUnits(mana.toString(), 8);
          };

          if (balanceSatoshisNumber) {
            updateMana();
            clearInterval(this.intervalMana);
            this.intervalMana = setInterval(updateMana, 1000);
          } else {
            clearInterval(this.intervalMana);
            this.timeRechargeMana = "No mana";
            this.manaPercent = 0;
            this.availablePercent = 0;
            this.liquidKoin = "0";
          }
        } catch (error) {
          console.error("error when loading mana");
          console.error(error);
        }
        this.showLiquidKoin = true;
      } else {
        this.showLiquidKoin = false;
      }

      return {
        balanceSatoshis,
        balance,
        balanceWithSymbol: `${balance} ${t.symbol}`,
        balanceUSD,
      };
    },

    async updateSavedTokens() {
      let tokens = await this._getTokens();

      tokens = await Promise.all(
        tokens.map(async (token) => {
          token.image = emptyToken;
          if (!token.nickname) return token;

          const networkId = this.$store.state.networks.findIndex(
            (n) => n.tag === token.network
          );
          const network = this.$store.state.networks[networkId];
          const provider = new Provider(network.rpcNodes);

          const nicknamesAbi = await this._getAbi(
            token.network,
            network.nicknamesContractId
          );

          const nicknames = new Contract({
            id: network.nicknamesContractId,
            abi: nicknamesAbi,
            provider,
            serializer: await this.newSandboxSerializer(
              nicknamesAbi.koilib_types
            ),
          }).functions;

          const tokenId = `0x${utils.toHexString(
            new TextEncoder().encode(token.nickname)
          )}`;

          try {
            const { result: resultOwner } = await nicknames.owner_of({
              token_id: tokenId,
            });
            if (!resultOwner || !resultOwner.account) {
              return {};
            }
            token.contractId = resultOwner.account;
          } catch (error) {
            console.error(
              `error when loading contract id of @${token.nickname}`
            );
            console.error(error);
            return token;
          }

          try {
            const { result: resultMetadata } = await nicknames.metadata_of({
              token_id: tokenId,
            });
            const metadata = JSON.parse(resultMetadata.value);
            if (metadata.image) token.image = metadata.image;
          } catch (error) {
            console.error(
              `error when loading metadata of token @${token.nickname}`
            );
            console.error(error);
          }

          return token;
        })
      );

      await this._setTokens(tokens);
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
            (!this.tokenId && token.nickname === "koin") ||
            token.contractId === this.tokenId
          ) {
            this.tokenId = token.contractId;
            this.tokenName = token.nickname;
            this.tokenImage = token.image;
            this.tokenSymbol = token.symbol;
            this.balance = balance.balance;
            this.balanceWithSymbol = balance.balanceWithSymbol;
            this.balanceUSD = balance.balanceUSD;
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
        this.tokenId = "";
        this.balance = "Error";

        this.alertDanger(error.message);
        throw error;
      }
    },

    async loadToken(t) {
      this.tokenId = t.contractId;
      this.tokenName = t.nickname;
      this.tokenImage = t.image;
      this.tokenSymbol = t.symbol;
      this.balance = t.balance;
      this.balanceWithSymbol = t.balanceWithSymbol;
      this.balanceUSD = t.balanceUSD;
      this.showLiquidKoin = t.nickname === "koin";
    },

    clickBuy() {
      router.push("/buy");
    },

    sendToken() {
      router.push(`/tokens/send?tokenId=${this.tokenId}`);
    },

    tokenSettings() {
      router.push("/tokens/settings");
    },
  },
};
</script>
<style scoped>
.token {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.token-image {
  width: 3.5em;
  line-height: 0;
  margin-right: 1em;
}

.token-image img {
  max-width: 3.5em;
  max-height: 3.5em;
  border-radius: 50%;
  box-shadow: 0em 0em 2em rgb(151, 151, 151);
}

.other-tokens {
  display: flex;
  flex-direction: row;
  margin: 2em;
}

.mini-token {
  width: 2em;
  line-height: 0;
  margin-right: 1em;
}

.mini-token img {
  max-width: 2em;
  max-height: 2em;
  border-radius: 50%;
}

label {
  width: 100%;
  margin-left: -2em;
  text-align: left;
}
.column {
  display: flex;
  flex-direction: column;
  margin-top: 2em;
  width: 100%;
}
.row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 2em;
}
input {
  margin: 1em 0;
}
.balance {
  font-size: 2.5em;
  font-weight: bold;
  cursor: default;
}
.liquid-koin {
  color: var(--kondor-purple);
}
.usd,
.token-symbol {
  font-weight: 300;
  cursor: default;
}
.actions {
  margin-top: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}

.actions > button {
  background: white;
  color: var(--kondor-purple);
  border: 0;
  display: flex;
  flex-direction: column;
  width: auto;
}

.actions > button > .material-icons {
  background: var(--kondor-purple);
  color: white;
  padding: 0.3em;
  border-radius: 50%;
}

.actions > button:disabled {
  background: white;
  color: #999;
}
.actions > button:disabled > .material-icons {
  background: #999;
}
</style>
