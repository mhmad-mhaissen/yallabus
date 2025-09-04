<template>
  <div class="buses-view">
    <SidebarComponent
      :routeTitle="$store.state.role_name + ' Dashboard'"
      :navLinks="$store.state.NavLinks[$store.state.role]"
    >
      <div class="buses-management">
        <h2>Buses Management</h2>

        <button v-if="can('create_bus')" class="add-btn" @click="onAddBus">
          + Add Bus
        </button>

        <div v-if="loading" class="loading">Loading Buses...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <BaseTable
          v-if="!loading && !error"
          :titles="titles"
          :keys="keys"
          :data="buses"
          model="bus"
          @edit="onEditBus"
          @delete="onDeleteBus"
          @view="onViewBus"
        />
      </div>

      <!-- Add/Edit Bus Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Bus' : 'Edit Bus'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Bus' : 'Edit Bus'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitBus"
        >
          <BaseInput
            v-model="newBus.plate_number"
            label="Plate Number"
            placeholder="e.g. 123-ABC"
          />
          <BaseInput
            v-model="newBus.model"
            label="Model"
            placeholder="e.g. Mercedes"
          />
          <BaseInput
            type="number"
            v-model="newBus.capacity"
            label="Capacity"
            placeholder="e.g. 50"
          />

          <select v-model="newBus.type" class="base-select">
            <option value="">-- Select Type --</option>
            <option value="VIP">VIP</option>
            <option value="ECONOMIC">Economic</option>
          </select>

          <BaseInput
            type="textarea"
            v-model="newBus.amenities"
            label="Amenities"
            placeholder="WiFi, USB chargers, AC..."
          />
        </BaseForm>
      </GlobalModal>

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete the bus '${selectedBus?.plate_number}'?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />

      <!-- View Bus Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedBus"
        title="Bus Details"
        mode="view"
        @close="closeModal"
      />

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
    </SidebarComponent>
  </div>
</template>

<script>
import SidebarComponent from "@/components/Dashboards/SidebarComponent.vue";
import store from "@/store";
import BaseTable from "@/components/Elements/BaseTable.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";

export default {
  name: "buses-view",
  data() {
    return {
      loading: false,
      error: null,
      titles: ["Plate Number", "Model", "Capacity", "Type", "Amenities"],
      keys: ["plate_number", "model", "capacity", "type", "amenities"],
      buses: [],
      modalMode: null,
      showModal: false,
      successMessage: "",
      newBus: {
        company_id: "",
        plate_number: "",
        model: "",
        capacity: "",
        type: "",
        amenities: "",
      },
      selectedBus: null,
    };
  },
  components: {
    SidebarComponent,
    BaseTable,
    GlobalModal,
    BaseForm,
    BaseInput,
  },
  methods: {
    can(permission) {
      return (store.state.permissions || []).includes(permission);
    },
    onDeleteBus(bus) {
      this.selectedBus = bus;
      this.modalMode = "confirm";
      this.showModal = true;
    },
    confirmDelete() {
      const bus = this.selectedBus;
      store
        .dispatch(
          "makeDeleteRequest",
          store.state.server + `api/${store.state.role}/buses/${bus.id}`
        )
        .then(({ success, error }) => {
          this.successMessage = success
            ? "Bus deleted successfully."
            : "Delete failed: " + error;
          this.modalMode = "success";
          if (success) this.fetchBuses();
        });
    },
    onEditBus(bus) {
      store
        .dispatch(
          "makeGetRequest",
          store.state.server + `api/${store.state.role}/buses/${bus.id}`
        )
        .then(({ success, data }) => {
          if (success) {
            this.newBus = { ...data.data };
            this.modalMode = "edit";
            this.showModal = true;
          }
        });
    },
    onViewBus(bus) {
      this.selectedBus = bus;
      this.modalMode = "view";
      this.showModal = true;
    },
    async submitBus() {
      const formdata = new FormData();
      formdata.append("company_id", store.state.company.id);
      formdata.append("plate_number", this.newBus.plate_number);
      formdata.append("model", this.newBus.model);
      formdata.append("capacity", this.newBus.capacity);
      formdata.append("type", this.newBus.type);
      formdata.append("amenities", this.newBus.amenities);

      if (this.modalMode === "add") {
        await store
          .dispatch("makePostRequest", {
            url: store.state.server + `api/${store.state.role}/buses`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Bus created successfully."
              : "Creation failed: " + error;
            this.modalMode = "success";
            this.error = error;
            if (success) this.fetchBuses();
          });
      } else if (this.modalMode === "edit") {
        await store
          .dispatch("makePatchRequest", {
            url:
              store.state.server +
              `api/${store.state.role}/buses/${this.newBus.id}`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Bus updated successfully."
              : "Update failed: " + error;
            this.modalMode = "success";
            if (success) this.fetchBuses();
          });
      }
    },
    onAddBus() {
      this.resetBusForm();
      this.modalMode = "add";
      this.showModal = true;
    },
    resetBusForm() {
      this.newBus = {
        company_id: "",
        plate_number: "",
        model: "",
        capacity: "",
        type: "",
        amenities: "",
      };
    },
    closeModal() {
      this.showModal = false;
      this.modalMode = null;
      this.selectedBus = null;
    },
    async fetchBuses() {
      this.loading = true;
      this.error = null;
      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/${store.state.role}/buses`
      );
      if (success) this.buses = data.data.data;
      else this.error = err || "Failed to load buses.";
      this.loading = false;
    },
  },
  mounted() {
    this.fetchBuses();
  },
};
</script>

<style scoped>
.base-select {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
