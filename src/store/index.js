import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    user: null,
    token: null,
    loading: false,
    error: null,
    role: null,
    role_name: null,
    permissions: [],
    server: "http://127.0.0.1:8000/",
    NavLinks: {
      "super-admin": [
        { name: "Home", to: "/dashboard", icon: "mdi:view-dashboard" },
        {
          name: "Users Management",
          to: "/users-management",
          icon: "mdi:account-group",
        },
        { name: "Roles", to: "/roles", icon: "mdi:account-key" },
        { name: "Permissions", to: "/permissions", icon: "mdi:shield-key" },
        { name: "Currencies", to: "/currencies", icon: "mdi:currency-usd" },
        { name: "Countries", to: "/countries", icon: "mdi:earth" },
        { name: "Cities", to: "/cities", icon: "mdi:city" },
      ],
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
  },

  mutations: {
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
    LOGOUT(state) {
      state.user = null;
      state.token = null;
    },
  },

  actions: {
    checkEmptyFields({ commit }, fields) {
      for (const [key, value] of Object.entries(fields)) {
        if (!value || value.toString().trim() === "") {
          const message = `${key} is required.`;
          commit("SET_ERROR", message);
          return { valid: false, message };
        }
      }
      return { valid: true };
    },

    validateEmail({ commit }, email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);

      if (!isValid) {
        const message = "Invalid email format.";
        commit("SET_ERROR", message);
        return { valid: false, message };
      }

      return { valid: true };
    },

    async makeGetRequest({ commit, state }, url) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message || "GET request failed.";
        commit("SET_ERROR", message);
        return { success: false, error: message };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async makePostRequest({ commit, state }, { url, data }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const response = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message || "POST request failed.";
        commit("SET_ERROR", message);
        return { success: false, error: message };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async makePutRequest({ commit, state }, { url, data }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const response = await axios.put(url, data, {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message || "PUT request failed.";
        commit("SET_ERROR", message);
        return { success: false, error: message };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async makeDeleteRequest({ commit, state }, url) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const response = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message || "DELETE request failed.";
        commit("SET_ERROR", message);
        return { success: false, error: message };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async makePatchRequest({ commit, state }, { url, data }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const response = await axios.patch(url, data, {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message || "PATCH request failed.";
        commit("SET_ERROR", message);
        return { success: false, error: message };
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },

  modules: {},
});
