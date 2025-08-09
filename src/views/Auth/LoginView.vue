<template>
  <div class="login-container">
    <BaseForm title="Login" submitText="Login" @submit="onSubmit">
      <BaseInput
        v-model="email"
        type="email"
        label="Email or Phone"
        placeholder="Enter your email or phone"
      />

      <BaseInput
        v-model="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
      />

      <button
        type="button"
        class="forgot-password"
        @click.prevent="onForgotPassword"
      >
        Forgot Password?
      </button>

      <p v-if="error" class="error-text">{{ error }}</p>

      <router-link class="register-link" to="/register">
        Don't have an account? Register
      </router-link>
    </BaseForm>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import store from "@/store";
import router from "@/router";

const email = ref("");
const password = ref("");

const error = computed(() => store.getters.getError);

async function onForgotPassword() {
  if (!email.value) {
    store.commit(
      "SET_ERROR",
      "Please enter your email before resetting password."
    );
    return;
  }

  // Validate email format
  const emailCheck = await store.dispatch("validateEmail", email.value);
  if (!emailCheck.valid) return;

  const response = await store.dispatch("makePostRequest", {
    url: store.state.server + "auth/forgot-password",
    data: {
      email: email.value,
    },
  });

  if (response.success) {
    store.commit("SET_ERROR", "Password reset link sent if email exists.");
  } else {
    store.commit("SET_ERROR", response.message || "Something went wrong.");
  }
}

async function onSubmit() {
  // Validate required fields
  const fieldsCheck = await store.dispatch("checkEmptyFields", {
    email: email.value,
    password: password.value,
  });
  if (!fieldsCheck.valid) return;

  // Validate email format
  const emailCheck = await store.dispatch("validateEmail", email.value);
  if (!emailCheck.valid) return;

  // Make the POST request directly
  const response = await store.dispatch("makePostRequest", {
    url: store.state.server + "auth/login", // adjust endpoint as needed
    data: {
      email_or_phone: email.value,
      password: password.value,
    },
  });

  if (response.success) {
    const token = response.data.token
      ? response.data.token
      : response.data.data.token;
    const user = JSON.stringify(response.data.data.user);

    // Save to Vuex
    store.state.token = token;
    store.state.user = JSON.parse(user);

    // Save to localstorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", user);

    router.push("/");
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg);
}
.error-text {
  color: red;
  font-size: 0.85rem;
}

.register-link {
  display: block;
  margin-top: 1rem;
  text-align: center;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.register-link:hover {
  text-decoration: underline;
}

.forgot-password {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  text-align: left;
  padding: 0;
}

.forgot-password:hover {
  text-decoration: underline;
}
</style>
