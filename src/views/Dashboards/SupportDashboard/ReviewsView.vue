<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="reviews-management">
      <h2>Reviews</h2>

      <!-- Loading & Error -->
      <div v-if="loading" class="loading">Loading reviews...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <!-- Reviews Table -->
      <BaseTable
        v-if="!loading && !error"
        :titles="titles"
        :keys="keys"
        :data="reviews"
      />
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

import SidebarLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseTable from "@/components/Elements/BaseTable.vue";

const store = useStore();

const reviews = ref([]);
const loading = ref(false);
const error = ref(null);

const titles = [
  "Review ID",
  "User first name",
  "User last name",
  "Trip Number",
  "Rating",
  "Comment",
  "Date",
];
const keys = [
  "id",
  "user.first_name",
  "user.last_name",
  "trip.id",
  "rating",
  "comment",
  "created_at",
];

async function fetchReviews() {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/reviwes"
  );
  if (success) reviews.value = data.data.data;
  else error.value = err || "Failed to load reviews.";
  loading.value = false;
}

onMounted(() => {
  fetchReviews();
});
</script>

<style scoped>
.reviews-management {
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
.loading {
  color: var(--color-muted);
  font-style: italic;
}
.error {
  color: #e74c3c;
  margin-bottom: 1rem;
}
</style>
