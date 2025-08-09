<template>
  <section
    class="section"
    :style="backgroundStyle"
    :class="contentAlignClass"
    data-aos="fade-up"
  >
    <div class="section-overlay">
      <div class="section-content">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  image: {
    type: String,
    default: null,
  },
  align: {
    type: String,
    default: "center",
    validator: (val) => ["center", "left", "right"].includes(val),
  },
  animation: {
    type: String,
    default: "fade-up",
  },
});

const backgroundStyle = computed(() => {
  return props.image
    ? {
        backgroundImage: `url(${props.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        backgroundColor: "var(--color-surface)",
      };
});

const contentAlignClass = computed(() => ({
  "align-center": props.align === "center",
  "align-left": props.align === "left",
  "align-right": props.align === "right",
}));
</script>

<style scoped>
.section {
  width: 100%;
  min-height: 90vh;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  transition: background 0.3s ease;
}

.section-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--section-overlay-color, rgba(0, 0, 0, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  z-index: 1;
  transition: background-color 0.3s ease;
}

.section-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  color: var(--color-text);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.align-center {
  align-items: center;
  text-align: center;
}
.align-left {
  align-items: flex-start;
  text-align: left;
}
.align-right {
  align-items: flex-end;
  text-align: right;
}

@media (max-width: 768px) {
  .section-overlay {
    padding: 2rem 1rem;
  }

  .section-content {
    padding: 1.5rem 1rem;
  }
}
</style>
