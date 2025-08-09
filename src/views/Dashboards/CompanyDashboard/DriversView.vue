<template>
  <div class="drivers-view">
    <SidebarComponent
      :routeTitle="$store.state.role_name + ' Dashboard'"
      :navLinks="$store.state.NavLinks[$store.state.role]"
    >
      <div class="drivers-management">
        <h2>Drivers Management</h2>

        <button
          v-if="can('create_driver')"
          class="add-btn"
          @click="onAddDriver"
        >
          + Add Driver
        </button>

        <div v-if="loading" class="loading">Loading Drivers...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <BaseTable
          v-if="!loading && !error"
          :titles="titles"
          :keys="keys"
          :data="drivers"
          model="driver"
          @edit="onEditDriver"
          @delete="onDeleteDriver"
          @view="onViewDriver"
        />
      </div>
      <!-- Add/Edit Role Modal -->
      <GlobalModal
        v-if="modalMode === 'add' || modalMode === 'edit'"
        :visible="showModal"
        :title="modalMode === 'add' ? 'Add Driver' : 'Edit Driver'"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm
          :title="modalMode === 'add' ? 'New Driver' : 'Edit Driver'"
          :submitText="modalMode === 'add' ? 'Create' : 'Update'"
          @submit="submitDriver"
        >
          <BaseInput
            v-model="newDriver.name"
            label="Driver Name"
            placeholder="e.g. Lana"
          />
          <BaseInput
            v-model="newDriver.license_number"
            label="Licents Number"
            placeholder="e.g. 123498765"
          />
          <PhoneInput v-model:codePhone="code_phone" v-model:phone="phone" />
          <BaseInput type="file" label="Photo" id="img" />
        </BaseForm>
      </GlobalModal>

      <!-- Confirm Delete Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        :confirmMessage="`Are you sure you want to delete the driver '${selectedDriver?.name}'?`"
        @close="closeModal"
        @confirm="confirmDelete"
      />

      <!-- View Role Modal -->
      <GlobalModal
        v-if="modalMode === 'view'"
        :visible="showModal"
        :data="selectedDriver"
        title="Driver Details"
        mode="view"
        @close="closeModal"
      />

      <!-- Success Modal -->
      <GlobalModal
        v-if="modalMode === 'success'"
        :visible="showModal"
        title="Success"
        mode="custom"
        @close="closeModal"
      >
        <p>{{ successMessage }}</p>
      </GlobalModal>
    </SidebarComponent>
  </div>
</template>

<script>
import SidebarComponent from "@/components/Dashboards/SidebarComponent.vue";
import store from "@/store";
import BaseTable from "@/components/Elements/BaseTable.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import PhoneInput from "@/components/Elements/PhoneInput.vue";

export default {
  name: "drivers-view",
  data() {
    return {
      loading: false,
      error: null,
      titles: ["Name", "License Number", "Phone"],
      keys: ["name", "license_number", "phone"],
      drivers: [],
      modalMode: null,
      showModal: false,
      code_phone: "",
      phone: "",
      successMessage: "",
      newDriver: {
        company_id: "",
        name: "",
        license_number: "",
        phone: "",
        photo: null,
      },
      selectedDriver: null,
    };
  },
  components: {
    SidebarComponent,
    BaseTable,
    GlobalModal,
    BaseForm,
    BaseInput,
    PhoneInput,
  },
  methods: {
    can(permission) {
      return (store.state.permissions || []).includes(permission);
    },
    onDeleteDriver(driver) {
      this.selectedDriver = driver;
      this.modalMode = "confirm";
      this.showModal = true;
    },
    confirmDelete() {
      const driver = this.selectedDriver;
      store
        .dispatch(
          "makeDeleteRequest",
          store.state.server + `api/${store.state.role}/drivers/${driver.id}`
        )
        .then(({ success, error }) => {
          this.successMessage = success
            ? "Driver deleted successfully."
            : "Delete failed: " + error;
          this.modalMode = "success";
          if (success) this.fetchDrivers();
        });
    },
    onEditDriver(driver) {
      store
        .dispatch(
          "makeGetRequest",
          store.state.server + `api/${store.state.role}/drivers/${driver.id}`
        )
        .then(({ success, data }) => {
          if (success) {
            const r = data.data;
            this.newDriver = {
              id: r.id,
              name: r.name,
              license_number: r.license_number,
              phone: r.phone,
              photo: r.photo,
            };
            [this.code_phone, this.phone] = r.phone.split(" ");

            this.modalMode = "edit";
            this.showModal = true;
          }
        });
    },
    onViewDriver(driver) {
      this.selectedDriver = driver;
      this.modalMode = "view";
      this.showModal = true;
    },
    async submitDriver() {
      const photo = document.querySelector("#img input[type='file']");
      const formdata = new FormData();
      if (photo.files.length != 0) {
        formdata.append("photo", photo.files[0]);
      }
      formdata.append("company_id", store.state.company.id);
      formdata.append("phone", this.code_phone + " " + this.phone);
      formdata.append("name", this.newDriver.name);
      formdata.append("license_number", this.newDriver.license_number);

      if (this.modalMode === "add") {
        await store
          .dispatch("makePostRequest", {
            url: store.state.server + `api/${store.state.role}/drivers`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Driver created successfully."
              : "Creation failed: " + error;
            this.modalMode = "success";
            this.error = error;
            if (success) this.fetchDrivers();
          });
      } else if (this.modalMode === "edit") {
        await store
          .dispatch("makePostRequest", {
            url:
              store.state.server +
              `api/${store.state.role}/drivers/${this.newDriver.id}`,
            data: formdata,
          })
          .then(({ success, error }) => {
            this.successMessage = success
              ? "Driver updated successfully."
              : "Update failed: " + error;
            this.modalMode = "success";
            if (success) this.fetchDrivers();
          });
      }
    },
    onAddDriver() {
      this.resetDriverForm();
      this.modalMode = "add";
      this.showModal = true;
    },
    resetDriverForm() {
      this.newDriver = {
        company_id: "",
        name: "",
        license_number: "",
        phone: "",
        photo: null,
      };
      this.code_phone = "";
      this.phone = "";
    },
    closeModal() {
      this.showModal = false;
      this.modalMode = null;
      this.selectedDriver = null;
    },
    async fetchDrivers() {
      this.loading = true;
      this.error = null;
      const {
        success,
        data,
        error: err,
      } = await store.dispatch(
        "makeGetRequest",
        store.state.server + `api/${store.state.role}/drivers`
      );
      if (success) this.drivers = data.data.data;
      else this.error = err || "Failed to load drivers.";
      this.loading = false;
    },
  },
  mounted() {
    this.fetchDrivers();
  },
};
</script>
