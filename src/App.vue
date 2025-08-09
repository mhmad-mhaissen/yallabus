<template>
  <NavbarComponent />
  <router-view />
  <FooterComponent />
  <LoadingOverlay />
</template>

<script>
import NavbarComponent from "./components/NavbarComponent.vue";
import FooterComponent from "./components/FooterComponent.vue";
import LoadingOverlay from "@/components/Elements/LoadingOverlay.vue";
import store from "./store";

export default {
  components: {
    NavbarComponent,
    FooterComponent,
    LoadingOverlay,
  },
  mounted() {
    store.state.token = localStorage.getItem("token")
      ? localStorage.getItem("token")
      : null;
    store.state.user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
    store.state.role = localStorage.getItem("user")
      ? store.state.user.role.name
      : null;
    store.state.role_name = localStorage.getItem("user")
      ? store.state.user.role.changeable_name
      : null;
    store.state.permissions = localStorage.getItem("user")
      ? store.state.user.role.permissions
      : null;
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 100px;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

@media screen and (max-width: 770px) {
  #app {
    margin-top: 70px;
  }
}
</style>
