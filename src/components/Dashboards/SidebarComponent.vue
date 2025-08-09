<template>
  <div class="layout" v-if="$store.state.user != null">
    <!-- Sidebar -->
    <aside :class="['sidebar', { closed: !isSidebarOpen }]">
      <button class="toggle-btn" @click="toggleSidebar">
        <Icon icon="mdi:menu" height="40" width="40px" />
      </button>
      <nav>
        <RouterLink
          v-for="(link, index) in navLinks"
          :key="index"
          :to="link.to"
          class="nav-link"
        >
          <div class="icon-wrapper">
            <Icon :icon="link.icon" class="nav-icon" />
          </div>
          <span v-if="isSidebarOpen" class="link-name">{{ link.name }}</span>
          <span v-else class="tooltip">{{ link.name }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <h1 class="route-title">{{ routeTitle }}</h1>
        <div class="profile-wrapper" @click="toggleDropdown">
          <img
            class="avatar"
            :src="
              $store.state.user.avatar != null
                ? $store.state.user.avatar
                : avatarSrc
            "
            alt="Profile"
          />
          <div class="dropdown" v-if="showDropdown">
            <RouterLink
              to="/profile"
              class="dropdown-item"
              @click="closeDropdown"
              v-if="$store.state.role != 'super-admin'"
            >
              <Icon icon="mdi:account" />
              Show Profile
            </RouterLink>
            <RouterLink
              to="/change-password"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <Icon icon="mdi:lock-reset" />
              Change Password
            </RouterLink>
            <!-- Upload Avatar -->
            <label class="dropdown-item upload-avatar">
              <Icon icon="mdi:upload" />
              Upload Avatar
              <input
                type="file"
                @change="uploadAvatar"
                accept="image/*"
                hidden
              />
            </label>
          </div>
        </div>
      </header>

      <!-- Page Slot Content -->
      <main class="content">
        <div class="content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import router from "@/router";
import store from "@/store";
import { Icon } from "@iconify/vue";

export default {
  props: {
    routeTitle: {
      type: String,
      default: "Dashboard",
    },
    navLinks: {
      type: Array,
    },
  },
  data() {
    return {
      isSidebarOpen: true,
      showDropdown: false,
      avatarSrc: require("@/assets/images/icons/user.png"),
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    closeDropdown() {
      this.showDropdown = false;
    },
    async uploadAvatar(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      const { success, data, error } = await this.$store.dispatch(
        "makePostRequest",
        {
          url: this.$store.state.server + "api/user/settings/avatar",
          data: formData,
        }
      );

      if (success) {
        this.$store.commit("SET_USER", data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        this.closeDropdown();
      } else {
        alert(error || "Failed to upload avatar.");
      }
    },
  },
  components: {
    Icon,
  },
  mounted() {
    if (store.state.token == null && store.state.user == null) {
      router.push("/");
    }
  },
};
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg);
}

.sidebar {
  width: 280px;
  background-color: var(--color-surface);
  transition: width 0.3s;
  overflow: hidden;
  position: relative;
}

.sidebar.closed {
  width: 90px;
  overflow: visible;

  .link-name {
    opacity: 0;
    pointer-events: none;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: background-color 0.2s, justify-content 0.3s ease;
  white-space: nowrap;
  position: relative;

  &:hover {
    background-color: var(--color-muted);
  }
}

.sidebar:not(.closed) .nav-link {
  justify-content: flex-start;
}
.sidebar.closed .nav-link {
  justify-content: center;
}

.tooltip {
  position: absolute;
  left: 70px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.nav-link:hover .tooltip {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(-50%) translateX(5px);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  min-width: 40px;
}

.nav-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 1rem;
  cursor: pointer;
  color: var(--color-primary);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-muted);
}

.route-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.profile-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 50px;
  background-color: var(--color-surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: var(--color-muted);
  }
}

.upload-avatar input {
  display: none;
}

.content {
  flex: 1;
  padding: 1rem;
  background-color: var(--color-bg);
  color: var(--color-text);
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-inner {
  max-width: 800px;
  width: 100%;
}
</style>
