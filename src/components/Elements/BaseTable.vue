<template>
  <div class="table-wrapper">
    <table class="styled-table">
      <thead>
        <tr>
          <th v-for="title in titles" :key="title">{{ title }}</th>
          <th v-if="hasActions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="key in keys" :key="key">{{ getNestedValue(row, key) }}</td>
          <td v-if="hasActions" class="actions-cell">
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
          </td>
        </tr>
      </tbody>
    </table>
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
});

defineEmits(["edit", "delete", "view"]);

const store = useStore();

const permissions = computed(() => store.state.permissions || []);

const can = (permission) => {
  return permissions.value.includes(permission);
};

const hasActions = computed(() => {
  return ["update_", "delete_", "read_"].some((prefix) =>
    can(prefix + props.model)
  );
});

function getNestedValue(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj);
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
</style>
