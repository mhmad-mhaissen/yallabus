<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="permission-management">
      <h2>Permissions Management</h2>

      <div v-if="loading" class="loading">Loading permissions...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <BaseTable
        v-if="!loading && !error"
        :titles="titles"
        :keys="keys"
        :data="permissions"
        model="permission"
        @view="onViewPermission"
        @edit="onEditPermission"
      />

      <!-- View Permission Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedPermission"
        title="Permission Details"
        mode="view"
        @close="closeModal"
      />

      <!-- Edit Permission Modal -->
      <GlobalModal
        v-if="modalMode === 'edit'"
        :visible="showModal"
        title="Edit Permission"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          title="Edit Permission"
          submitText="Update"
          @submit="submitEdit"
        >
          <BaseInput
            v-model="selectedPermission.name"
            label="Permission Name (Internal)"
            placeholder="e.g. view_users"
          />
          <BaseInput
            v-model="selectedPermission.changeable_name"
            label="Permission Name (Display)"
            placeholder="e.g. View Users"
          />
        </BaseForm>
      </GlobalModal>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

import SidebarLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseTable from "@/components/Elements/BaseTable.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";

const store = useStore();

const permissions = ref([]);
const loading = ref(false);
const error = ref(null);
const showModal = ref(false);
const modalMode = ref(null);
const selectedPermission = ref(null);

const titles = ["Name", "Display Name"];
const keys = ["name", "changeable_name"];

async function fetchPermissions() {
  loading.value = true;
  error.value = null;

  const {
    success,
    data,
    error: err,
  } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/permissions"
  );

  if (success) {
    permissions.value = data.data;
  } else {
    error.value = err || "Failed to load permissions.";
  }

  loading.value = false;
}

function onViewPermission(permission) {
  selectedPermission.value = permission;
  modalMode.value = "view";
  showModal.value = true;
}

function onEditPermission(permission) {
  selectedPermission.value = { ...permission };
  modalMode.value = "edit";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedPermission.value = null;
  modalMode.value = null;
}

async function submitEdit() {
  const { success, error: err } = await store.dispatch("makePutRequest", {
    url: store.state.server + "api/permissions/" + selectedPermission.value.id,
    data: { name: selectedPermission.value.changeable_name },
  });

  if (success) {
    await fetchPermissions();
    closeModal();
  } else {
    alert(err || "Failed to update permission.");
  }
}

onMounted(fetchPermissions);
</script>

<style scoped>
.permission-management {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 0.75rem;
  margin-top: 1rem;
  color: var(--color-text);
}
h2 {
  margin-bottom: 1rem;
  color: var(--color-primary);
}
.loading {
  color: var(--color-muted);
  font-style: italic;
}
.error {
  color: #e74c3c;
  margin-bottom: 1rem;
}
</style>
