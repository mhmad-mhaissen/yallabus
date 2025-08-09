<template>
  <form class="form" @submit.prevent="onSubmit">
    <h2 v-if="title" class="form-title">{{ title }}</h2>

    <!-- Slot for your custom fields -->
    <div class="form-content">
      <slot />
    </div>

    <!-- Submit button -->
    <button v-if="showSubmit" type="submit" class="submit-btn">
      {{ submitText }}
    </button>
  </form>
</template>

<script setup>
defineProps({
  title: String,
  submitText: { type: String, default: "Submit" },
  showSubmit: { type: Boolean, default: true },
});

const emit = defineEmits(["submit"]);

function onSubmit(event) {
  emit("submit", event);
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--color-surface);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.form-title {
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submit-btn {
  background: var(--gradient-primary);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  cursor: pointer;
  transition: filter 0.2s;
}

.submit-btn:hover {
  filter: brightness(1.05);
}
</style>
