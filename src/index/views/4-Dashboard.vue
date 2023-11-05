<template>
  <div class="column">
    <WidgetTokens />
    <TabPanel address="" />
  </div>
</template>

<script>
import WidgetTokens from "../components/WidgetTokens.vue";
import TabPanel from "../components/TabPanel.vue";

export default {
  components: { WidgetTokens, TabPanel },
};
</script>
<style scoped>
.column {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
