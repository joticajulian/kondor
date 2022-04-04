import { createApp, h } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/shared/assets/css/kondor.css";
import "./assets/options.css";

const app = createApp({
  store,
  render: () => h(App),
})

app.mount('#app');
app.use(router);
