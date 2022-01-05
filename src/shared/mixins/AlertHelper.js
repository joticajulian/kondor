export default {
  name: "Alert mixin",

  data: function () {
    return {
      alertShow: false,
      alertMessage: "",
      alertType: "",
    };
  },

  methods: {
    alertSuccess(message) {
      this.$store.state.alertType = "success";
      this.$store.state.alertMessage = message;
      this.$store.state.alertShow = true;
    },
    alertDanger(message) {
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
