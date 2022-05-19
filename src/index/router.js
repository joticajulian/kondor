import Vue from "vue";
import Router from "vue-router";
import Welcome from "./components/Welcome.vue";
import NewWallet from "./components/NewWallet.vue";
import ImportPrivateKey from "./components/ImportPrivateKey";
import ImportSeedPhrase from "./components/ImportSeedPhrase";
import Dashboard from "./components/Dashboard.vue";
import GetAccounts from "./components/GetAccounts.vue";
// import SignHash from "./components/SignHash.vue";
// import SignMessage from "./components/SignMessage.vue";
// import SignTransaction from "./components/SignTransaction.vue";
import SendTransaction from "./components/SendTransaction.vue";

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
