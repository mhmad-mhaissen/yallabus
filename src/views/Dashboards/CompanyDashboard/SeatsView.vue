<template>
  <div class="seats-view">
    <SidebarComponent
      :routeTitle="$store.state.role_name + ' Dashboard'"
      :navLinks="$store.state.NavLinks[$store.state.role]"
    >
      <div class="seats-management">
        <h2>Seats Management</h2>

        <button v-if="can('create_seat')" class="add-btn" @click="onAddSeat">
          + Add Seat
        </button>

        <div v-if="loading" class="loading">Loading Seats...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <BaseTable
          v-if="!loading && !error"
          :titles="titles"
          :keys="keys"
          :data="seats"
          model="seat"
          :pagination="pagination"
          @edit="onEditSeat"
          @delete="onDeleteSeat"
          @view="onViewSeat"
          @page-changed="fetchSeats"
        />
      </div>

      <!-- Add/Edit Seat Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Seat' : 'Edit Seat'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Seat' : 'Edit Seat'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitSeat"
        >
          <BaseInput
            v-model="newSeat.seat_number"
            label="Seat Number"
            placeholder="e.g. 1A"
          />

          <!-- Seat Class Dropdown -->
          <BaseDropdown
            v-model="newSeat.class"
            label="Class"
            :options="[
              { value: 'VIP', label: 'VIP' },
              { value: 'ECONOMIC', label: 'Economic' },
            ]"
          />

          <!-- Availability Checkbox -->
          <label class="checkbox-label">
            <input type="checkbox" v-model="newSeat.is_available" />
            Available
          </label>

          <!-- Bus Dropdown -->
          <BaseDropdown
            v-model="newSeat.bus_id"
            label="Bus"
            :options="busOptions"
          />
        </BaseForm>
      </GlobalModal>

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete seat '${selectedSeat?.seat_number}'?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />

      <!-- View Seat Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedSeat"
        title="Seat Details"
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
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";

export default {
  name: "seats-view",
  data() {
    return {
      loading: false,
      error: null,
      titles: ["Seat Number", "Class", "Available", "Bus"],
      keys: ["seat_number", "class", "is_available", "bus_id"],
      seats: [],
      buses: [],
      pagination: null,
      modalMode: null,
      showModal: false,
      successMessage: "",
      newSeat: {
        seat_number: "",
        class: "",
        is_available: true,
        bus_id: "",
      },
      selectedSeat: null,
    };
  },
  components: {
    SidebarComponent,
    BaseTable,
    GlobalModal,
    BaseForm,
    BaseInput,
    BaseDropdown,
  },
  computed: {
    busOptions() {
      return this.buses.map((bus) => ({
        value: bus.id,
        label: `${bus.plate_number} (${bus.model})`,
      }));
    },
  },
  methods: {
    can(permission) {
      return (store.state.permissions || []).includes(permission);
    },
    onDeleteSeat(seat) {
      this.selectedSeat = seat;
      this.modalMode = "confirm";
      this.showModal = true;
    },
    confirmDelete() {
      const seat = this.selectedSeat;
      store
        .dispatch(
          "makeDeleteRequest",
          store.state.server + `api/${store.state.role}/seats/${seat.id}`
        )
        .then(({ success, error }) => {
          this.successMessage = success
            ? "Seat deleted successfully."
            : "Delete failed: " + error;
          this.modalMode = "success";
          if (success) this.fetchSeats(this.pagination?.current_page || 1);
        });
    },
    onEditSeat(seat) {
      store
        .dispatch(
          "makeGetRequest",
          store.state.server + `api/${store.state.role}/seats/${seat.id}`
        )
        .then(({ success, data }) => {
          if (success) {
            this.newSeat = { ...data.data };
            this.modalMode = "edit";
            this.showModal = true;
          }
        });
    },
    onViewSeat(seat) {
      this.selectedSeat = seat;
      this.modalMode = "view";
      this.showModal = true;
    },
    async submitSeat() {
      const formdata = new FormData();
      formdata.append("seat_number", this.newSeat.seat_number);
      formdata.append("class", this.newSeat.class);
      formdata.append("is_available", this.newSeat.is_available ? 1 : 0);
      formdata.append("bus_id", this.newSeat.bus_id);

      if (this.modalMode === "add") {
        await store
          .dispatch("makePostRequest", {
            url: store.state.server + `api/${store.state.role}/seats`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Seat created successfully."
              : "Creation failed: " + error;
            this.modalMode = "success";
            if (success) this.fetchSeats(this.pagination?.current_page || 1);
          });
      } else if (this.modalMode === "edit") {
        await store
          .dispatch("makePostRequest", {
            url:
              store.state.server +
              `api/${store.state.role}/seats/${this.newSeat.id}?_method=PUT`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Seat updated successfully."
              : "Update failed: " + error;
            this.modalMode = "success";
            if (success) this.fetchSeats(this.pagination?.current_page || 1);
          });
      }
    },
    onAddSeat() {
      this.resetSeatForm();
      this.modalMode = "add";
      this.showModal = true;
    },
    resetSeatForm() {
      this.newSeat = {
        seat_number: "",
        class: "",
        is_available: true,
        bus_id: "",
      };
    },
    closeModal() {
      this.showModal = false;
      this.modalMode = null;
      this.selectedSeat = null;
    },
    async fetchSeats(page = 1) {
      this.loading = true;
      this.error = null;
      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/${store.state.role}/seats?page=${page}`
      );
      if (success) {
        this.seats = data.data.data;
        this.pagination = {
          current_page: data.data?.current_page || page,
          last_page: data.data?.last_page || 10,
          per_page: data.data?.per_page || 10,
          total: data.data.total,
        };
      } else {
        this.error = err || "Failed to load seats.";
      }
      this.loading = false;
    },

    async fetchBuses() {
      const { success, data } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/${store.state.role}/buses`
      );
      if (success) this.buses = data.data.data;
    },
  },
  mounted() {
    this.fetchSeats();
    this.fetchBuses();
  },
};
</script>

<style scoped>
.checkbox-label {
  display: flex;
  align-items: center;
  margin: 10px 0;
}
.checkbox-label input {
  margin-right: 8px;
}
</style>
