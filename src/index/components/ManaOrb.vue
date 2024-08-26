<template>
  <div :data-tooltip="timeRecharge">
    <div class="orb">
      <div
        class="filler"
        :style="cssVars"
      >
        <div class="spinner color2" />
      </div>
      <div
        class="filler"
        :style="cssVars2"
      >
        <div class="spinner" />
      </div>
      <div class="shine" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    manaPercent: {
      type: Number,
      required: true,
    },
    availablePercent: {
      type: Number,
      required: true,
    },
    timeRecharge: {
      type: String,
      required: true,
    },
  },
  computed: {
    cssVars() {
      return {
        "--fill-to": `-${this.manaPercent / 2 + 25}%`,
      };
    },
    cssVars2() {
      return {
        "--fill-to": `-${this.availablePercent / 2 + 25}%`,
      };
    },
  },
};
</script>
<style scoped>
.orb {
  width: 3.5em;
  height: 3.5em;
  border-radius: 100%;
  border: 1px solid #ddd;
  background-color: var(--kondor-purple);
  position: relative;
  overflow: hidden;
  background-clip: padding-box;
}

.filler {
  position: absolute;
  bottom: -50%;
  left: -50%;
  height: 200%;
  width: 200%;
  animation: fill 2s ease-in-out forwards;
}

.spinner {
  background: var(--primary-light);
  height: 100%;
  width: 100%;
  border-radius: 40%;
  animation: spin 4s ease-out forwards;
}

.color2 {
  background-color: var(--primary-light);
}

.shine {
  position: absolute;
  left: 10%;
  bottom: 10%;
  width: 2.75em;
  height: 2.75em;
  border-radius: 50%;
  box-shadow: inset 3px 0px rgba(255, 255, 255, 0.5);
  transform: rotate(-45deg);
}

@keyframes fill {
  from {
    transform: translateY(-25%);
  }

  to {
    transform: translateY(var(--fill-to));
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(750deg);
  }

  75% {
    transform: rotate(690deg);
  }

  100% {
    transform: rotate(720deg);
  }
}
</style>
