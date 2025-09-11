<template>
  <div class="trips-page">
    <h2>My Bookings</h2>

    <!-- Loading & Error -->
    <div v-if="loading" class="loading">Loading Bookings...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Bookings Table -->
    <BaseTable
      v-if="!loading && !error"
      :titles="[
        'Booking ID',
        'Reference',
        'Departure Time',
        'Arrival Time',
        'Trip Status',
        'Booking Status',
        'Total Price',
      ]"
      :keys="[
        'id',
        'booking_reference',
        'trip.departure_time',
        'trip.arrival_time',
        'trip.status',
        'status',
        'total_price',
      ]"
      :data="bookings"
      model="bookings"
      :pagination="pagination"
      @view="openViewModal"
      @cancel="onCancelBooking"
      @review="onReviewBooking"
      @complaint="onComplaintBooking"
      @page-changed="fetchBookings"
    >
      <!-- Custom Actions Slot -->
      <template #customActions="{ emitAction }">
        <button class="btn cancel" @click="emitAction('cancel')">Cancel</button>
        <button class="btn review" @click="emitAction('review')">Review</button>
        <button class="btn complaint" @click="emitAction('complaint')">
          Complaint
        </button>
      </template>
    </BaseTable>

    <!-- View Booking Modal -->
    <GlobalPopupModal
      v-if="modalMode === 'view'"
      :visible="showModal"
      :data="selectedBooking"
      title="Booking Details"
      mode="view"
      @close="closeModal"
    />

    <!-- Cancel Booking Modal -->
    <GlobalPopupModal
      v-if="modalMode === 'cancel'"
      :visible="showModal"
      title="Cancel Booking"
      mode="confirm"
      :confirmMessage="`Are you sure you want to cancel booking #${selectedBooking?.id}?`"
      @close="closeModal"
      @confirm="confirmCancelBooking"
    />

    <!-- Review Modal -->
    <GlobalPopupModal
      v-if="modalMode === 'review'"
      :visible="showModal"
      title="Add Review"
      mode="custom"
      @close="closeModal"
    >
      <BaseForm
        title="Submit Review"
        submitText="Submit"
        @submit="submitReview"
      >
        <BaseInput
          v-model="review.comment"
          label="Comment"
          placeholder="Write your review..."
        />
        <BaseInput
          type="number"
          v-model="review.rating"
          label="Rating (1-5)"
          min="1"
          max="5"
        />
      </BaseForm>
    </GlobalPopupModal>

    <!-- Complaint Modal -->
    <GlobalPopupModal
      v-if="modalMode === 'complaint'"
      :visible="showModal"
      title="Add Complaint"
      mode="custom"
      @close="closeModal"
    >
      <BaseForm
        title="Submit Complaint"
        submitText="Submit"
        @submit="submitComplaint"
      >
        <BaseInput
          v-model="complaint.subject"
          label="Subject"
          placeholder="Complaint subject"
        />
        <BaseInput
          v-model="complaint.description"
          label="Description"
          placeholder="Describe your issue"
          type="textarea"
        />
      </BaseForm>
    </GlobalPopupModal>

    <!-- Success Modal -->
    <GlobalPopupModal
      v-if="modalMode === 'success'"
      :visible="showModal"
      title="Success"
      mode="custom"
      @close="closeModal"
    >
      <p>{{ successMessage }}</p>
    </GlobalPopupModal>
  </div>
</template>

<script>
import BaseTable from "@/components/Elements/BaseTable.vue";
import GlobalPopupModal from "@/components/Elements/GlobalPopupModal.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import store from "@/store";

export default {
  name: "BookingsPage",
  components: {
    BaseTable,
    GlobalPopupModal,
    BaseForm,
    BaseInput,
  },
  data() {
    return {
      loading: false,
      error: null,
      bookings: [],
      pagination: null,
      showModal: false,
      modalMode: null,
      selectedBooking: null,
      successMessage: "",

      review: {
        user_id: store.state.user.id,
        booking_id: null,
        trip_id: null,
        rating: "",
        comment: "",
      },
      complaint: {
        user_id: store.state.user.id,
        booking_id: null,
        trip_id: null,
        subject: "",
        description: "",
        status: "open",
      },
    };
  },

  methods: {
    async fetchBookings(page = 1) {
      this.loading = true;
      this.error = null;

      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/bookings/user?page=${page}`
      );

      if (success) {
        this.bookings = data.data.data || [];
        this.pagination = {
          current_page: data.data.current_page,
          last_page: data.data.last_page,
        };
      } else {
        this.error = err || "Failed to load bookings.";
      }
      this.loading = false;
    },

    openViewModal(booking) {
      this.selectedBooking = booking;
      this.modalMode = "view";
      this.showModal = true;
    },
    onCancelBooking(booking) {
      this.selectedBooking = booking;
      this.modalMode = "cancel";
      this.showModal = true;
    },
    onReviewBooking(booking) {
      this.review = {
        user_id: store.state.user.id,
        booking_id: booking.id,
        trip_id: booking.trip.id, // ✅ added trip_id
        rating: "",
        comment: "",
      };
      this.modalMode = "review";
      this.showModal = true;
    },
    onComplaintBooking(booking) {
      this.complaint = {
        user_id: store.state.user.id,
        booking_id: booking.id,
        trip_id: booking.trip.id, // ✅ added trip_id
        subject: "",
        description: "",
        status: "open",
      };
      this.modalMode = "complaint";
      this.showModal = true;
    },

    async confirmCancelBooking() {
      const id = this.selectedBooking.id;
      const { success, error } = await store.dispatch("makePostRequest", {
        url: store.state.server + `api/bookings/${id}/cancel`,
      });
      this.successMessage = success
        ? "Booking cancelled successfully."
        : "Cancel failed: " + error;
      this.modalMode = "success";
      if (success) this.fetchBookings();
    },

    async submitReview() {
      const { success, error } = await store.dispatch("makePostRequest", {
        url: store.state.server + "api/reviwes",
        data: this.review,
      });
      this.successMessage = success
        ? "Review submitted successfully."
        : "Review failed: " + error;
      this.modalMode = "success";
    },

    async submitComplaint() {
      const { success, error } = await store.dispatch("makePostRequest", {
        url: store.state.server + "api/complaints/",
        data: this.complaint,
      });
      this.successMessage = success
        ? "Complaint submitted successfully."
        : "Complaint failed: " + error;
      this.modalMode = "success";
    },

    closeModal() {
      this.showModal = false;
      this.modalMode = null;
      this.selectedBooking = null;
    },
  },
  mounted() {
    this.fetchBookings();
  },
};
</script>

<style scoped>
.trips-page {
  padding: 1rem;
}
.loading {
  color: var(--color-primary);
}
.error {
  color: red;
}
.btn.cancel {
  background-color: #e67e22;
  color: #fff;
}
.btn.review {
  background-color: #27ae60;
  color: #fff;
}
.btn.complaint {
  background-color: #c0392b;
  color: #fff;
}
</style>
