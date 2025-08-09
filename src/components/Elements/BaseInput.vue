<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      v-model="inputValue"
      class="input-field"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  type: { type: String, default: "text" },
  disabled: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
}

.input-field {
  background-color: var(--color-surface);
  border: 1px solid var(--color-muted);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: var(--color-text);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 162, 200, 0.2); /* uses primary color */
}

.input-field:disabled {
  background-color: var(--color-muted);
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
