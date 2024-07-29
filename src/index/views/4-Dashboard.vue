<template>
  <div class="column">
    <div class="content">
      <WidgetTokens />
    </div>
  </div>
</template>

<script>
import WidgetTokens from "../components/WidgetTokens.vue";

export default {
  components: { WidgetTokens },

  data() {
    return {
      currentAddress: "",
    };
  },

  computed: {
    currentIndexAccount() {
      return this.$store.state.currentIndexAccount;
    },
  },

  watch: {
    currentIndexAccount: "loadAccount",
  },

  mounted() {
    this.loadAccount();
  },

  methods: {
    loadAccount() {
      if (this.$store.state.accounts.length === 0) return;
      const index = this.$store.state.currentIndexAccount;
      this.currentAddress = this.$store.state.accounts[index].address;
      console.log("Current address loaded:", this.currentAddress);
    },
  },
};
</script>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 560px;
  position: relative;
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  height: 475px;
}

.debug-info {
  background-color: #f0f0f0;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
</style>
