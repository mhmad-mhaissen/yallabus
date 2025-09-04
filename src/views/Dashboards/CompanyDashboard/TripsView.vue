<template>
  <div class="trips-view">
    <SidebarComponent
      :routeTitle="$store.state.role_name + ' Dashboard'"
      :navLinks="$store.state.NavLinks[$store.state.role]"
    >
      <div class="trips-management">
        <h2>Trips Management</h2>

        <button v-if="can('create_trip')" class="add-btn" @click="onAddTrip">
          + Add Trip
        </button>

        <div v-if="loading" class="loading">Loading Trips...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <BaseTable
          v-if="!loading && !error"
          :titles="titles"
          :keys="keys"
          :data="trips"
          model="trip"
          :pagination="pagination"
          @edit="onEditTrip"
          @delete="onDeleteTrip"
          @view="onViewTrip"
          @page-changed="fetchTrips"
        />
      </div>

      <!-- Add/Edit Trip Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Trip' : 'Edit Trip'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Trip' : 'Edit Trip'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitTrip"
        >
          <BaseDropdown
            v-model="newTrip.bus_id"
            label="Bus"
            :options="busOptions"
          />
          <BaseDropdown
            v-model="newTrip.driver_id"
            label="Driver"
            :options="driverOptions"
          />
          <BaseDropdown
            v-model="newTrip.departure_city_id"
            label="Departure City"
            :options="cityOptions"
          />
          <BaseDropdown
            v-model="newTrip.arrival_city_id"
            label="Arrival City"
            :options="cityOptions"
          />
          <BaseInput
            type="datetime-local"
            v-model="newTrip.departure_time"
            label="Departure Time"
          />
          <BaseInput
            type="datetime-local"
            v-model="newTrip.arrival_time"
            label="Arrival Time"
          />
          <BaseInput
            type="number"
            v-model="newTrip.price"
            label="Price"
            placeholder="e.g. 50.00"
          />
          <BaseInput
            type="number"
            v-model="newTrip.available_seats"
            label="Available Seats"
          />
          <BaseDropdown
            v-model="newTrip.status"
            label="Status"
            :options="[
              { value: 'available', label: 'Available' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'delayed', label: 'Delayed' },
              { value: 'completed', label: 'Completed' },
            ]"
          />
          <BaseInput type="textarea" v-model="newTrip.notes" label="Notes" />
        </BaseForm>
      </GlobalModal>

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete this trip?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />

      <!-- View Trip Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedTrip"
        title="Trip Details"
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
  name: "trips-view",
  data() {
    return {
      loading: false,
      error: null,
      titles: [
        "Departure City",
        "Arrival City",
        "Departure Time",
        "Arrival Time",
        "Price",
        "Seats",
        "Status",
      ],
      keys: [
        "departure_city.name",
        "arrival_city.name",
        "departure_time",
        "arrival_time",
        "price",
        "available_seats",
        "status",
      ],
      trips: [],
      buses: [],
      drivers: [],
      cities: [],
      pagination: null,
      modalMode: null,
      showModal: false,
      successMessage: "",
      newTrip: {
        bus_id: "",
        driver_id: "",
        departure_city_id: "",
        arrival_city_id: "",
        departure_time: "",
        arrival_time: "",
        price: "",
        available_seats: "",
        status: "available",
        notes: "",
      },
      selectedTrip: null,
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
    driverOptions() {
      return this.drivers.map((d) => ({
        value: d.id,
        label: `${d.name}`,
      }));
    },
    cityOptions() {
      return this.cities.map((c) => ({
        value: c.id,
        label: c.name,
      }));
    },
  },
  methods: {
    can(permission) {
      return (store.state.permissions || []).includes(permission);
    },
    onDeleteTrip(trip) {
      this.selectedTrip = trip;
      this.modalMode = "confirm";
      this.showModal = true;
    },
    confirmDelete() {
      const trip = this.selectedTrip;
      store
        .dispatch(
          "makeDeleteRequest",
          store.state.server + `api/trips/${trip.id}`
        )
        .then(({ success, error }) => {
          this.successMessage = success
            ? "Trip deleted successfully."
            : "Delete failed: " + error;
          this.modalMode = "success";
          if (success) this.fetchTrips(this.pagination?.current_page || 1);
        });
    },
    onEditTrip(trip) {
      store
        .dispatch("makeGetRequest", store.state.server + `api/trips/${trip.id}`)
        .then(({ success, data }) => {
          if (success) {
            this.newTrip = { ...data.data };
            this.modalMode = "edit";
            this.showModal = true;
          }
        });
    },
    onViewTrip(trip) {
      this.selectedTrip = trip;
      this.modalMode = "view";
      this.showModal = true;
    },
    async submitTrip() {
      const formdata = new FormData();
      for (let key in this.newTrip) {
        formdata.append(key, this.newTrip[key]);
      }

      if (this.modalMode === "add") {
        await store
          .dispatch("makePostRequest", {
            url: store.state.server + `api/trips`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Trip created successfully."
              : "Creation failed: " + error;
            this.modalMode = "success";
            if (success) this.fetchTrips(this.pagination?.current_page || 1);
          });
      } else if (this.modalMode === "edit") {
        await store
          .dispatch("makePostRequest", {
            url:
              store.state.server + `api/trips/${this.newTrip.id}?_method=PUT`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Trip updated successfully."
              : "Update failed: " + error;
            this.modalMode = "success";
            if (success) this.fetchTrips(this.pagination?.current_page || 1);
          });
      }
    },
    onAddTrip() {
      this.resetTripForm();
      this.modalMode = "add";
      this.showModal = true;
    },
    resetTripForm() {
      this.newTrip = {
        bus_id: "",
        driver_id: "",
        departure_city_id: "",
        arrival_city_id: "",
        departure_time: "",
        arrival_time: "",
        price: "",
        available_seats: "",
        status: "available",
        notes: "",
      };
    },
    closeModal() {
      this.showModal = false;
      this.modalMode = null;
      this.selectedTrip = null;
    },
    async fetchTrips(page = 1) {
      this.loading = true;
      this.error = null;
      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/trips/company?page=${page}`
      );
      if (success) {
        this.trips = data.data.data;
        this.pagination = {
          current_page: data.data?.current_page || page,
          last_page: data.data?.last_page || 10,
          per_page: data.data?.per_page || 10,
          total: data.data.total,
        };
      } else {
        this.error = err || "Failed to load trips.";
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
    async fetchDrivers() {
      const { success, data } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/${store.state.role}/drivers`
      );
      if (success) this.drivers = data.data.data;
    },
    async fetchCities() {
      const { success, data } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/cities`
      );
      if (success) this.cities = data.data;
    },
  },
  mounted() {
    this.fetchTrips();
    this.fetchBuses();
    this.fetchDrivers();
    this.fetchCities();
  },
};
</script>

<style scoped>
.add-btn {
  margin-bottom: 15px;
  padding: 8px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-btn:hover {
  background: #45a049;
}
</style>
