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
      this.$store.state.showBackButton = false;
      this.$store.state.showCurrentNetwork = false;
      this.$store.state.showAvatarMenu = false;
      this.$store.state.showAccountMenu = false;
      break;
    case "/newWallet":
    case "/importSeedPhrase":
    case "/importPrivateKey":
    case "/generateSeed":
    case "/confirmSeed":
      this.$store.state.showBackButton = true;
      this.$store.state.showCurrentNetwork = false;
      this.$store.state.showAvatarMenu = false;
      this.$store.state.showAccountMenu = false;
      break;
    case "/dashboard":
    case "/tokens/send":
      this.$store.state.showBackButton = false;
      this.$store.state.showCurrentNetwork = true;
      this.$store.state.showAvatarMenu = true;
      this.$store.state.showAccountMenu = true;
      break;
    case "/send":
      this.$store.state.showBackButton = true;
      this.$store.state.showCurrentNetwork = true;
      this.$store.state.showAvatarMenu = true;
      this.$store.state.showAccountMenu = true;
      break;
    default:
      this.$store.state.showBackButton = true;
      this.$store.state.showCurrentNetwork = true;
      this.$store.state.showAvatarMenu = true;
      this.$store.state.showAccountMenu = false;
      break;
    }
  },

  methods: {
    debounce(fn, wait = 300) {
      let timer;
      return (...args) => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, wait);
      };
    },
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
