<template>
  <div class="home">
    <SectionComponent
      animation="fade-up"
      :image="require('@/assets/images/sections/1.jpeg')"
    >
      <h1>
        Welcome to
        <span style="color: var(--color-accent)"> YallaBus </span>
      </h1>
      <p>Your smart inter-city transportation solution</p>
    </SectionComponent>
  </div>
</template>

<script>
import SectionComponent from "@/components/SectionComponent.vue";

export default {
  name: "HomeView",
  components: {
    SectionComponent,
  },
  beforeRouteEnter(to, from, next) {
    if (from.path === "/login" && to.path === "/") {
      // Defer reload until after the component has mounted
      next(() => {
        location.reload();
      });
    } else {
      next();
    }
  },
};
</script>
