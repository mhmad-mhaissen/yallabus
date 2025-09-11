<template>
  <div class="bookings-view">
    <SidebarComponent
      :routeTitle="$store.state.role_name + ' Dashboard'"
      :navLinks="$store.state.NavLinks[$store.state.role]"
    >
      <div class="bookings-management">
        <h2>Bookings Management</h2>

        <!-- Search Filters -->
        <div class="search-filters">
          <BaseInput v-model="searchParams.booking_id" label="Booking ID" />
          <BaseDropdown
            v-model="searchParams.status"
            label="Status"
            :options="statusOptions"
          />
          <BaseInput
            type="date"
            v-model="searchParams.start_date"
            label="Start Date"
          />
          <BaseInput
            type="date"
            v-model="searchParams.end_date"
            label="End Date"
          />
          <button @click="applyFilters" class="filter-btn">
            Apply Filters
          </button>
        </div>

        <div v-if="loading" class="loading">Loading Bookings...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <BaseTable
          v-if="!loading && !error"
          :titles="titles"
          :keys="keys"
          :data="bookings"
          model="booking"
          :pagination="pagination"
          @view="onViewBooking"
          @cancel="onCancelBooking"
        />
      </div>

      <!-- View Booking Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedBooking"
        title="Booking Details"
        mode="view"
        @close="closeModal"
      />
    </SidebarComponent>
  </div>
</template>

<script>
import SidebarComponent from "@/components/Dashboards/SidebarComponent.vue";
import store from "@/store";
import BaseTable from "@/components/Elements/BaseTable.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";

export default {
  name: "bookings-view",
  data() {
    return {
      loading: false,
      error: null,
      titles: ["Booking ID", "User", "Trip", "Booking Date", "Status"],
      keys: [
        "booking_id",
        "user.name",
        "trip.route_name",
        "booking_date",
        "status",
      ],
      bookings: [],
      statusOptions: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "cancelled", label: "Cancelled" },
      ],
      pagination: null,
      searchParams: {
        booking_id: "",
        status: "",
        start_date: "",
        end_date: "",
      },
      modalMode: null,
      showModal: false,
      selectedBooking: null,
    };
  },
  components: {
    SidebarComponent,
    BaseTable,
    GlobalModal,
    BaseInput,
    BaseDropdown,
  },
  methods: {
    applyFilters() {
      this.fetchBookings(1); // Reset to page 1 after applying filters
    },
    async fetchBookings(page = 1) {
      this.loading = true;
      this.error = null;

      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server +
          `api/bookings?page=${page}&booking_id=${this.searchParams.booking_id}&status=${this.searchParams.status}&start_date=${this.searchParams.start_date}&end_date=${this.searchParams.end_date}`
      );

      if (success) {
        this.bookings = data.data.data;
        this.pagination = {
          current_page: data.current_page || page,
          last_page: data.last_page || 10,
          per_page: data.per_page || 10,
          total: data.total,
        };
      } else {
        this.error = err || "Failed to load bookings.";
      }

      this.loading = false;
    },
    onViewBooking(booking) {
      this.selectedBooking = booking;
      this.modalMode = "view";
      this.showModal = true;
    },
    onCancelBooking(booking) {
      store
        .dispatch("makePostRequest", {
          url: store.state.server + `api/bookings/${booking.booking_id}/cancel`,
        })
        .then(({ success, error }) => {
          if (success) {
            this.fetchBookings(this.pagination?.current_page || 1); // Refresh bookings after cancellation
          } else {
            this.error = error || "Failed to cancel booking.";
          }
        });
    },
    closeModal() {
      this.showModal = false;
      this.modalMode = null;
      this.selectedBooking = null;
    },
  },
  mounted() {
    this.fetchBookings(); // Initial fetch
  },
};
</script>

<style scoped>
.search-filters {
  margin-bottom: 15px;
}
.filter-btn {
  padding: 8px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.filter-btn:hover {
  background: #45a049;
}
</style>
