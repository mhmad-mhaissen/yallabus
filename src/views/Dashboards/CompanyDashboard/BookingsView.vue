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
          :data="filteredBookings"
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
      titles: [
        "Booking Reference",
        "First name",
        "Last name",
        "Trip",
        "Status",
        "Total Price",
      ],
      keys: [
        "booking_reference",
        "user.first_name",
        "user.last_name",
        "trip.id",
        "status",
        "total_price",
      ],
      bookings: [], // All bookings from the server
      filteredBookings: [], // Filtered bookings based on search
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
    // Apply filters to the existing bookings array
    applyFilters() {
      this.filteredBookings = this.bookings.filter((booking) => {
        let match = true;

        // Filter by booking ID
        if (
          this.searchParams.booking_id &&
          !booking.booking_reference.includes(this.searchParams.booking_id)
        ) {
          match = false;
        }

        // Filter by status
        if (
          this.searchParams.status &&
          booking.status !== this.searchParams.status
        ) {
          match = false;
        }

        // Filter by start date
        if (
          this.searchParams.start_date &&
          new Date(booking.trip.departure_time) <
            new Date(this.searchParams.start_date)
        ) {
          match = false;
        }

        // Filter by end date
        if (
          this.searchParams.end_date &&
          new Date(booking.trip.arrival_time) >
            new Date(this.searchParams.end_date)
        ) {
          match = false;
        }

        return match;
      });

      this.pagination = {
        current_page: 1, // Reset to page 1 after filtering
        last_page: Math.ceil(this.filteredBookings.length / 10), // Adjust based on the filtered data length
        per_page: 10,
        total: this.filteredBookings.length,
      };
    },

    async fetchBookings() {
      this.loading = true;
      this.error = null;

      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/bookings`
      );

      if (success) {
        this.bookings = data.data.data;
        this.filteredBookings = [...this.bookings]; // Copy bookings to filteredBookings
        this.pagination = {
          current_page: 1,
          last_page: Math.ceil(this.bookings.length / 10),
          per_page: 10,
          total: this.bookings.length,
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
            this.fetchBookings(); // Refresh bookings after cancellation
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
