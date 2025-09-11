<template>
  <div class="table-wrapper">
    <table class="styled-table">
      <thead>
        <tr>
          <th v-for="title in titles" :key="title">{{ title }}</th>
          <!-- Show Actions column if default OR custom actions exist -->
          <th v-if="hasActions || $slots.customActions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="key in keys" :key="key">{{ getNestedValue(row, key) }}</td>

          <!-- Render default actions OR custom slot -->
          <td v-if="hasActions || $slots.customActions" class="actions-cell">
            <!-- Default actions -->
            <button
              v-if="can(`update_${model}`)"
              class="btn edit"
              @click="$emit('edit', row)"
            >
              Edit
            </button>
            <button
              v-if="can(`delete_${model}`)"
              class="btn delete"
              @click="$emit('delete', row)"
            >
              Delete
            </button>
            <button
              v-if="can(`read_${model}`)"
              class="btn view"
              @click="$emit('view', row)"
            >
              View
            </button>

            <!-- ✅ Custom actions slot -->
            <slot
              name="customActions"
              :item="row"
              :emitAction="(action) => $emit(action, row)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="pagination" class="pagination">
      <button
        class="page-btn"
        :disabled="pagination.current_page === 1"
        @click="changePage(pagination.current_page - 1)"
      >
        Prev
      </button>

      <span class="page-info">
        Page {{ pagination.current_page }} of {{ pagination.last_page }}
      </span>

      <button
        class="page-btn"
        :disabled="pagination.current_page === pagination.last_page"
        @click="changePage(pagination.current_page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  titles: Array,
  keys: Array,
  data: Array,
  model: String,
  pagination: Object,
});

// ✅ Register all events we may need
const emit = defineEmits([
  "edit",
  "delete",
  "view",
  "cancel",
  "review",
  "complaint",
  "page-changed",
]);

const store = useStore();
const permissions = computed(() => store.state.permissions || []);

const can = (permission) => permissions.value.includes(permission);

const hasActions = computed(() =>
  ["update_", "delete_", "read_"].some((prefix) => can(prefix + props.model))
);

function getNestedValue(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj);
}

function changePage(page) {
  emit("page-changed", page);
}
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  background: var(--color-surface);
  padding: 1rem;
  border-radius: 0.75rem;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--color-text);
  font-size: 0.95rem;
}

.styled-table thead tr {
  background: var(--gradient-primary);
  color: #fff;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid var(--color-muted);
}

.styled-table tbody tr:nth-child(even) {
  background-color: var(--color-bg);
}

.styled-table tbody tr:hover {
  background-color: var(--section-overlay-color);
  transition: background 0.3s ease;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 5px 10px;
  font-size: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
}
.btn.edit {
  background-color: var(--color-accent);
}
.btn.delete {
  background-color: #e74c3c;
}
.btn.view {
  background-color: var(--color-primary-dark);
}

/* Pagination */
.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-muted);
  background: var(--color-surface);
  cursor: pointer;
  transition: background 0.2s;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  color: #fff;
}
.page-info {
  font-size: 0.9rem;
}
.btn.resolve {
  background-color: #2ecc71; /* Green */
  color: #fff;
}
</style>
