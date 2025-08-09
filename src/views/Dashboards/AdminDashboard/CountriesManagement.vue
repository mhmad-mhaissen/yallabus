<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="user-management">
      <h2>Countries Management</h2>

      <!-- Add New Country Button -->
      <button class="add-btn" @click="onAddCountry">+ Add Country</button>

      <div v-if="loading" class="loading">Loading countries...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <BaseTable
        v-if="!loading && !error"
        :titles="['Name', 'Dialing Code', 'Currency']"
        :keys="['name', 'dialing_code', 'currency.name']"
        :data="countries"
        model="country"
        @edit="onEditCountry"
        @delete="onDeleteCountry"
      />

      <!-- Add/Edit Country Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Country' : 'Edit Country'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Country' : 'Edit Country'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitCountry"
        >
          <BaseInput
            v-model="newCountry.name"
            label="Country Name"
            placeholder="Enter country name"
          />
          <BaseInput
            v-model="newCountry.dialing_code"
            label="Dialing Code"
            placeholder="e.g. +1"
          />
          <BaseDropdown
            v-model="newCountry.currency_id"
            label="Currency"
            :options="currencyOptions"
          />
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

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete ${selectedCountry?.name}?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />
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

const countries = ref([]);
const loading = ref(false);
const error = ref(null);
const showModal = ref(false);
const modalMode = ref(null);
const selectedCountry = ref(null);
const successMessage = ref("");

const newCountry = ref({
  name: "",
  dialing_code: "",
  currency_id: "",
});

const currencyOptions = ref([]);

async function fetchCountries() {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/countries"
  );
  if (success) countries.value = data.data.data;
  else error.value = err || "Failed to load countries.";
  loading.value = false;
}

async function fetchCurrencies() {
  const res = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/currencies"
  );
  let response = res.data.data.data;
  currencyOptions.value = response.map((c) => ({
    value: c.id,
    label: c.symbol,
  }));
}

onMounted(() => {
  fetchCountries();
  fetchCurrencies();
});

function onAddCountry() {
  resetCountryForm();
  modalMode.value = "add";
  showModal.value = true;
}

function onEditCountry(country) {
  newCountry.value = {
    id: country.id,
    name: country.name,
    dialing_code: country.dialing_code,
    currency_id: country.currency_id || country.currency?.id || "",
  };
  modalMode.value = "edit";
  showModal.value = true;
}

function onDeleteCountry(country) {
  selectedCountry.value = country;
  modalMode.value = "confirm";
  showModal.value = true;
}

function confirmDelete() {
  store
    .dispatch(
      "makeDeleteRequest",
      store.state.server + `api/countries/${selectedCountry.value.id}`
    )
    .then(({ success, error }) => {
      successMessage.value = success
        ? "Country deleted successfully."
        : "Delete failed: " + error;
      modalMode.value = "success";
      if (success) fetchCountries();
    });
}

function submitCountry() {
  const method =
    modalMode.value === "add" ? "makePostRequest" : "makePutRequest";
  const url =
    modalMode.value === "add"
      ? store.state.server + "api/countries"
      : store.state.server + `api/countries/${newCountry.value.id}`;

  store
    .dispatch(method, {
      url,
      data: newCountry.value,
    })
    .then(({ success, error }) => {
      successMessage.value = success
        ? `Country ${
            modalMode.value === "add" ? "added" : "updated"
          } successfully.`
        : `${modalMode.value === "add" ? "Creation" : "Update"} failed: ` +
          error;
      modalMode.value = "success";
      if (success) fetchCountries();
    });
}

function resetCountryForm() {
  newCountry.value = {
    name: "",
    dialing_code: "",
    currency_id: "",
  };
}

function closeModal() {
  showModal.value = false;
  modalMode.value = null;
  selectedCountry.value = null;
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
