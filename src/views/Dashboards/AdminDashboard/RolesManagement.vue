<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="role-management">
      <h2>Role Management</h2>

      <button v-if="can('create_role')" class="add-btn" @click="onAddRole">
        + Add Role
      </button>

      <div v-if="loading" class="loading">Loading roles...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <BaseTable
        v-if="!loading && !error"
        :titles="titles"
        :keys="keys"
        :data="roles"
        model="role"
        @edit="onEditRole"
        @delete="onDeleteRole"
        @view="onViewRole"
      />

      <!-- View Role Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedRole"
        title="Role Details"
        mode="view"
        @close="closeModal"
      />

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete the role '${selectedRole?.changeable_name}'?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />

      <!-- Add/Edit Role Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Role' : 'Edit Role'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Role' : 'Edit Role'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitRole"
        >
          <BaseInput
            v-model="newRole.name"
            label="Role Name (Internal)"
            placeholder="e.g. company-admin"
          />
          <BaseInput
            v-model="newRole.changeable_name"
            label="Role Name (Display)"
            placeholder="e.g. Company Admin"
          />
          <BaseDropdown
            v-model="newRole.policy"
            label="Policy"
            :options="[
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
            ]"
          />
          <label>Permissions</label>
          <div class="permissions-list">
            <label
              v-for="perm in allPermissions"
              :key="perm.id"
              class="permission-checkbox"
            >
              <input
                type="checkbox"
                :value="perm.id"
                v-model="newRole.permissions"
              />
              {{ perm.changeable_name }}
            </label>
          </div>
        </BaseForm>
      </GlobalModal>

      <!-- Success Modal -->
      <GlobalModal
        v-if="modalMode === 'success'"
        :visible="showModal"
        title="Success"
        mode="custom"
        @close="closeModal"
      >
        <p>{{ successMessage }}</p>
      </GlobalModal>
    </div>
  </SidebarLayout>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

import SidebarLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseTable from "@/components/Elements/BaseTable.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";

const store = useStore();

const roles = ref([]);
const allPermissions = ref([]);
const selectedRole = ref(null);
const showModal = ref(false);
const modalMode = ref(null);
const successMessage = ref("");
const loading = ref(false);
const error = ref(null);

const newRole = ref({
  name: "",
  changeable_name: "",
  policy: "admin",
  can_delete: 1,
  permissions: [],
});

const titles = ["Name", "Display Name", "Policy"];
const keys = ["name", "changeable_name", "policy"];

const can = (permission) =>
  (store.state.permissions || []).includes(permission);

async function fetchRoles() {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch("makeGetRequest", store.state.server + "api/roles");
  if (success) roles.value = data.data;
  else error.value = err || "Failed to load roles.";
  loading.value = false;
}

async function fetchPermissions() {
  const { success, data } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/permissions"
  );
  if (success) allPermissions.value = data.data;
}

function onAddRole() {
  resetRoleForm();
  modalMode.value = "add";
  showModal.value = true;
}

function onEditRole(role) {
  store
    .dispatch("makeGetRequest", store.state.server + `api/roles/${role.id}`)
    .then(({ success, data }) => {
      if (success) {
        const r = data.data;
        newRole.value = {
          id: r.id,
          name: r.name,
          changeable_name: r.changeable_name,
          policy: r.policy,
          can_delete: r.can_delete ? 1 : 0,
          permissions: r.permissions.map((p) => p.id),
        };
        modalMode.value = "edit";
        showModal.value = true;
      }
    });
}

function onViewRole(role) {
  selectedRole.value = role;
  modalMode.value = "view";
  showModal.value = true;
}

function onDeleteRole(role) {
  if (!role.can_delete) return;
  selectedRole.value = role;
  modalMode.value = "confirm";
  showModal.value = true;
}

function confirmDelete() {
  const role = selectedRole.value;
  store
    .dispatch("makeDeleteRequest", store.state.server + `api/roles/${role.id}`)
    .then(({ success, error }) => {
      successMessage.value = success
        ? "Role deleted successfully."
        : "Delete failed: " + error;
      modalMode.value = "success";
      if (success) fetchRoles();
    });
}

function submitRole() {
  if (modalMode.value === "add") {
    store
      .dispatch("makePostRequest", {
        url: store.state.server + "api/roles",
        data: newRole.value,
      })
      .then(({ success, error }) => {
        successMessage.value = success
          ? "Role created successfully."
          : "Creation failed: " + error;
        modalMode.value = "success";
        if (success) fetchRoles();
      });
  } else if (modalMode.value === "edit") {
    store
      .dispatch("makePatchRequest", {
        url: store.state.server + `api/roles/${newRole.value.id}`,
        data: newRole.value,
      })
      .then(({ success, error }) => {
        successMessage.value = success
          ? "Role updated successfully."
          : "Update failed: " + error;
        modalMode.value = "success";
        if (success) fetchRoles();
      });
  }
}

function resetRoleForm() {
  newRole.value = {
    name: "",
    changeable_name: "",
    policy: "admin",
    can_delete: 1,
    permissions: [],
  };
}

function closeModal() {
  showModal.value = false;
  modalMode.value = null;
  selectedRole.value = null;
}
onMounted(() => {
  fetchRoles();
  fetchPermissions();
});
</script>
<style scoped>
.role-management {
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
.add-btn {
  background: var(--gradient-primary);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-bottom: 1rem;
}
.loading {
  color: var(--color-muted);
  font-style: italic;
}
.error {
  color: #e74c3c;
  margin-bottom: 1rem;
}
.permissions-list {
  max-height: 200px;
  overflow-y: auto;
  display: grid;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 0.5rem;
  justify-content: center;
  align-items: center;
}
.permission-checkbox {
  font-size: 0.9rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
