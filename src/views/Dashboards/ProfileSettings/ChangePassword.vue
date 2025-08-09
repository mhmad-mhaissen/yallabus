<template>
  <div class="layout" v-if="$store.state.user">
    <BaseLayout :route-title="'Change Password'">
      <BaseForm
        title="Change Password"
        submitText="Update Password"
        @submit="changePassword"
      >
        <BaseInput
          v-model="form.old_password"
          label="Current Password"
          type="password"
          placeholder="Enter current password"
        />
        <BaseInput
          v-model="form.new_password"
          label="New Password"
          type="password"
          placeholder="Enter new password"
        />
        <BaseInput
          v-model="form.new_password_confirmation"
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
        />
      </BaseForm>
    </BaseLayout>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";

import BaseLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import router from "@/router";

const store = useStore();

const form = ref({
  old_password: "",
  new_password: "",
  new_password_confirmation: "",
});

const changePassword = async () => {
  try {
    await store.dispatch("makePatchRequest", {
      url: store.state.server + "api/user/settings/change-password",
      data: form.value,
    });

    form.value = {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    };
    router.push("/dashboard");
  } catch (err) {
    console.error("Failed to change password:", err);
    alert(
      "Error: " + (err.response?.data?.message || "Password update failed.")
    );
  }
};
</script>
