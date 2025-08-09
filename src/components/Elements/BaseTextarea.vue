<template>
  <div class="textarea-wrapper">
    <label v-if="label" class="textarea-label">{{ label }}</label>
    <textarea
      v-model="localValue"
      :placeholder="placeholder"
      class="textarea-field"
      :rows="rows"
      :disabled="disabled"
    ></textarea>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  rows: { type: Number, default: 4 },
  disabled: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.textarea-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
}

.textarea-field {
  background-color: var(--color-surface);
  border: 1px solid var(--color-muted);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: var(--color-text);
  font-size: 1rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.textarea-field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 162, 200, 0.2);
}

.textarea-field:disabled {
  background-color: var(--color-muted);
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
