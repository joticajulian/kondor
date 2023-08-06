<template>
  <div class="container">
    <a
      href="https://www.mexc.com/exchange/KOIN_USDT"
      target="_blank"
    >Buy KOIN on MEXC <span class="material-icons">open_in_new</span></a>
  </div>
</template>
<script>
import ViewHelper from "@/shared/mixins/ViewHelper";

export default {
  mixins: [ViewHelper],
};
</script>
<style scoped>
.container {
  padding: 2em 0;
  font-size: 1.5em;
}
.material-icons {
  font-size: 1.2em;
  vertical-align: text-bottom;
}
</style>
