<template>
  <SidebarLayout
    :routeTitle="'Currency Management'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="currency-management">
      <h2>Currency Management</h2>

      <button
        v-if="can('create_currency')"
        class="add-btn"
        @click="onAddCurrency"
      >
        + Add Currency
      </button>

      <div v-if="loading" class="loading">Loading currencies...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <BaseTable
        v-if="!loading && !error"
        :titles="['Currency', 'Symbol', 'Exchange Rate', 'Default']"
        :keys="['currency', 'symbol', 'exchange_rate', 'is_default']"
        :data="currencies"
        model="currency"
        @edit="onEditCurrency"
        @delete="onDeleteCurrency"
      >
        <!-- ✅ Custom action slot now works -->
        <template #customActions="{ item }">
          <button
            v-if="!item.is_default"
            class="set-default-btn"
            @click="setDefaultCurrency(item.id)"
          >
            Make Default
          </button>
        </template>
      </BaseTable>

      <!-- Add/Edit Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Currency' : 'Edit Currency'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Currency' : 'Edit Currency'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitCurrency"
        >
          <BaseInput
            v-model="newCurrency.currency"
            label="Currency Code"
            placeholder="e.g., USD"
          />
          <BaseInput
            v-model="newCurrency.symbol"
            label="Symbol"
            placeholder="e.g., $"
          />
          <BaseInput
            v-model="newCurrency.exchange_rate"
            label="Exchange Rate"
            placeholder="e.g., 1.00"
            type="number"
            step="0.01"
          />
          <BaseDropdown
            v-model="newCurrency.display"
            label="Display As"
            :options="[
              { label: 'Symbol', value: 'symbol' },
              { label: 'Code', value: 'currency' },
            ]"
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

      <!-- Confirm Delete -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete currency ${selectedCurrency?.currency}?`"
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

const currencies = ref([]);
const loading = ref(false);
const error = ref(null);

const showModal = ref(false);
const modalMode = ref(null);
const selectedCurrency = ref(null);
const successMessage = ref("");

const newCurrency = ref({
  currency: "",
  symbol: "",
  exchange_rate: 1.0,
  display: "symbol",
});

const can = (permission) =>
  (store.state.permissions || []).includes(permission);

async function fetchCurrencies() {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/currencies"
  );
  if (success) currencies.value = data.data.data;
  else error.value = err || "Failed to load currencies.";
  loading.value = false;
}

function onAddCurrency() {
  resetForm();
  modalMode.value = "add";
  showModal.value = true;
}

function onEditCurrency(currency) {
  newCurrency.value = { ...currency };
  modalMode.value = "edit";
  showModal.value = true;
}

function onDeleteCurrency(currency) {
  selectedCurrency.value = currency;
  modalMode.value = "confirm";
  showModal.value = true;
}

function confirmDelete() {
  const currency = selectedCurrency.value;
  store
    .dispatch(
      "makeDeleteRequest",
      store.state.server + `api/currencies/${currency.id}`
    )
    .then(({ success, error }) => {
      successMessage.value = success
        ? "Currency deleted successfully."
        : "Delete failed: " + error;
      modalMode.value = "success";
      if (success) fetchCurrencies();
    });
}

function submitCurrency() {
  const data = { ...newCurrency.value };
  const isEdit = modalMode.value === "edit";
  const url = isEdit ? `api/currencies/${data.id}` : "api/currencies";
  const action = isEdit ? "makePutRequest" : "makePostRequest";

  store
    .dispatch(action, {
      url: store.state.server + url,
      data,
    })
    .then(({ success, error }) => {
      successMessage.value = success
        ? `Currency ${isEdit ? "updated" : "created"} successfully.`
        : `${isEdit ? "Update" : "Creation"} failed: ` + error;
      modalMode.value = "success";
      if (success) fetchCurrencies();
    });
}

function setDefaultCurrency(id) {
  store
    .dispatch("makePutRequest", {
      url: store.state.server + `api/currencies/toggle-default/${id}`,
    })
    .then(({ success, error }) => {
      successMessage.value = success
        ? "Default currency updated."
        : "Failed to set default currency: " + error;
      modalMode.value = "success";
      if (success) fetchCurrencies();
    });
}

function resetForm() {
  newCurrency.value = {
    currency: "",
    symbol: "",
    exchange_rate: 1.0,
    display: "symbol",
  };
}

function closeModal() {
  showModal.value = false;
  selectedCurrency.value = null;
  modalMode.value = null;
}

onMounted(fetchCurrencies);
</script>

<style scoped>
.currency-management {
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
.add-btn,
.set-default-btn {
  background: var(--gradient-primary);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
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
