<template>
  <div class="column">
    <div class="row">
      <div class="token">
        <div class="token-image">
          <img :src="tokenImage">
        </div>
        <div class="amount">
          <div>
            <span class="balance">{{ balance }}</span>
            <span class="token-symbol">{{ tokenSymbol }}</span>
          </div>
          <div class="usd">
            {{ balanceUSD }}
          </div>
        </div>
      </div>
      <ManaOrb
        :mana-percent="manaPercent"
        :time-recharge="timeRechargeMana"
      />
    </div>
    <div class="other-tokens">
      <div
        v-for="(miniToken, i) in otherTokens"
        :key="i"
        class="mini-token"
        :data-tooltip="miniToken.balanceWithSymbol"
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
      <button @click="clickSend()">
        <span class="material-icons">arrow_outward</span><span>Send</span>
      </button>
      <button
        disabled
        @click="clickSwap()"
      >
        <span class="material-icons">swap_horiz</span><span>Swap</span>
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "@/index/router";
import { Contract, Provider, Signer, utils } from "koilib";
import ManaOrb from "./ManaOrb.vue";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";

// logos
import koinLogo from "@/shared/assets/logo.png";

const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000

function deltaTimeToString(milliseconds) {
  if (Number.isNaN(milliseconds)) return "";

  var seconds = Math.floor(milliseconds / 1000);

  var interval = seconds / 86400;
  if (interval > 2) return Math.floor(interval) + " days";

  interval = seconds / 3600;
  if (interval > 2) return Math.floor(interval) + " hours";

  interval = seconds / 60;
  if (interval > 2) return Math.floor(interval) + " minutes";

  interval = Math.floor(seconds);
  if (interval === 0) return "Mana recharged";
  return interval + " seconds";
}

export default {
  components: { ManaOrb },
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      tokenId: "",
      tokenImage: koinLogo,
      tokenSymbol: "KOIN",
      otherTokens: [
        {
          image: koinLogo,
          nickname: "koin",
          symbol: "KOIN",
          decimals: 8,
          balance: "200",
          balanceSatoshis: "200000",
          balanceWithSymbol: "200 KOIN",
          balanceUSD: "$0 USD",
        },
        {
          image: koinLogo,
          nickname: "vhp",
          symbol: "VHP",
          decimals: 8,
          balance: "300",
          balanceSatoshis: "30000000",
          balanceWithSymbol: "300 VHP",
          balanceUSD: "$0 USD",
        },
        {
          image: koinLogo,
          nickname: "eth",
          symbol: "ETH",
          decimals: 18,
          balance: "0.45",
          balanceSatoshis: "45",
          balanceWithSymbol: "0.45 ETH",
          balanceUSD: "$0 USD",
        },
      ],
      address: "loading ",
      balance: "loading...",
      balanceUSD: "$0 USD",
      signer: null,
      provider: null,
      serializer: null,
      nicknames: null,
      intervalMana: null,
      timeRechargeMana: "loading...",
      watchMode: false,
      manaPercent: 1,
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

  async mounted() {
    await this.loadNetwork();
    const index = await this._getCurrentIndexAccount();
    this.$store.state.currentIndexAccount = index ? index : 0;
    await this.loadAccount(this.$store.state.currentIndexAccount);
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
        this.serializer = await this.newSandboxSerializer(
          utils.tokenAbi.koilib_types
        );
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
      const { result } = await contract.functions.balanceOf({
        owner: this.address,
      });
      const balanceSatoshis = result.value;
      const balance = utils.formatUnits(balanceSatoshis, t.decimals);

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
          const initialMana = Number(rc) / 1e8;
          const lastUpdateMana = Date.now();

          const updateMana = () => {
            const delta = Math.min(Date.now() - lastUpdateMana, FIVE_DAYS);
            let mana =
              initialMana + (delta * balanceSatoshisNumber) / FIVE_DAYS;
            mana = Math.min(mana, balanceSatoshisNumber);
            this.timeRechargeMana = deltaTimeToString(
              ((balanceSatoshisNumber - mana) * FIVE_DAYS) /
                balanceSatoshisNumber
            );
            this.manaPercent = Math.floor((mana / balanceSatoshisNumber) * 100);
          };

          updateMana();
          clearInterval(this.intervalMana);
          this.intervalMana = setInterval(updateMana, 1000);
        } catch (error) {
          console.error("error when loading mana");
          console.error(error);
        }
      }

      return {
        balanceSatoshis,
        balance,
        balanceWithSymbol: `${balance} ${t.symbol}`,
        balanceUSD,
      };
    },

    async loadTokens() {
      const t = await this._getTokens();
      const tokens = [];
      await Promise.all(
        t.forEach(async (token) => {
          // check network of token
          if (token.networks) {
            if (!token.networks.includes(this.network.tag)) {
              return;
            }
          }

          // check current address
          if (token.addresses) {
            if (!token.addresses.includes(this.address)) {
              return;
            }
          }
          if (token.noAddresses) {
            if (token.noAddresses.includes(this.address)) {
              return;
            }
          }

          // resolve contract ID
          if (!token.contractId || !token.nickname) {
            return;
          }

          if (token.nickname) {
            const tokenId = `0x${utils.toHexString(
              new TextEncoder().encode(token.nickname)
            )}`;
            const { result: resultOwner } = await this.nicknames.owner_of({
              token_id: tokenId,
            });
            if (!resultOwner || !resultOwner.account) {
              return;
            }
            token.contractId = resultOwner.account;

            const { result: resultMetadata } = await this.nicknames.metadata_of(
              {
                token_id: tokenId,
              }
            );

            token.image = "";
            try {
              const metadata = JSON.parse(resultMetadata.value);
              token.image = metadata.image || "";
            } catch (error) {
              console.error(
                `error when loading metadata of token @${token.nickname}`
              );
              console.error(error);
              return;
            }
          }

          const balance = await this.loadTokenBalance(token);

          tokens.push({
            ...token,
            ...balance,
          });
        })
      );
      return tokens;
    },

    async loadAccount(index) {
      if (this.$store.state.accounts.length === 0) return;
      try {
        const currentAccount = this.$store.state.accounts[index];
        this.address = currentAccount.address;
        this.signer = undefined;
        if (currentAccount.privateKey) {
          this.signer = Signer.fromWif(currentAccount.privateKey, true);
          this.signer.provider = this.provider;
          this.watchMode = false;
        } else {
          this.watchMode = true;
        }
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }

      const tokens = await this.loadTokens();

      let mainTokenIndex = tokens.findIndex(
        (t) => t.contractId === this.tokenId
      );
      if (mainTokenIndex < 0) mainTokenIndex = 0;

      const [mainToken] = tokens.splice(mainTokenIndex, 1);
      this.tokenId = mainToken.contractId;
      this.tokenImage = mainToken.image;
      this.tokenSymbol = mainToken.symbol;
      this.balance = mainToken.balance;
      this.otherTokens = tokens;
    },

    async loadToken(t) {
      this.tokenId = t.contractId;
      this.tokenImage = t.image;
      this.tokenSymbol = t.symbol;
      this.balance = t.balance;
    },

    clickBuy() {
      router.push("/buy");
    },

    clickSend() {
      router.push("/send");
    },

    clickSwap() {
      router.push("/swap");
    },
  },
};
</script>
<style scoped>
.token {
  display: flex;
  flex-direction: row;
}
.token-image {
  width: 3em;
  line-height: 0;
  margin-right: 1em;
}

.token-image img {
  width: inherit;
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
  width: inherit;
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
  align-items: center;
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
