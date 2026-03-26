import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "@/shared/store";
import "@/shared/assets/css/kondor.css";
import "./assets/options.css";

createApp(App).use(router).use(store).mount("#app");
