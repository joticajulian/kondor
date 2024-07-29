<template>
  <div>
    <h2>Account History</h2>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      Error: {{ error }}
    </div>
    <ul v-else>
      <li
        v-for="transaction in history"
        :key="transaction.id"
      >
        <!-- Display transaction details -->
        {{ transaction.id }}
      </li>
    </ul>
  </div>
</template>

<script>
import { getAccountHistory } from "@/services/accountService";

export default {
  name: "AccountHistory",
  data() {
    return {
      history: [],
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      try {
        const account = "12vRwxu2nVG2697dM36KMNkmfecNdU8PpR";
        const result = await getAccountHistory(account, {
          limit: 10,
          decode_operations: true,
          decode_events: true,
        });
        this.history = result;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
