import Vue from "vue";
import Router from "vue-router";
import Loader from "./views/0-Loader.vue";
import GetAccounts from "./views/1-GetAccounts.vue";
// import SignHash from "./views/popup-SignHash.vue";
// import SignMessage from "./views/popup-SignMessage.vue";
// import SignTransaction from "./views/popup-SignTransaction.vue";
import SendTransaction from "./views/2-SendTransaction.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Loader",
      component: Loader,
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
