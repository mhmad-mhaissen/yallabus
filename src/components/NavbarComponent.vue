<template>
  <header class="navbar">
    <div class="navbar-content">
      <!-- Logo -->
      <div class="logo">
        <img src="@/assets/logo.png" alt="YallaBus Logo" />
        <span class="logo-text">YallaBus</span>
      </div>

      <!-- Center Nav Links (desktop) -->
      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/trips" v-if="$store.state.role == 'User'"
          >Trips</RouterLink
        >
        <RouterLink to="/bookings" v-if="$store.state.role == 'User'"
          >Bookings</RouterLink
        >
        <RouterLink
          to="/dashboard"
          v-else-if="$store.state.role != 'User' && $store.state.token != null"
          >Dashboard</RouterLink
        >
        <RouterLink to="/login" v-if="$store.state.token == null"
          >Login</RouterLink
        >
        <RouterLink to="/" @click.prevent="Logout" v-else>Logout</RouterLink>
      </nav>

      <!-- Right Controls -->
      <div class="controls">
        <button class="theme-toggle" @click="toggleTheme">
          <Icon
            :icon="isDark ? 'si:sun-fill' : 'solar:moon-bold'"
            class="theme-icon"
          />
        </button>
        <button class="menu-toggle" @click="toggleSidebar">☰</button>
      </div>
    </div>

    <!-- Backdrop overlay for sidebar -->
    <transition name="fade">
      <div v-if="sidebarOpen" class="backdrop" @click="closeSidebar"></div>
    </transition>

    <!-- Sidebar -->
    <transition name="sidebar-slide">
      <aside v-if="sidebarOpen" class="mobile-sidebar">
        <button class="close-btn" @click="closeSidebar">✕</button>
        <RouterLink to="/" @click="closeSidebar">Home</RouterLink>
        <RouterLink
          to="/trips"
          @click="closeSidebar"
          v-if="$store.state.role == 'User'"
          >Trips</RouterLink
        >
        <RouterLink
          to="/bookings"
          @click="closeSidebar"
          v-if="$store.state.role == 'User'"
          >Bookings</RouterLink
        >
        <RouterLink
          to="/dashboard"
          @click="closeSidebar"
          v-else-if="$store.state.role != 'User' && $store.state.token != null"
          >Dashboard</RouterLink
        >
        <RouterLink
          to="/login"
          @click="closeSidebar"
          v-if="$store.state.token == null"
          >Login</RouterLink
        >
        <RouterLink to="/" @click.prevent="Logout" v-else>Logout</RouterLink>
      </aside>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import store from "@/store";

const isDark = ref(false);
const sidebarOpen = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const html = document.documentElement;
  html.classList.toggle("dark", isDark.value);
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const Logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  store.state.user = null;
  store.state.token = null;
};

onMounted(() => {
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  }
});
</script>

<style scoped>
/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.navbar-content {
  max-width: 1200px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  height: 50px;
}

.logo-text {
  font-family: "Nunito Sans", sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
}

.nav-links a:hover {
  color: var(--color-accent);
}

/* Controls */
.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle,
.menu-toggle {
  background: unset;
  color: var(--color-primary);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

/* .theme-toggle:hover,
.menu-toggle:hover {
  background: var(--gradient-primary);
} */

.theme-toggle:focus {
  outline: none !important;
}

.theme-icon {
  font-size: 1.4rem;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

/* Sidebar */
.mobile-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 70%;
  height: 100vh;
  background-color: var(--color-surface);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  gap: 1.5rem;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transition: all 0.3s ease;
}

.mobile-sidebar a {
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.close-btn {
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text);
  cursor: pointer;
  margin-bottom: 1rem;
}

/* Backdrop */
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

/* Animations */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: inline-block;
  }
}

@media (min-width: 769px) {
  .menu-toggle,
  .mobile-sidebar,
  .backdrop {
    display: none;
  }
}
</style>
