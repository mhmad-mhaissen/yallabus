<template>
  <div class="register-container">
    <BaseForm title="Register" submitText="Create Account" @submit="onSubmit">
      <BaseInput
        v-model="first_name"
        label="First Name"
        placeholder="Enter your first name"
      />

      <BaseInput
        v-model="last_name"
        label="Last Name"
        placeholder="Enter your last name"
      />

      <BaseInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
      />

      <BaseInput
        v-model="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
      />

      <BaseInput
        v-model="password_confirmation"
        type="password"
        label="Confirm Password"
        placeholder="Confirm Password"
      />

      <BaseDropdown
        v-model="city_id"
        label="City"
        :options="cities"
        placeholder="Select city"
      />

      <PhoneInput v-model:codePhone="code_phone" v-model:phone="phone" />

      <p v-if="error" class="error-text">{{ error }}</p>

      <router-link class="login-link" to="/login">
        Already have an account? Login
      </router-link>
    </BaseForm>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";
import PhoneInput from "@/components/Elements/PhoneInput.vue"; // your custom phone input with flag
import router from "@/router";

const store = useStore();

const first_name = ref("");
const last_name = ref("");
const email = ref("");
const password = ref("");
const password_confirmation = ref("");
const city_id = ref(null);
const code_phone = ref(""); // e.g., +963
const phone = ref(""); // e.g., 987654321

const error = computed(() => store.getters.getError);

const cities = ref([]);

onMounted(async () => {
  try {
    const city_data = await store.dispatch(
      "makeGetRequest",
      store.state.server + "api/cities?country_id=1"
    );

    const data = city_data.data.data;
    cities.value = data.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  } catch (err) {
    console.error("Failed to fetch cities:", err);
  }
});

async function onSubmit() {
  // Simple validation
  const fieldsCheck = await store.dispatch("checkEmptyFields", {
    first_name: first_name.value,
    last_name: last_name.value,
    email: email.value,
    password: password.value,
    password_confirmation: password_confirmation.value,
    city_id: city_id.value,
    code_phone: code_phone.value,
    phone: phone.value,
  });
  if (!fieldsCheck.valid) return;

  const emailCheck = await store.dispatch("validateEmail", email.value);
  if (!emailCheck.valid) return;

  const response = await store.dispatch("makePostRequest", {
    url: store.state.server + "auth/sign-up",
    data: {
      first_name: first_name.value,
      last_name: last_name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      city_id: city_id.value,
      code_phone: code_phone.value,
      phone: phone.value,
    },
  });

  if (response.error == "يجب التحقق من الايميل") {
    store.commit("SET_ERROR", null);
    router.push("/email-verification?email=" + email.value);
  }
}
</script>

<style scoped>
.register-container {
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

.login-link {
  display: block;
  margin-top: 1rem;
  text-align: center;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
