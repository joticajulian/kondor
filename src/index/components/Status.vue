<template>
  <div class="app-status">
    <div class="message">
      <router-link
        to="/dashboard"
        class="logo-link"
      >
        <img
          src="../../../public/images/kondor-mark.svg"
          alt="Kondor logo mark"
        >
      </router-link>
      <span class="title">
        {{ title }}
      </span>
    </div>
    <div class="indicator-container">
      <div
        class="status-indicator"
        :class="{ active: isActive }"
      />
    </div>
  </div>
</template>

<script>
import * as packageJson from "../../../package.json";

export default {
  name: "Status",
  props: {
    title: {
      type: String,
      default: `Kondor v${packageJson.version}`,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped>
.message {
  display: flex;
  align-items: center;
  gap: 1em;
}
.app-status {
  background: var(--primary-darker);
  color: var(--primary-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 1em;
}

.logo-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-link img {
  transition: opacity 0.3s ease;
}

.logo-link:hover img {
  opacity: 0.8;
}

.menu-button {
  background: none;
  border: none;
  color: var(--primary-gray);
  cursor: pointer;
}

.title {
  font-size: 1em;
  font-weight: normal;
  margin: 0;
  padding: 0.5em 0;
  text-transform: none;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--network-green);
}

.status-indicator.active {
  background-color: var(--network-green);
}
.indicator-container {
  height: 100%;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-decoration {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #7b68ee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-container {
  background-color: #7b68ee;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  color: var(--kondor-light);
  font-size: 24px;
}
</style>
