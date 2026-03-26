import { createRouter, createWebHashHistory } from "vue-router";
import Options from "./views/Options.vue";

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Options",
      component: Options,
    },
  ],
});
