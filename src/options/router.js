import Vue from "vue";
import Router from "vue-router";
import Options from "./components/Options.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Options",
      component: Options,
    },
  ],
});
