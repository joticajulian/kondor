<template>
  <div class="container">
    <div class="loader"></div>
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
  color: var(--kondor-light);
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
  color: white;
}
.recover {
  margin-top: 3em;
}

.loader,
.loader:before,
.loader:after {
  background: linear-gradient(to bottom, #6f00f6 0%, #e2b7ec 100%);
  -webkit-animation: load1 1s infinite ease-in-out;
  animation: load1 1s infinite ease-in-out;
  width: 0.4em;
  height: 5em;
}
.loader {
  color: #6f00f6;
  text-indent: -9999em;
  margin: 88px auto;
  position: relative;
  font-size: 11px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  position: absolute;
  top: 0;
  content: "";
}
.loader:before {
  left: -1.5em;
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.loader:after {
  left: 1.5em;
}
.loader-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
@-webkit-keyframes load1 {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
}
@keyframes load1 {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
}
</style>
