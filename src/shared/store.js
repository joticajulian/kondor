import Vue from "vue";
import Vuex from "vuex";
import { utils } from "koilib";
import * as storage from "../../lib/storage";
import { fetchTokenPrices } from "../services/tokenPriceService";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    password: "",
    mnemonic: null,
    accounts: [],
    currentIndexAccount: 0,
    alertShow: false,
    alertMessage: "",
    alertType: "",
    requests: [],
    networks: [],
    currentNetwork: 0,
    testDataSession: {},
    testData: {
      /*
       * Test Data
       * only used when process.env.VUE_APP_ENV === "test"
       *
       * mnemonic: world fan solution purse offer wide cigar yard want ordinary extend rubber
       * password: a
       */
      accounts: [
        {
          name: "Account 0",
          keyPath: "m/44'/659'/0'/0/0",
          address: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
        },
        {
          name: "Account 1",
          keyPath: "m/44'/659'/1'/0/0",
          address: "1M1mXKrtB5QDscNmb1tVGfJeAW2G2aawgB",
        },
        {
          name: "Imported Account 1",
          encryptedPrivateKey: "",
          address: "1ALMyHELPNfRNanBFS2F6rdG9q1Tuy3PCS",
        },
        {
          name: "Account 2",
          keyPath: "m/44'/659'/2'/0/0",
          address: "13uM85E2sNUhjuyk98F3EftxNZT7uetynP",
        },
      ],
      iv: "b652a4defd2e34b3c44b881d",
      mnemonic:
        "741828937c26cc018ff9a272b1191b4e6531f237a6ccea80d6b34eaaa8be7bc0450ac99fc1599a4e3c7dbebe313f685a58b8aed317bec1a2d693bc9d8e32418df57fd459a2677fe0c207f7473df661bb0cb374994ac56352dbc1",
      salt: "89c31dbb0175c54f2642ee582c610ff3",
      networks: storage.DEFAULT_NETWORKS,
      currentNetwork: storage.DEFAULT_CURRENT_NETWORK,
      "mainnet-abi-15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL": utils.tokenAbi,
      "harbinger-abi-19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ": utils.tokenAbi,
    },
    sandboxLoaded: false,

    showBackButton: false,
    showCurrentNetwork: true,
    showAvatarMenu: true,
    showAccountMenu: false,
    tokenPrices: {},
    totalBalance: "0.00",
  },
  mutations: {
    SET_TOKEN_PRICES(state, prices) {
      state.tokenPrices = prices;
    },
    SET_TOTAL_BALANCE(state, balance) {
      state.totalBalance = balance;
    },
  },
  actions: {
    async fetchTokenPrices({ commit }, accountAddress) {
      try {
        const result = await fetchTokenPrices(accountAddress);
        console.log(
          "Fetched token prices for account:",
          accountAddress,
          result
        );
        const prices = {};
        result.tokens.forEach((token) => {
          prices[token.symbol] = token.price;
        });
        console.log("Processed prices for account:", accountAddress, prices);
        commit("SET_TOKEN_PRICES", prices);
      } catch (error) {
        console.error(
          "Error fetching token prices for account:",
          accountAddress,
          error
        );
      }
    },
    async calculateTotalBalance({ commit, state }) {
      console.time("store:calculateTotalBalance");
      try {
        let total = 0;
        const tokenBalances =
          state.accounts[state.currentIndexAccount].tokenBalances || {};

        for (const [symbol, balance] of Object.entries(tokenBalances)) {
          const price = state.tokenPrices[symbol] || 0;
          total += balance * price;
        }

        commit("SET_TOTAL_BALANCE", total.toFixed(2));
      } catch (error) {
        console.error("Error calculating total balance:", error);
        commit("SET_TOTAL_BALANCE", "0.00");
      }
      console.timeEnd("store:calculateTotalBalance");
    },
    async fetchAllAccountsPrices({ state, dispatch }) {
      console.log("updating prices for all accounts", state.accounts);
      for (const account of state.accounts) {
        await dispatch("fetchTokenPrices", account.address);
      }
    },
  },
});
