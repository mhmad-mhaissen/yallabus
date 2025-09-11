<template>
  <SidebarLayout
    :routeTitle="$store.state.role_name + ' Dashboard'"
    :navLinks="$store.state.NavLinks[$store.state.role]"
  >
    <div class="complaints-management">
      <h2>Complaints</h2>

      <!-- Loading & Error States -->
      <div v-if="loading" class="loading">Loading complaints...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <!-- Complaints Table -->
      <BaseTable
        v-if="!loading && !error"
        :titles="['Complaint ID', 'Subject', 'Status']"
        :keys="['id', 'subject', 'status']"
        :data="complaints"
        model="complaint"
        @view="onViewComplaint"
        @resolve="onResolveComplaint"
        @delete="onDeleteComplaint"
      >
        <!-- Custom Actions Slot -->
        <template #customActions="{ emitAction, item }">
          <button
            class="btn resolve"
            v-if="item.status !== 'resolved'"
            @click="emitAction('resolve')"
          >
            Resolve
          </button>
        </template>
      </BaseTable>

      <!-- Resolve Complaint Modal -->
      <GlobalModal
        v-if="modalMode === 'resolve'"
        :visible="showModal"
        title="Resolve Complaint"
        mode="custom"
        @close="closeModal"
      >
        <BaseForm @submit="submitResolution">
          <BaseInput
            v-model="selectedComplaint.resolution"
            label="Resolution"
            placeholder="Enter resolution"
            type="textarea"
          />
          <button type="submit" class="submit-btn">Resolve</button>
        </BaseForm>
      </GlobalModal>

      <!-- Delete Complaint Confirmation Modal -->
      <GlobalModal
        v-if="modalMode === 'confirm'"
        :visible="showModal"
        title="Confirm Deletion"
        mode="confirm"
        confirmMessage="Are you sure you want to delete this complaint?"
        @close="closeModal"
        @confirm="confirmDelete"
      />
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

import SidebarLayout from "@/components/Dashboards/SidebarComponent.vue";
import BaseTable from "@/components/Elements/BaseTable.vue";
import BaseForm from "@/components/Elements/BaseForm.vue";
import BaseInput from "@/components/Elements/BaseInput.vue";
import GlobalModal from "@/components/Elements/GlobalPopupModal.vue";

const store = useStore();

const complaints = ref([]);
const loading = ref(false);
const error = ref(null);

const showModal = ref(false);
const modalMode = ref(null);
const selectedComplaint = ref(null);

const fetchComplaints = async () => {
  loading.value = true;
  error.value = null;
  const {
    success,
    data,
    error: err,
  } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/complaints"
  );
  if (success) complaints.value = data.data.data;
  else error.value = err || "Failed to load complaints.";
  loading.value = false;
};

const onResolveComplaint = (complaint) => {
  selectedComplaint.value = complaint;
  modalMode.value = "resolve";
  showModal.value = true;
};

const submitResolution = async () => {
  const payload = {
    resolution: selectedComplaint.value.resolution,
    status: "resolved",
  };

  const { success, error: err } = await store.dispatch("makePostRequest", {
    url: store.state.server + `api/complaints/${selectedComplaint.value.id}`,
    data: payload,
  });

  if (success) {
    selectedComplaint.value.status = "resolved";
    selectedComplaint.value.resolved_at = new Date().toISOString();
    selectedComplaint.value.resolved_by = store.state.user.id;
    closeModal();
    fetchComplaints();
  } else {
    error.value = err || "Failed to resolve complaint.";
  }
};

const onDeleteComplaint = (complaint) => {
  selectedComplaint.value = complaint;
  modalMode.value = "confirm"; // Set modal to confirmation mode
  showModal.value = true; // Show modal
};

const confirmDelete = async () => {
  const { success, error: err } = await store.dispatch(
    "makeDeleteRequest",
    store.state.server + `api/complaints/${selectedComplaint.value.id}`
  );
  if (success) {
    fetchComplaints();
    closeModal(); // Close the modal after deletion
  } else {
    error.value = err || "Failed to delete complaint.";
  }
};

const onViewComplaint = (complaint) => {
  selectedComplaint.value = complaint;
  modalMode.value = "view";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedComplaint.value = null;
  modalMode.value = null;
};

onMounted(() => {
  fetchComplaints();
});
</script>

<style scoped>
.complaints-management {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 0.75rem;
  margin-top: 1rem;
  color: var(--color-text);
}
h2 {
  margin-bottom: 1rem;
  color: var(--color-primary);
}
.loading {
  color: var(--color-muted);
  font-style: italic;
}
.error {
  color: #e74c3c;
  margin-bottom: 1rem;
}
.submit-btn {
  background: var(--gradient-primary);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
