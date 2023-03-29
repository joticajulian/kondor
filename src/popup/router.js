import Vue from "vue";
import Router from "vue-router";
import Loader from "./views/0-Loader.vue";
import GetAccounts from "./views/1-GetAccounts.vue";
// import SignHash from "./views/popup-SignHash.vue";
import SignSendTransaction from "./views/2-SignSendTransaction.vue";
import SignMessage from "./views/3-SignMessage.vue";

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
    },*/
    {
      path: "/signMessage",
      name: "Sign Message",
      component: SignMessage,
    },
    {
      path: "/signTransaction",
      name: "Sign Transaction",
      component: SignSendTransaction,
      props: () => ({ send: false }),
    },
    {
      path: "/sendTransaction",
      name: "Send Transaction",
      component: SignSendTransaction,
      props: () => ({ send: true }),
    },
  ],
});
