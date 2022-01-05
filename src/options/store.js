import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    privateKey: null,
    alertShow: false,
    alertMessage: "",
    alertType: "",
    testData: {},
  },
  mutations: {},
  actions: {},
});
