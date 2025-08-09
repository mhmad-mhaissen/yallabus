<template>
  <div class="phone-input-wrapper">
    <div class="dropdown-wrapper" v-click-outside="closeDropdown">
      <div class="selected-code" @click.stop="toggleDropdown">
        <img :src="selectedCountry.flag" class="flag" />
        <span>{{ selectedCountry.dial_code }}</span>
        <span class="arrow">▼</span>
      </div>

      <div v-if="showDropdown" class="dropdown">
        <input
          type="text"
          v-model="search"
          class="search-input"
          placeholder="Search country..."
        />
        <div class="options">
          <div
            v-for="country in filteredCodes"
            :key="country.code"
            class="option"
            @click="selectCountry(country)"
          >
            <img :src="country.flag" class="flag" />
            <span>{{ country.name }} ({{ country.dial_code }})</span>
          </div>
        </div>
      </div>
    </div>

    <input
      v-model="phone"
      type="tel"
      class="phone-field"
      placeholder="Phone number"
    />
  </div>
</template>

<script setup>
import vClickOutside from "@/directives/clickOutside";
defineExpose({ directives: { clickOutside: vClickOutside } });
import { ref, computed, watch, onMounted } from "vue";
import countryCodes from "@/assets/Phone Codes/countryCodes.json";

const props = defineProps({
  codePhone: String,
  phone: String,
});

const emit = defineEmits(["update:codePhone", "update:phone"]);

const selectedCountry = ref(
  countryCodes.find((c) => c.code === "US") || countryCodes[0]
);
const phone = ref("");
const search = ref("");
const showDropdown = ref(false);

const closeDropdown = () => {
  showDropdown.value = false;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectCountry = (country) => {
  selectedCountry.value = country;
  showDropdown.value = false;
};

const filteredCodes = computed(() => {
  if (!search.value) return countryCodes;
  return countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.value.toLowerCase()) ||
      c.dial_code.includes(search.value)
  );
});

watch([selectedCountry, phone], () => {
  emit("update:codePhone", selectedCountry.value.dial_code);
  emit("update:phone", phone.value);
});

onMounted(() => {
  if (props.codePhone) {
    const match = countryCodes.find((c) => c.dial_code === props.codePhone);
    if (match) selectedCountry.value = match;
  }
  if (props.phone) phone.value = props.phone;
});
</script>

<style scoped>
.phone-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.dropdown-wrapper {
  position: relative;
  width: 180px;
}

.selected-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--color-muted);
  border-radius: 8px;
  cursor: pointer;
  background: white;
  background: var(--color-bg);
  color: var(--color-text);
}

.flag {
  width: 20px;
  height: 14px;
  object-fit: contain;
}

.arrow {
  margin-left: auto;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-muted);
  border-radius: 6px;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}

.search-input {
  width: 100%;
  padding: 0.4rem;
  border-bottom: 1px solid #ddd;
  font-size: 0.9rem;
}

.options {
  display: flex;
  flex-direction: column;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  background: var(--color-bg);
  color: var(--color-text);
}

.option:hover {
  background-color: var(--color-surface);
}

.phone-field {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-muted);
  border-radius: 8px;
  font-size: 1rem;
}
</style>
