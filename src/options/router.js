import { createRouter } from "vue-router";
import Options from "./components/Options.vue";

export default createRouter({
  routes: [
    {
      path: "/",
      name: "Options",
      component: Options,
    },
  ],
});
