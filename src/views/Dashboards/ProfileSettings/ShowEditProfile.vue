<template>
  <div class="layout" v-if="$store.state.user">
    <BaseLayout
      :route-title="'Edit Profile'"
      :navLinks="$store.state.NavLinks[$store.state.role]"
    >
      <BaseForm
        title="Edit Profile"
        submitText="Save Changes"
        @submit="updateProfile"
      >
        <!-- User Info -->
        <BaseInput
          v-model="form.first_name"
          label="First Name"
          placeholder="Enter first name"
          :disabled="form.first_name == null"
        />
        <BaseInput
          v-model="form.last_name"
          label="Last Name"
          placeholder="Enter last name"
          :disabled="form.last_name == null"
        />
        <BaseInput v-model="form.email" label="Email" type="email" />
        <PhoneInput
          v-model:codePhone="form.code_phone"
          v-model:phone="form.phone"
          :disabled="form.code_phone == null || form.phone == null"
        />
        <BaseDropdown
          v-model="form.city_id"
          label="City"
          :options="cities"
          :disabled="form.city_id == null"
        />

        <!-- Company Info -->
        <template v-if="hasCompany">
          <BaseInput
            v-model="form.company_name"
            label="Company Name"
            placeholder="Enter company name"
            :disabled="form.company_name == null"
          />
          <BaseInput
            v-model="form.company_description"
            label="Company Description"
            placeholder="Enter company description"
            :disabled="form.company_description == null"
          />
          <BaseInput
            v-model="form.company_contact_email"
            label="Company Contact Email"
            type="email"
            placeholder="Enter company contact email"
            :disabled="form.company_contact_email == null"
          />
          <BaseInput
            v-model="form.company_contact_phone"
            label="Company Contact Phone"
            placeholder="Enter company contact phone"
            :disabled="form.company_contact_phone == null"
          />
        </template>
      </BaseForm>
    </BaseLayout>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from "vue";
import { useStore } from "vuex";

import BaseLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import BaseDropdown from "@/components/Elements/BaseDropdown.vue";
import PhoneInput from "@/components/Elements/PhoneInput.vue";

const store = useStore();
const cities = ref([]);
const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  code_phone: "",
  phone: "",
  city_id: null,
  company_name: null,
  company_description: null,
  company_contact_email: null,
  company_contact_phone: null,
});

const hasCompany = computed(() => !!store.state.user?.company);

watchEffect(() => {
  const user = store.state.user;
  if (user) {
    form.value = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      code_phone: user.code_phone,
      phone: user.phone,
      city_id: user.city?.id || null,
      company_name: user.company?.company_name ?? null,
      company_description: user.company?.company_description ?? null,
      company_contact_email: user.company?.company_contact_email ?? null,
      company_contact_phone: user.company?.company_contact_phone ?? null,
    };
  }
});

onMounted(async () => {
  try {
    const response = await store.dispatch(
      "makeGetRequest",
      store.state.server + "api/cities?country_id=1"
    );
    cities.value = response.data.data.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  } catch (err) {
    console.error("Failed to fetch cities:", err);
  }
});

const updateProfile = async () => {
  try {
    // Patch 1: update contact info
    await store.dispatch("makePatchRequest", {
      url: store.state.server + "api/user/settings/update-contact-info",
      data: {
        email: form.value.email,
        code_phone: form.value.code_phone,
        phone: form.value.phone,
      },
    });

    // Patch 2: update profile
    await store.dispatch("makePatchRequest", {
      url: store.state.server + `api/user/settings/update-profile`,
      data: {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        city_id: form.value.city_id,
        company_name: form.value.company_name,
        company_description: form.value.company_description,
        company_contact_email: form.value.company_contact_email,
        company_contact_phone: form.value.company_contact_phone,
      },
    });

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    store.state.token = null;
    store.state.user = null;
  } catch (err) {
    console.error("Failed to update profile:", err);
  }
};
</script>
