<template>
  <div class="trip-info-page" v-if="trip">
    <!-- Trip Header -->
    <div class="trip-header">
      <h2 class="trip-title">
        {{ trip.departure_city?.name }} → {{ trip.arrival_city?.name }}
      </h2>
      <p class="trip-company">Company: {{ trip.company?.name }}</p>
      <p class="trip-date">Departure: {{ formatDate(trip.departure_time) }}</p>
      <p class="trip-price">
        Price: {{ Number(trip.price).toLocaleString() }} SYP
      </p>
    </div>

    <!-- Bus Layout -->
    <div class="bus">
      <div class="driver-seat">🪑 Driver</div>
      <div class="seats-grid">
        <button
          v-for="seat in seats"
          :key="seat.id"
          class="seat"
          :class="{
            selected: selectedSeats.includes(seat.id),
            booked: seat.booked,
          }"
          :disabled="seat.booked"
          @click="toggleSeat(seat.id)"
        >
          {{ seat.id }}
        </button>
      </div>
    </div>

    <!-- Selected Seats -->
    <div class="summary">
      <h3>Selected Seats</h3>
      <p v-if="!selectedSeats.length">No seats selected.</p>
      <ul>
        <li v-for="id in selectedSeats" :key="id">Seat {{ id }}</li>
      </ul>
      <button
        v-if="selectedSeats.length"
        class="confirm-btn"
        @click="openConfirmModal"
      >
        Confirm Booking
      </button>
    </div>

    <!-- Confirm Booking Modal -->
    <GlobalModal
      v-if="modalMode === 'confirm'"
      :visible="showModal"
      title="Confirm Booking"
      mode="confirm"
      :confirmMessage="`Are you sure you want to book seat(s): ${selectedSeats.join(
        ', '
      )}?`"
      @close="closeModal"
      @confirm="confirmBooking"
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

    <!-- Error Modal -->
    <GlobalModal
      v-if="modalMode === 'error'"
      :visible="showModal"
      title="Booking Failed"
      mode="custom"
      @close="closeModal"
    >
      <p>{{ errorMessage }}</p>
    </GlobalModal>
  </div>
  <div v-else>
    <p>No trip selected.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import store from "@/store";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";

const trip = ref(null);
const seats = ref([]);
const selectedSeats = ref([]);

const showModal = ref(false);
const modalMode = ref(null);
const successMessage = ref("");
const errorMessage = ref("");

// Generate seats based on trip.available_seats or total
function generateSeats(total = 50, bookedCount = 0) {
  const seatArray = [];
  for (let i = 1; i <= total; i++) {
    seatArray.push({
      id: i,
      booked: i <= bookedCount, // mark first seats as booked (demo)
    });
  }
  return seatArray;
}

function toggleSeat(id) {
  if (selectedSeats.value.includes(id)) {
    selectedSeats.value = selectedSeats.value.filter((s) => s !== id);
  } else {
    selectedSeats.value.push(id);
  }
}

function openConfirmModal() {
  modalMode.value = "confirm";
  showModal.value = true;
}

async function confirmBooking() {
  try {
    const bookingReference = `REF-${Date.now()}`;
    const totalPrice = selectedSeats.value.length * Number(trip.value.price);

    const payload = new FormData();
    payload.append("user_id", store.state.user.id);
    payload.append("trip_id", trip.value.id);

    let counter = 0;
    // ✅ أرسل seats كمصفوفة
    selectedSeats.value.forEach((seat) => {
      payload.append(`seats[${counter}]`, seat);
      counter++;
    });

    payload.append("totalPrice", totalPrice);

    const { success, error } = await store.dispatch("makePostRequest", {
      url: store.state.server + `api/bookings`,
      data: payload,
    });

    if (success) {
      successMessage.value = `Booking successful! Reference: ${bookingReference}`;
      modalMode.value = "success";
    } else {
      errorMessage.value = "Booking failed: " + (error || "Unknown error.");
      modalMode.value = "error";
    }
  } catch (err) {
    errorMessage.value = "Booking failed: " + err.message;
    modalMode.value = "error";
  }
}

function closeModal() {
  showModal.value = false;
  modalMode.value = null;
}

function formatDate(date) {
  return new Date(date).toLocaleString("ar-SY", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

onMounted(() => {
  // load trip from store or localStorage
  trip.value =
    Object.keys(store.state.trip || {}).length > 0
      ? store.state.trip
      : JSON.parse(localStorage.getItem("trip"));

  if (trip.value) {
    // Example: total 50 seats, (total - available) are booked
    const total = 50;
    const bookedCount = total - trip.value.available_seats;
    seats.value = generateSeats(total, bookedCount);
  }
});
</script>

<style scoped>
.trip-info-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  color: var(--color-text);
}

/* Trip Header */
.trip-header {
  background: var(--gradient-primary);
  color: white;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.trip-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.trip-company,
.trip-date,
.trip-price {
  margin: 0.3rem 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

/* Bus Layout */
.bus {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}
.bus:hover {
  transform: translateY(-3px);
}

.driver-seat {
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--color-primary-dark);
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
}

.seat {
  background: var(--color-surface);
  border: 2px solid var(--color-muted);
  padding: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  text-align: center;
  color: var(--color-text);
}
.seat:hover {
  background: var(--section-overlay-color);
  border-color: var(--color-primary);
}
.seat.selected {
  background: var(--gradient-accent);
  border-color: var(--color-accent);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}
.seat.booked {
  background: var(--color-muted);
  border-color: var(--color-muted);
  color: white;
  cursor: not-allowed;
}

/* Summary */
.summary {
  margin-top: 2rem;
  background: var(--color-surface);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.summary ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
  list-style: disc;
  color: var(--color-primary-dark);
}

.confirm-btn {
  margin-top: 1rem;
  background: var(--gradient-primary);
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.confirm-btn:hover {
  opacity: 0.95;
  transform: translateY(-2px);
}
</style>
