<template>
  <div class="trips-swiper">
    <swiper
      :slides-per-view="1"
      :space-between="20"
      :breakpoints="{
        640: { slidesPerView: 1.2 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }"
      navigation
      pagination
      loop
    >
      <swiper-slide v-for="trip in trips" :key="trip.id">
        <div class="trip-card">
          <!-- Header -->
          <div class="trip-header">
            <h2 class="trip-route">
              {{ trip.departure_city?.name || "---" }} →
              {{ trip.arrival_city?.name || "---" }}
            </h2>
            <span class="trip-status" :class="trip.status">
              {{ trip.status || "unknown" }}
            </span>
          </div>

          <!-- Info -->
          <div class="trip-info">
            <div class="info-item">
              <span class="label">Company</span>
              <span class="value">{{ trip.company?.name || "N/A" }}</span>
            </div>
            <div class="info-item">
              <span class="label">Bus</span>
              <span class="value">
                {{
                  trip.bus
                    ? trip.bus.model + " (" + trip.bus.plate_number + ")"
                    : "N/A"
                }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Driver</span>
              <span class="value">{{ trip.driver?.name || "N/A" }}</span>
            </div>
            <div class="info-item">
              <span class="label">Departure</span>
              <span class="value">
                {{
                  trip.departure_time ? formatDate(trip.departure_time) : "N/A"
                }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Arrival</span>
              <span class="value">
                {{ trip.arrival_time ? formatDate(trip.arrival_time) : "N/A" }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Seats</span>
              <span class="value">{{ trip.available_seats ?? "N/A" }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="trip-footer">
            <div class="price">
              {{ trip.price ? Number(trip.price).toLocaleString() : "N/A" }}
            </div>
            <button class="book-btn" @click="RedirectToTrip(trip)">
              Book Now
            </button>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import router from "@/router";
import store from "@/store";

defineProps({
  trips: {
    type: Array,
    required: true,
  },
});

function formatDate(date) {
  return new Date(date).toLocaleString("ar-SY", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function RedirectToTrip(trip) {
  store.state.trip = trip;
  localStorage.setItem("trip", JSON.stringify(trip));
  router.push("/trip-info");
}
</script>

<style scoped>
.trips-swiper {
  padding: 1rem 0;
}

.trip-card {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.trip-route {
  font-size: 1.2rem;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.trip-status {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}
.trip-status.available {
  background: var(--color-accent);
  color: white;
}
.trip-status.unavailable {
  background: var(--color-muted);
  color: white;
}

.trip-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
.info-item {
  display: flex;
  flex-direction: column;
}
.info-item .label {
  font-size: 0.75rem;
  color: var(--color-muted);
}
.info-item .value {
  font-size: 0.95rem;
  font-weight: 500;
}

.trip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-primary-dark);
}
.book-btn {
  background: var(--gradient-accent);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.book-btn:hover {
  opacity: 0.9;
}
</style>
