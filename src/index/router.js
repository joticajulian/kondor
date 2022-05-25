import Vue from "vue";
import Router from "vue-router";
import Welcome from "./views/1-Welcome.vue";
import NewWallet from "./views/2-NewWallet.vue";
import ImportSeedPhrase from "./views/3a-ImportSeedPhrase";
import ImportPrivateKey from "./views/3b-ImportPrivateKey";
import Dashboard from "./views/4-Dashboard.vue";
import Signers from "./views/5-Signers.vue";
import CreateAccount from "./views/setting-CreateAccount";
import GetAccounts from "./views/popup-GetAccounts.vue";
// import SignHash from "./views/popup-SignHash.vue";
// import SignMessage from "./views/popup-SignMessage.vue";
// import SignTransaction from "./views/popup-SignTransaction.vue";
import SendTransaction from "./views/popup-SendTransaction.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Welcome",
      component: Welcome,
    },
    {
      path: "/newWallet",
      name: "NewWallet",
      component: NewWallet,
    },
    {
      path: "/importPrivateKey",
      name: "ImportPrivateKey",
      component: ImportPrivateKey,
    },
    {
      path: "/importSeedPhrase",
      name: "ImportSeedPhrase",
      component: ImportSeedPhrase,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
    },
    {
      path: "/signers",
      name: "Signers",
      component: Signers,
    },
    {
      path: "/createAccount",
      name: "Create Account",
      component: CreateAccount,
    },
    {
      path: "/getAccounts",
      name: "Get Accounts",
      component: GetAccounts,
    },
    /*{
      path: "/signHash",
      name: "Sign Hash",
      component: SignHash,
    },
    {
      path: "/signMessage",
      name: "Sign Message",
      component: SignMessage,
    },
    {
      path: "/signTransaction",
      name: "Sign Transaction",
      component: SignTransaction,
    },*/
    {
      path: "/sendTransaction",
      name: "Send Transaction",
      component: SendTransaction,
    },
  ],
});
