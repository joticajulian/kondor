<template>
  <div class="column">
    <WalletInfo
      :balance="totalBalance"
      :mana-percentage="manaPercent"
      :liquid-koin="liquidKoin"
    />
    <TabPanel
      :address="address"
      :coins="miniTokens"
      :prices="tokenPrices"
      :is-testnet="isTestnet"
      @refresh-coins="handleRefreshCoins"
    />
  </div>
</template>

<script>
import axios from "axios";
import router from "@/index/router";
import { Contract, Provider, Signer, utils } from "koilib";
import emptyToken from "@/shared/assets/empty-token.png";
import WalletInfo from "./WalletInfo.vue";
import TabPanel from "./TabPanel.vue";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";
import Sandbox from "@/shared/mixins/Sandbox";
import { formatTime } from "../../../lib/utils";

const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000

function fromHexToUtf8(hex) {
  return new TextDecoder().decode(utils.toUint8Array(hex));
}

function fromUtf8ToHex(utf8) {
  return "0x" + utils.toHexString(new TextEncoder().encode(utf8));
}

export default {
  components: { WalletInfo, TabPanel },
  mixins: [Storage, Sandbox, ViewHelper],
  data() {
    return {
      tokenId: "",
      tokenName: "",
      tokenImage: "",
      tokenSymbol: "",
      tokenAddressPermanent: true,
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
      tokenPrices: {},
    };
  },

  computed: {
    balanceFormatted() {
      if (!this.balance) return this.balance;
      const balanceNumber = Number(this.balance) || 0;
      if (Number.isNaN(balanceNumber)) return `Error ${balanceNumber}`;
      return balanceNumber.toLocaleString("en");
    },
    totalBalance() {
      return this.miniTokens
        .reduce((t, miniToken) => {
          if (!miniToken.price) return t;
          return t + miniToken.price * Number(miniToken.balance);
        }, 0)
        .toLocaleString();
    },
    isTestnet() {
      return this.$store.state.currentNetwork === 1;
    },
  },

  watch: {
    "$store.state.currentIndexAccount": async function () {
      await this.loadAccount(this.$store.state.currentIndexAccount);
      await this.$store.dispatch("fetchTokenPrices", this.address);
    },
    "$store.state.currentNetwork": async function () {
      await this.loadNetwork();
      this.tokenId = "";
      await this.loadAccount(this.$store.state.currentIndexAccount);
      await this.$store.dispatch("fetchTokenPrices", this.address);
    },
  },

  async mounted() {
    try {
      console.log("Component mounted");
      this.serializer = await this.newSandboxSerializer(
        utils.tokenAbi.koilib_types
      );
      console.log("Serializer created");
      await this.loadNetwork();
      console.log("Network loaded");
      let index = await this._getCurrentIndexAccount();
      if (Number.isNaN(Number(index))) index = 0;
      console.log(`Current index account: ${index}`);
      if (index === this.$store.state.currentIndexAccount) {
        await this.loadAccount(this.$store.state.currentIndexAccount);
      } else {
        this.$store.state.currentIndexAccount = index;
      }
      await this.updateSavedTokens();
      console.log("Saved tokens updated");
    } catch (error) {
      console.error("Error in mounted hook:", error);
      this.alertDanger("Failed to initialize wallet");
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
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    async loadTokenBalance(t) {
      console.log(`Starting loadTokenBalance for ${t.nickname}`);
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
        console.log(`Raw balance for ${t.nickname}:`, balanceSatoshis);
        console.log(`Formatted balance for ${t.nickname}:`, balance);
      } catch (error) {
        console.error(
          `Error while loading the balance of @${t.nickname}:`,
          error
        );
        return {
          balanceSatoshis: "Error",
          balance: "Error",
          balanceWithSymbol: "Error",
          balanceUSD: "Error",
        };
      }

      // load USD balance
      let price = 0;
      let balanceUSD = "$0 USD";
      if (this.network.tag === "mainnet" && t.nickname === "koin") {
        try {
          const response = await axios.get(
            "https://www.mexc.com/open/api/v2/market/ticker?symbol=koin_usdt"
          );
          price = parseFloat(response.data.data[0].last);
          const balanceNumber = Number(balance);
          balanceUSD = `$${(balanceNumber * price).toFixed(2)} USD`;
          this.tokenPrices[t.symbol] = price;
          console.log(`USD price loaded for ${t.nickname}:`, price);
        } catch (error) {
          console.error(
            `Error when loading price for ${t.nickname} from MEXC API:`,
            error
          );
          balanceUSD = "USD Price Unavailable";
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
          } catch (error) {
            console.error("Error getting reserved account RC:", error);
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
          console.log("Mana data loaded for KOIN");
        } catch (error) {
          console.error("Error when loading mana:", error);
        }
        this.showLiquidKoin = true;
      } else {
        this.showLiquidKoin = false;
      }

      console.log(`loadTokenBalance completed for ${t.nickname}`);
      return {
        balanceSatoshis,
        balance,
        balanceWithSymbol: `${balance} ${t.symbol}`,
        balanceUSD,
        price,
      };
    },

    async handleRefreshCoins() {
      console.log("Starting handleRefreshCoins");
      try {
        console.log("About to call loadTokens");
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (this.network && this.provider) {
              clearInterval(interval);
              resolve();
            }
          }, 2);
        });
        await this.loadTokens();
        console.log("loadTokens completed successfully");
      } catch (error) {
        console.error("Error in handleRefreshCoins:", error);
        console.error("Error stack:", error.stack);
        this.alertDanger("Failed to refresh coins");
      } finally {
        console.log("handleRefreshCoins completed");
      }
    },

    async updateSavedTokens() {
      let tokens = await this._getTokens();

      const nicknamesAbi = await this._getAbi(
        "mainnet", // both mainnet and testnet use the same ABI
        this.$store.state.networks.find((n) => n.tag === "mainnet")
          .nicknamesContractId
      );

      const serializer = await this.newSandboxSerializer(
        nicknamesAbi.koilib_types
      );

      tokens = await Promise.all(
        tokens.map(async (token) => {
          token.image = emptyToken;
          // if (!token.nickname) return token;

          const networkId = this.$store.state.networks.findIndex(
            (n) => n.tag === token.network
          );
          const network = this.$store.state.networks[networkId];
          const provider = new Provider(network.rpcNodes);

          const nicknames = new Contract({
            id: network.nicknamesContractId,
            abi: nicknamesAbi,
            provider,
            serializer,
          }).functions;

          let tokenId = "";
          if (token.nickname) {
            tokenId = fromUtf8ToHex(token.nickname);
          } else {
            const { result } = await nicknames.get_main_token({
              value: token.contractId,
            });
            if (result && result.token_id) {
              tokenId = result.token_id;
              token.nickname = fromHexToUtf8(tokenId);
            } else {
              return token;
            }
          }

          try {
            const { result: resultAddress } = await nicknames.get_address({
              value: token.nickname,
            });
            if (!resultAddress || !resultAddress.value) {
              return token;
            }
            token.contractId = resultAddress.value;
            token.permanentAddress =
              !!resultAddress.address_modifiable_only_by_governance ||
              !!resultAddress.permanent_address;
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
      console.log("Starting loadTokens");
      try {
        let t;
        try {
          t = await this._getTokens();
          console.log("Tokens fetched:", t);
        } catch (error) {
          console.error("Error in _getTokens:", error);
          throw new Error("Failed to fetch tokens");
        }

        this.miniTokens = [];

        for (const token of t) {
          try {
            console.log(`Processing token: ${token.nickname}`);
            // check network of token
            if (token.network !== this.network.tag) {
              console.log(
                `Skipping token ${token.nickname} due to network mismatch`
              );
              continue;
            }

            // check current address
            if (token.addresses && token.addresses.length > 0) {
              if (!token.addresses.includes(this.address)) {
                console.log(
                  `Skipping token ${token.nickname} due to address mismatch`
                );
                continue;
              }
            }
            if (token.noAddresses && token.noAddresses.length > 0) {
              if (token.noAddresses.includes(this.address)) {
                console.log(
                  `Skipping token ${token.nickname} due to noAddresses match`
                );
                continue;
              }
            }

            let balance;
            try {
              balance = await this.loadTokenBalance(token);
              console.log(`Balance loaded for ${token.nickname}:`, balance);
            } catch (balanceError) {
              console.error(
                `Error loading balance for token ${token.nickname}:`,
                balanceError
              );
              continue;
            }

            const miniToken = {
              ...token,
              ...balance,
            };

            if (
              (!this.tokenId && token.nickname === "koin") ||
              token.contractId === this.tokenId
            ) {
              try {
                this.loadToken(miniToken);
              } catch (loadTokenError) {
                console.error(
                  `Error in loadToken for ${token.nickname}:`,
                  loadTokenError
                );
              }
            }

            // skip repeated tokens (if any)
            if (
              !this.miniTokens.find((m) => m.contractId === token.contractId)
            ) {
              this.miniTokens.push(miniToken);
            }
          } catch (tokenError) {
            console.error(
              `Error processing token ${token.nickname}:`,
              tokenError
            );
            // Continue processing other tokens
          }
        }

        console.log("All tokens processed");
        this.miniTokens.sort((a, b) => {
          const idA = t.findIndex((tt) => tt.contractId === a.contractId);
          const idB = t.findIndex((tt) => tt.contractId === b.contractId);
          if (idA > idB) return 1;
          if (idA < idB) return -1;
          return 0;
        });

        console.log("loadTokens completed successfully");
      } catch (error) {
        console.error("Error in loadTokens:", error);
        console.error("Error stack:", error.stack);
        throw error;
      }
    },

    async loadAccount(index) {
      console.log(`Starting loadAccount for index ${index}`);
      this.tokenName = "";
      this.tokenImage = "";
      this.tokenSymbol = "";
      this.balanceWithSymbol = "";
      this.balance = "";

      if (this.$store.state.accounts.length === 0) {
        console.log("No accounts found in store");
        return;
      }
      try {
        const currentAccount = this.$store.state.accounts[index];
        this.address = currentAccount.address;
        console.log(`Loading account for address: ${this.address}`);
        this.signer = undefined;
        if (currentAccount.privateKey) {
          this.signer = Signer.fromWif(currentAccount.privateKey, true);
          this.signer.provider = this.provider;
          this.signer.rcOptions = { estimateRc: false };
          this.watchMode = false;
          console.log("Signer created for account");
        } else {
          this.watchMode = true;
          console.log("Account in watch mode");
        }
        await this.loadTokens();
        console.log("Tokens loaded successfully");
      } catch (error) {
        console.error("Error in loadAccount:", error);
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
      // this.tokenAddressPermanent = t.permanentAddress;
      // TODO: temporal code. Use previous line in the next version
      this.tokenAddressPermanent =
        t.permanentAddress || t.nickname === "koin" || t.nickname === "vhp";
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
  color: var(--kondor-light);
  padding: 0.3em;
  border-radius: 50%;
}

.actions > button:disabled {
  background: white;
  color: var(--primary-gray);
}
.actions > button:disabled > .material-icons {
  background: var(--primary-gray);
}

.notpermanent {
  background-color: var(--kondor-red);
  color: var(--kondor-light);
  border-radius: 8px;
  padding: 0.2rem 0.6rem;
  margin: 0.5em 2em 0em 2em;
  width: 7rem;
  text-align: center;
}
</style>
