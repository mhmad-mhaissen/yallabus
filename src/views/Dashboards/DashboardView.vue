<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="dashboard-view">
      <h2>
        Welcome back,
        {{ $store.state.user.first_name + " " + $store.state.user.last_name }}!
      </h2>
      <div class="stats">
        <div class="card">
          <Icon icon="mdi:account-multiple" class="icon" />
          <div>
            <h3>1,245</h3>
            <p>Users</p>
          </div>
        </div>
        <div class="card">
          <Icon icon="mdi:calendar-check" class="icon" />
          <div>
            <h3>328</h3>
            <p>Bookings</p>
          </div>
        </div>
        <div class="card">
          <Icon icon="mdi:email" class="icon" />
          <div>
            <h3>75</h3>
            <p>Messages</p>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import SidebarLayout from "@/components/Dashboards/SidebarComponent.vue";
import { Icon } from "@iconify/vue";

export default {
  components: {
    SidebarLayout,
    Icon,
  },
};
</script>

<style scoped>
.admin-home {
  padding: 2rem;
}

.admin-home h2 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.card {
  flex: 1 1 250px;
  background-color: var(--color-surface);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card .icon {
  font-size: 2rem;
  color: var(--color-accent);
}

.card h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.card p {
  margin: 0;
  color: var(--color-muted);
}
</style>
