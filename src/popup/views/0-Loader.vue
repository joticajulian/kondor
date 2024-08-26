<template>
  <div class="container">
    <div class="loader" />
  </div>
</template>

<script>
// mixins
import Message from "@/popup/mixins/Message";
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  name: "Loader",

  mixins: [Storage, ViewHelper, Message],
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.welcome-message {
  width: 77%;
  margin: 2em 0;
  line-height: 1.2em;
  color: var(--primary-darker);
  text-align: center;
}
.logo {
  display: flex;
  flex-direction: column;
}
.link {
  padding-bottom: 8px;
}
.link:hover {
  color: var(--kondor-light);
}
.recover {
  margin-top: 3em;
}
</style>
