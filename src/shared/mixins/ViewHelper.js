import router from "@/index/router";

export default {
  name: "View helper mixin",

  data: function () {
    return {
      alertShow: false,
      alertMessage: "",
      alertType: "",
    };
  },

  created() {
    switch (router.currentRoute.path) {
      case "/":
        this.$store.state.showAccountMenu = false;
        this.$store.state.showBackButton = false;
        break;
      case "/dashboard":
        this.$store.state.showAccountMenu = true;
        this.$store.state.showBackButton = true;
        break;
      default:
        this.$store.state.showAccountMenu = false;
        this.$store.state.showBackButton = true;
        break;
    }
  },

  methods: {
    alertSuccess(message) {
      this.$store.state.alertType = "success";
      this.$store.state.alertMessage = message;
      this.$store.state.alertShow = true;
    },
    alertDanger(error) {
      let message = error;
      if (typeof error !== "string") {
        console.error(error);
        if (error && error.message) message = error.message;
      }
      this.$store.state.alertType = "danger";
      this.$store.state.alertMessage = message;
      this.$store.state.alertShow = true;
    },
    alertInfo(message) {
      this.$store.state.alertType = "info";
      this.$store.state.alertMessage = message;
      this.$store.state.alertShow = true;
    },
    alertClose() {
      this.$store.state.alertType = "";
      this.$store.state.alertMessage = "";
      this.$store.state.alertShow = false;
    },
  },
};
