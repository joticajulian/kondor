<template>
  <div id="app">
    <iframe
      id="sandbox"
      src="sandbox.html"
      @load="$store.state.sandboxLoaded = true"
    />
    <!--<Nav />-->
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
import Alert from "@/shared/components/Alert";

export default {
  components: { Alert },
};
</script>
