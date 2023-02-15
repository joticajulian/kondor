<template>
  <div id="app">
    <iframe
      id="sandbox"
      src="sandbox.html"
    />
    <Nav />
    <router-view />
    <Alert
      :type="$store.state.alertType"
      :show="$store.state.alertShow"
      :message="$store.state.alertMessage"
      @onClose="$store.state.alertShow = false"
    />
  </div>
</template>

<script>
import Nav from "@/index/components/Nav";
import Alert from "@/shared/components/Alert";

export default {
  components: { Nav, Alert },
};
</script>
