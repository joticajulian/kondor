import Vue from "vue";
import Router from "vue-router";
import Welcome from "./components/Welcome.vue";
import NewWallet from "./components/NewWallet.vue";
import Import from "./components/Import";
import ImportPrivateKey from "./components/ImportPrivateKey";
import Dashboard from "./components/Dashboard.vue";

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
      path: "/import",
      name: "Import",
      component: Import,
    },
    {
      path: "/importPrivateKey",
      name: "ImportPrivateKey",
      component: ImportPrivateKey,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
    },
  ],
});
