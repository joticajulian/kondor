import Vue from "vue";
import Router from "vue-router";
import Welcome from "./views/1-Welcome.vue";
import NewWallet from "./views/2-NewWallet.vue";
import ImportSeedPhrase from "./views/3a-ImportSeedPhrase";
import ImportPrivateKey from "./views/3b-ImportPrivateKey";
import GenerateSeed from "./views/3c-GenerateSeed";
import ConfirmSeed from "./views/3d-ConfirmSeed";
import Dashboard from "./views/4-Dashboard.vue";
import Signers from "./views/5-Signers.vue";
import CreateAccount from "./views/setting-CreateAccount";
import ImportAccount from "./views/setting-ImportAccount";
import UpdateAccount from "./views/setting-UpdateAccount";
import Buy from "./views/action-Buy";
import SendToken from "./views/tokens/SendToken";
import ReceiveToken from "./views/tokens/ReceiveToken";
import TokenSettings from "./views/tokens/Settings";
import AddToken from "./views/tokens/AddToken";
import AccountHistory from "./views/AccountHistory.vue";

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
      path: "/generateSeed",
      name: "GenerateSeed",
      component: GenerateSeed,
    },
    {
      path: "/confirmSeed",
      name: "ConfirmSeed",
      component: ConfirmSeed,
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
      path: "/importAccount",
      name: "Import Account",
      component: ImportAccount,
    },
    {
      path: "/updateAccount",
      name: "Update Account",
      component: UpdateAccount,
    },
    {
      path: "/buy",
      name: "Buy KOIN",
      component: Buy,
    },
    {
      path: "/tokens/send",
      name: "Send Token",
      component: SendToken,
      props: () => ({ tokenId: "" }),
    },
    {
      path: "/history",
      name: "Account History",
      component: AccountHistory,
      props: () => ({ tokenId: "" }),
    },
    {
      path: "/tokens/receive",
      name: "Receive Token",
      component: ReceiveToken,
      props: () => ({ tokenId: "" }),
    },
    {
      path: "/tokens/add",
      name: "Add Token",
      component: AddToken,
    },
    {
      path: "/tokens/settings",
      name: "Token Settings",
      component: TokenSettings,
    },
  ],
});
