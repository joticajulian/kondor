import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "@/shared/store";
import "@/shared/assets/css/kondor.css";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
