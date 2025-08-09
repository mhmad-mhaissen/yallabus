<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content" :style="{ maxWidth: maxWidth }">
        <header>
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="close">&times;</button>
        </header>

        <!-- View Mode -->
        <template v-if="mode === 'view'">
          <div v-if="data && Object.keys(data).length" class="modal-body">
            <ul class="details-list">
              <template v-for="(value, key) in flattenedData" :key="key">
                <li>
                  <strong>{{ formatKey(key) }}:</strong>
                  <span>{{ value }}</span>
                </li>
              </template>
            </ul>
          </div>
          <div v-else class="empty-state">No data to display.</div>
        </template>

        <!-- Confirm Mode -->
        <template v-else-if="mode === 'confirm'">
          <div class="modal-body confirm-body">
            <p>{{ confirmMessage }}</p>
            <div class="modal-actions">
              <button class="btn cancel" @click="close">Cancel</button>
              <button class="btn confirm" @click="confirmAction">
                Confirm
              </button>
            </div>
          </div>
        </template>

        <!-- Custom Mode -->
        <template v-else-if="mode === 'custom'">
          <div class="modal-body">
            <slot />
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  visible: Boolean,
  data: Object,
  title: { type: String, default: "Details" },
  maxWidth: { type: String, default: "600px" },
  mode: { type: String, default: "view" },
  confirmMessage: { type: String, default: "Are you sure?" },
});

const emit = defineEmits(["close", "confirm"]);

const close = () => emit("close");
const confirmAction = () => emit("confirm");

function flattenObject(obj, prefix = "") {
  return Object.entries(obj || {}).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(acc, flattenObject(v, key));
    } else {
      acc[key] = v == null ? "" : v;
    }
    return acc;
  }, {});
}

const flattenedData = computed(() => flattenObject(props.data));

function formatKey(key) {
  return key
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: var(--color-surface);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  color: var(--color-text);
  max-height: 80vh;
  overflow-y: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--color-muted);
}
.close-btn:hover {
  color: var(--color-accent);
}

.details-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.details-list li {
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-muted);
}

.details-list li strong {
  color: var(--color-primary);
}

.empty-state {
  color: var(--color-muted);
  font-style: italic;
  text-align: center;
}

.confirm-body {
  text-align: center;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn.cancel {
  background: var(--color-muted);
  color: #fff;
}

.btn.confirm {
  background: var(--color-danger, #e74c3c);
  color: #fff;
}

/* Animation styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
