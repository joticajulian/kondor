import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
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
          address: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
          mnemonicPath: "m/44'/659'/0'/0/0",
          name: "Account 0",
        },
        {
          address: "1v7APTduCirUiu2S9VerVALdNYuGawZvo",
          mnemonicPath: "m/44'/659'/0'/0/1",
          name: "Account 1",
        },
        {
          address: "13NpGcpXrmC61XDmdXjU2w3sxyhWSEahMP",
          mnemonicPath: "m/44'/659'/0'/0/2",
          name: "Account 2",
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
