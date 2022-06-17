import Vue from "vue";
import Vuex from "vuex";

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
          name: "Account 2",
          keyPath: "m/44'/659'/2'/0/0",
          address: "13uM85E2sNUhjuyk98F3EftxNZT7uetynP",
        },
      ],
      iv: "b652a4defd2e34b3c44b881d",
      mnemonic:
        "741828937c26cc018ff9a272b1191b4e6531f237a6ccea80d6b34eaaa8be7bc0450ac99fc1599a4e3c7dbebe313f685a58b8aed317bec1a2d693bc9d8e32418df57fd459a2677fe0c207f7473df661bb0cb374994ac56352dbc1",
      salt: "89c31dbb0175c54f2642ee582c610ff3",
    },
    sandboxLoaded: false,

    showAccountMenu: false,
    showBackButton: true,
  },
  mutations: {},
  actions: {},
});
