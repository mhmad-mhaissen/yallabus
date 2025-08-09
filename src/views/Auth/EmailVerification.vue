<template>
  <div class="verify-container">
    <BaseForm
      title="Email Verification"
      submitText="Verify Code"
      @submit="verifyCode"
    >
      <p>
        We've sent a verification code to:
        <strong>{{ email }}</strong>
      </p>

      <BaseInput
        v-model="code"
        label="Verification Code"
        placeholder="Enter the 6-digit code"
        maxlength="6"
      />

      <p v-if="error" class="error-text">{{ error }}</p>

      <p class="resend-text">
        Didn’t receive the code?
        <span class="resend-link" @click="resendCode">Resend</span>
      </p>
      <router-link to="/login" class="login-link"> Back to Login </router-link>
    </BaseForm>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";

const route = useRoute();
const router = useRouter();
const store = useStore();

const email = ref("");
const code = ref("");
const error = ref("");

onMounted(() => {
  email.value = route.query.email || "";
});

const verifyCode = async () => {
  error.value = "";

  if (!code.value || code.value.length !== 6) {
    error.value = "Please enter a valid 6-digit verification code.";
    return;
  }

  try {
    const response = await store.dispatch(
      "makeGetRequest",
      store.state.server + `auth/verify?email=${email.value}&code=${code.value}`
    );

    if (response.success) {
      setTimeout(() => {
        router.push("/login");
      }, 400);
    } else {
      error.value = response.data?.message || "Invalid code.";
    }
  } catch (err) {
    error.value = "Verification failed. Please try again.";
  }
};

const resendCode = async () => {
  error.value = "";
  try {
    await store.dispatch("makePostRequest", {
      url: store.state.server + "auth/send-verify-email",
      data: { email: email.value },
    });
  } catch (err) {
    error.value = "Failed to resend code. Try again.";
  }
};
</script>

<style scoped>
.verify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 2rem;
}

.error-text {
  color: red;
  font-size: 0.85rem;
}

.resend-text {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.resend-link {
  color: var(--color-primary);
  cursor: pointer;
  font-weight: bold;
  margin-left: 4px;
}

.resend-link:hover {
  text-decoration: underline;
}

.login-link {
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--color-primary);
  text-align: center;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
