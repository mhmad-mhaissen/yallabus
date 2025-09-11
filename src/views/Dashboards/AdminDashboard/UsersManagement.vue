<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="user-management">
      <h2>User Management</h2>

      <!-- Add New User Button -->
      <button v-if="can('create_user')" class="add-btn" @click="onAddUser">
        + Add User
      </button>

      <div v-if="loading" class="loading">Loading users...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <BaseTable
        v-if="!loading && !error"
        :titles="titles"
        :keys="keys"
        :data="users"
        model="user"
        @edit="onEditUser"
        @delete="onDeleteUser"
        @view="onViewUser"
      />

      <!-- View User Details Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedUser"
        title="User Details"
        mode="view"
        @close="closeModal"
      />

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete ${
          selectedUser?.first_name || ''
        } ${selectedUser?.last_name || ''}?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />

      <!-- Add/Edit User Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add New User' : 'Edit User'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New User' : 'Edit User'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitUser"
        >
          <!-- Personal Info -->
          <BaseInput
            v-model="newUser.first_name"
            label="First Name"
            placeholder="Enter first name"
          />
          <BaseInput
            v-model="newUser.last_name"
            label="Last Name"
            placeholder="Enter last name"
          />
          <BaseInput
            v-model="newUser.email"
            label="Email"
            placeholder="Enter email"
            type="email"
          />
          <PhoneInput
            v-model:codePhone="newUser.code_phone"
            v-model:phone="newUser.phone"
          />

          <!-- Password (only in add mode) -->
          <template v-if="modalMode === 'add'">
            <BaseInput
              v-model="newUser.password"
              label="Password"
              placeholder="Enter password"
              type="password"
            />
            <BaseInput
              v-model="newUser.password_confirmation"
              label="Confirm Password"
              placeholder="Confirm password"
              type="password"
            />
          </template>

          <!-- Location & Role -->
          <BaseDropdown
            v-model="newUser.city_id"
            label="City"
            :options="cityOptions"
          />
          <BaseDropdown
            v-model="newUser.role_id"
            label="Role"
            :options="roleOptions"
          />

          <!-- Company Info (only if role contains 'company') -->
          <template v-if="showCompanyFields">
            <BaseInput
              v-model="newUser.company_name"
              label="Company Name"
              placeholder="Enter company name"
            />
            <BaseInput
              v-model="newUser.company_description"
              label="Company Description"
              placeholder="Enter company description"
            />
            <BaseInput
              v-model="newUser.company_contact_email"
              label="Company Contact Email"
              placeholder="Enter contact email"
              type="email"
            />
            <PhoneInput
              v-model:codePhone="newUser.company_contact_code_phone"
              v-model:phone="newUser.company_contact_phone"
            />
          </template>
        </BaseForm>
      </GlobalModal>

      <!-- Success Message Modal -->
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
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";

import SidebarLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseTable from "@/components/Elements/BaseTable.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";
import PhoneInput from "@/components/Elements/PhoneInput.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";

const store = useStore();

const users = ref([]);
const loading = ref(false);
const error = ref(null);

const titles = ["First Name", "Last Name", "Email", "Role"];
const keys = ["first_name", "last_name", "email", "role.changeable_name"];

const showModal = ref(false);
const selectedUser = ref(null);
const modalMode = ref(null);

const newUser = ref({
  first_name: "",
  last_name: "",
  email: "",
  code_phone: "",
  phone: "",
  password: "",
  password_confirmation: "",
  city_id: "",
  role_id: "",
  company_name: "",
  company_description: "",
  company_contact_email: "",
  company_contact_code_phone: "",
  company_contact_phone: "",
});

const cityOptions = ref([]);
const roleOptions = ref([]);
const roleOptionsRaw = ref([]);
const successMessage = ref("");

const showCompanyFields = computed(() => {
  const selectedRole = roleOptionsRaw.value.find(
    (r) => r.id === newUser.value.role_id
  );
  return selectedRole && selectedRole.name?.toLowerCase().includes("company");
});

const can = (permission) =>
  (store.state.permissions || []).includes(permission);

