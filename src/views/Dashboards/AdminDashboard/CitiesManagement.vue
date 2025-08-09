<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="user-management">
      <h2>Cities Management</h2>

      <button class="add-btn" @click="onAddCity">+ Add City</button>

      <div v-if="loading" class="loading">Loading cities...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <BaseTable
        v-if="!loading && !error"
        :titles="['Name', 'Country']"
        :keys="['name', 'country.name']"
        :data="cities"
        model="city"
        @edit="onEditCity"
        @delete="onDeleteCity"
      />

      <!-- Add/Edit City Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add City' : 'Edit City'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New City' : 'Edit City'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitCity"
        >
          <BaseInput
            v-model="newCity.name"
            label="City Name"
            placeholder="Enter city name"
          />
          <BaseDropdown
            v-model="newCity.country_id"
            label="Country"
            :options="countryOptions"
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
        :confirmMessage="`Are you sure you want to delete ${selectedCity?.name}?`"
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

const cities = ref([]);
const loading = ref(false);
const error = ref(null);
const showModal = ref(false);
const modalMode = ref(null);
const selectedCity = ref(null);
const successMessage = ref("");

const newCity = ref({
  name: "",
  country_id: "",
});

const countryOptions = ref([]);

async function fetchCities() {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch("makeGetRequest", store.state.server + "api/cities");
  if (success) cities.value = data.data;
  else error.value = err || "Failed to load cities.";
  loading.value = false;
}

async function fetchCountries() {
  const res = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/countries"
  );
  let response = res.data.data.data;
  countryOptions.value = response.map((c) => ({
    value: c.id,
    label: c.name,
  }));
}

onMounted(() => {
  fetchCities();
  fetchCountries();
});

function onAddCity() {
  resetCityForm();
  modalMode.value = "add";
  showModal.value = true;
}

function onEditCity(city) {
  newCity.value = {
    id: city.id,
    name: city.name,
    country_id: city.country_id || city.country?.id || "",
  };
  modalMode.value = "edit";
  showModal.value = true;
}

function onDeleteCity(city) {
  selectedCity.value = city;
  modalMode.value = "confirm";
  showModal.value = true;
}

function confirmDelete() {
  store
    .dispatch(
      "makeDeleteRequest",
      store.state.server + `api/cities/${selectedCity.value.id}`
    )
    .then(({ success, error }) => {
      successMessage.value = success
        ? "City deleted successfully."
        : "Delete failed: " + error;
      modalMode.value = "success";
      if (success) fetchCities();
    });
}

function submitCity() {
  const method =
    modalMode.value === "add" ? "makePostRequest" : "makePutRequest";
  const url =
    modalMode.value === "add"
      ? store.state.server + "api/cities"
      : store.state.server + `api/cities/${newCity.value.id}`;

  store
    .dispatch(method, {
      url,
      data: newCity.value,
    })
    .then(({ success, error }) => {
      successMessage.value = success
        ? `City ${
            modalMode.value === "add" ? "added" : "updated"
          } successfully.`
        : `${modalMode.value === "add" ? "Creation" : "Update"} failed: ` +
          error;
      modalMode.value = "success";
      if (success) fetchCities();
    });
}

function resetCityForm() {
  newCity.value = {
    name: "",
    country_id: "",
  };
}

function closeModal() {
  showModal.value = false;
  modalMode.value = null;
  selectedCity.value = null;
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
