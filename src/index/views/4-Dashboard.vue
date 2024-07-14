<template>
  <div class="column">
    <div class="content">
      <WalletInfo />
      <TabPanel address="" />
    </div>
  </div>
</template>

<script>
import WalletInfo from "../components/WalletInfo.vue";
import TabPanel from "../components/TabPanel.vue";

export default {
  components: { WalletInfo, TabPanel },
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
  height: 485px;
}

.status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;/* Add a background color to ensure it's visible */
  z-index: 1; /* Ensure it stays on top of other content */
}

</style>
