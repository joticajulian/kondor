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
  ],
});
