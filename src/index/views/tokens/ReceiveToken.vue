<template>
  <div class="receive-koin">
    <div class="header">
      <h1>Receive Koin</h1>
    </div>

    <div class="middle">
      <div class="qr-placeholder">
        <!-- We'll replace this with the actual QR code later -->
        <div class="placeholder-square" />
      </div>

      <div class="account-info">
        <span class="account-label">17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW</span>
        <span>
          <img
            src="../../../../public/images/copy-solid.svg"
            alt=""
          >
        </span>
      </div>

      <p class="info-text">
        This address can only be used to receive compatible tokens.
      </p>
    </div>

    <button
      class="custom-button secondary"
      @click="close()"
    >
      Close
    </button>
  </div>
</template>

<script>
export default {
  name: "ReceiveKoin",
  methods: {
    copyAddress() {
      // needs implementation
    },
    close() {
      this.$router.push({ name: "Dashboard" });
    },
  },
};
</script>

<style scoped>
.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.receive-koin {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  padding: 0 2em;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

h1 {
  margin: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 20px;
}

.qr-placeholder {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.placeholder-square {
  width: 170px;
  height: 170px;
  background-color: rgb(86, 86, 86);
}

.account-info {
  background-color: #181818;
  padding: 1em;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 85%;
  color: #777777;
  width: 78%;
}
.account-info span {
  width: 12px;
}
.account-label {
  font-size: 0.6em;
}

.pill-button {
  background-color: var(--kondor-purple);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 0.7em;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s ease;
  width: 20px;
}

.pill-button:hover {
  background-color: #6b4fd9; /* Slightly darker shade for hover state */
}

.pill-button:active {
  background-color: #5a40b8; /* Even darker for active/pressed state */
}

.info-text {
  color: #888;
  font-size: 10px;
  text-align: center;
  margin-bottom: 20px;
  width: 80%;
}

.footer {
  margin-top: auto;
  border-top: 1px solid #2a2a2a;
  padding-top: 10px;
}

.footer-text {
  color: #888;
  font-size: 12px;
}
</style>