async function fetchUsers() {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch(
    "makeGetRequest",
    store.state.server + `api/${store.state.role}/users`
  );
  if (success) users.value = data.data;
  else error.value = err || "Failed to load users.";
  loading.value = false;
}

async function fetchCities() {
  try {
    const res = await store.dispatch(
      "makeGetRequest",
      store.state.server + "api/cities?country_id=1"
    );
    cityOptions.value = res.data.data.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  } catch (err) {
    console.error("Failed to fetch cities:", err);
  }
}

async function fetchRoles() {
  try {
    const res = await store.dispatch(
      "makeGetRequest",
      store.state.server + "api/roles"
    );
    roleOptionsRaw.value = res.data.data;
    roleOptions.value = res.data.data.map((role) => ({
      value: role.id,
      label: role.changeable_name,
    }));
  } catch (err) {
    console.error("Failed to fetch roles:", err);
  }
}

onMounted(() => {
  fetchUsers();
  fetchCities();
  fetchRoles();
});

function onEditUser(user) {
  newUser.value = {
    id: user.id,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    code_phone: user.code_phone || "",
    phone: user.phone || "",
    password: "",
    password_confirmation: "",
    city_id: user.city_id || user.city?.id || "",
    role_id: user.role_id || user.role?.id || "",
    company_name: user.company ? user.company.name : null || "",
    company_description: user.company ? user.company.description : null || "",
    company_contact_email: user.company
      ? user.company.contact_email
      : null || "",
    company_contact_code_phone: user.company
      ? user.company.company_contact_code_phone
      : null || "",
    company_contact_phone: user.company
      ? user.company.contact_phone
      : null || "",
  };
  modalMode.value = "edit";
  showModal.value = true;
}

function onDeleteUser(user) {
  selectedUser.value = user;
  modalMode.value = "confirm";
  showModal.value = true;
}

function confirmDelete() {
  const user = selectedUser.value;
  store
    .dispatch(
      "makeDeleteRequest",
      store.state.server + `api/${store.state.role}/users/${user.id}`
    )
    .then(({ success, error }) => {
      successMessage.value = success
        ? "User deleted successfully."
        : "Delete failed: " + error;
      modalMode.value = "success";
      if (success) fetchUsers();
    });
}

function onViewUser(user) {
  selectedUser.value = user;
  modalMode.value = "view";
  showModal.value = true;
}

function onAddUser() {
  resetUserForm();
  modalMode.value = "add";
  showModal.value = true;
}

function resetUserForm() {
  newUser.value = {
    first_name: "",
    last_name: "",
    email: "",
    code_phone: "",
    phone: "",
    password: "",
    password_confirmation: "",
    city_id: "",
    role_id: "",
    company_name: "",
    company_description: "",
    company_contact_email: "",
    company_contact_code_phone: "",
    company_contact_phone: "",
  };
}

function cleanPayload(obj) {
  const payload = {};
  for (const key in obj) {
    if (obj[key] !== "" && obj[key] !== null && obj[key] !== undefined) {
      payload[key] = obj[key];
    }
  }
  return payload;
}

function submitUser() {
  const payload = cleanPayload(newUser.value);

  if (modalMode.value === "add") {
    store
      .dispatch("makePostRequest", {
        url: store.state.server + `api/${store.state.role}/users`,
        data: payload,
      })
      .then(({ success, error }) => {
        successMessage.value = success
          ? "User created successfully."
          : "Creation failed: " + error;
        modalMode.value = "success";
        if (success) fetchUsers();
      });
  } else if (modalMode.value === "edit") {
    store
      .dispatch("makePatchRequest", {
        url:
          store.state.server +
          `api/${store.state.role}/users/${newUser.value.id}`,
        data: payload,
      })
      .then(({ success, error }) => {
        successMessage.value = success
          ? "User updated successfully."
          : "Update failed: " + error;
        modalMode.value = "success";
        if (success) fetchUsers();
      });
  }
}

function closeModal() {
  showModal.value = false;
  selectedUser.value = null;
  modalMode.value = null;
}
</script>

<style scoped>
.user-management {
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
</style>
