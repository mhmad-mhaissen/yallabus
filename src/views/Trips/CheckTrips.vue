<template>
  <div class="check-trips">
    <!-- 🟢 Suggestions Swiper -->
    <div v-if="suggestions.length" class="suggestions-section">
      <h2>Suggestions</h2>
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
        <swiper-slide v-for="trip in suggestions" :key="trip.id">
          <TripCard :trips="[trip]" />
        </swiper-slide>
      </swiper>
    </div>

    <h2>Available Trips</h2>

    <!-- 🔎 Advanced Search -->
    <div class="search-form">
      <BaseDropdown
        v-model="filters.departure_city"
        label="Departure City"
        :options="departureCityOptions"
      />
      <BaseDropdown
        v-model="filters.arrival_city"
        label="Arrival City"
        :options="arrivalCityOptions"
      />
      <BaseDropdown
        v-model="filters.company"
        label="Company"
        :options="companyOptions"
      />
      <BaseInput v-model="filters.date" type="date" label="Date" />
      <button class="reset-btn" @click="resetFilters">Reset</button>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading" class="loading">Loading Trips...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Trips Grid -->
    <div v-if="!loading && !error" class="trips-grid">
      <TripCard :trips="filteredTrips" />
    </div>
  </div>
</template>

<script>
import TripCard from "@/components/Elements/TripCard.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";
import store from "@/store";

import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default {
  name: "check-trips",
  components: {
    TripCard,
    BaseInput,
    BaseDropdown,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      loading: false,
      error: null,
      allTrips: [], // full dataset
      suggestions: [], // suggested trips
      filters: {
        departure_city: "",
        arrival_city: "",
        company: "",
        date: "",
      },
    };
  },
  computed: {
    departureCityOptions() {
      const unique = [
        ...new Set(
          this.allTrips.map((t) => t.departure_city?.name).filter(Boolean)
        ),
      ];
      return [
        { value: "", label: "All" },
        ...unique.map((c) => ({ value: c, label: c })),
      ];
    },
    arrivalCityOptions() {
      const unique = [
        ...new Set(
          this.allTrips.map((t) => t.arrival_city?.name).filter(Boolean)
        ),
      ];
      return [
        { value: "", label: "All" },
        ...unique.map((c) => ({ value: c, label: c })),
      ];
    },
    companyOptions() {
      const unique = [
        ...new Set(this.allTrips.map((t) => t.company?.name).filter(Boolean)),
      ];
      return [
        { value: "", label: "All" },
        ...unique.map((c) => ({ value: c, label: c })),
      ];
    },
    filteredTrips() {
      return this.allTrips.filter((trip) => {
        const matchDeparture =
          !this.filters.departure_city ||
          trip.departure_city?.name === this.filters.departure_city;
        const matchArrival =
          !this.filters.arrival_city ||
          trip.arrival_city?.name === this.filters.arrival_city;
        const matchCompany =
          !this.filters.company || trip.company?.name === this.filters.company;
        const matchDate =
          !this.filters.date ||
          trip.departure_time.slice(0, 10) === this.filters.date;

        return matchDeparture && matchArrival && matchCompany && matchDate;
      });
    },
  },
  methods: {
    async fetchTrips() {
      this.loading = true;
      this.error = null;

      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/trips/user`
      );

      if (success) {
        this.allTrips = data.data.data || [];
      } else {
        this.error = err || "Failed to load trips.";
      }

      this.loading = false;
    },
    async fetchSuggestions() {
      const { success, data } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/trips/suggestions`
      );
      if (success) {
        this.suggestions = data.data || [];
      }
    },
    resetFilters() {
      this.filters = {
        departure_city: "",
        arrival_city: "",
        company: "",
        date: "",
      };
    },
  },
  mounted() {
    this.fetchTrips();
    this.fetchSuggestions();
  },
};
</script>

<style scoped>
.check-trips {
  padding: 1rem;
}

/* 🟢 Suggestions */
.suggestions-section {
  margin-bottom: 2rem;
}
.suggestions-section h2 {
  margin-bottom: 1rem;
}

/* 🔎 Search Form */
.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: end;
}
.search-btn,
.reset-btn {
  padding: 0.6rem 1.2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.reset-btn {
  background: var(--color-muted);
}
.search-btn:hover,
.reset-btn:hover {
  opacity: 0.9;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
</style>
