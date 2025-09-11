<template>
  <div class="wallet-container">
    <div class="payment-card">
      <h3 class="card-title">Make Payment</h3>

      <!-- Order Summary -->
      <div class="summary-card">
        <label class="form-label">Enter Quantity</label>
        <input
          v-model.number="amountInput"
          type="number"
          min="0"
          step="any"
          @input="recalculate"
          class="form-input"
          placeholder="Enter amount (local currency)"
        />

        <div class="summary-row">
          <span>Cash Value</span>
          <span class="summary-value">{{ formattedCash }}</span>
        </div>
        <div class="summary-row">
          <span>Dollar Value</span>
          <span class="summary-value">{{ formattedDollar }}</span>
        </div>
        <div class="exchange-rate">
          <span>Exchange rate (local → USD):</span>
          <span>{{ exchangeRate || "—" }}</span>
        </div>
      </div>

      <!-- Stripe Card -->
      <div class="stripe-card">
        <label class="form-label">Card</label>
        <div ref="cardElement" class="card-element"></div>
        <div v-if="cardError" class="card-error">{{ cardError }}</div>
      </div>

      <!-- Submit Button -->
      <button
        :disabled="processing || !stripeReady"
        @click="submitPayment"
        class="btn-submit"
      >
        {{ processing ? "Processing…" : "Submit Payment" }}
      </button>

      <!-- Feedback -->
      <div v-if="feedback" :class="feedbackClass" class="feedback">
        {{ feedback }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

const amountInput = ref(0);
const dollarValue = ref(0);
const cashValue = ref(0);
const exchangeRate = ref(0);
const processing = ref(false);
const feedback = ref("");
const cardError = ref("");
const stripeReady = ref(false);

const cardElement = ref(null);
let stripe = null;
let elements = null;
let card = null;

const formattedDollar = computed(
  () => `$${Number(dollarValue.value || 0).toFixed(5)}`
);
const formattedCash = computed(
  () => `${Number(cashValue.value || 0).toFixed(5)} Cash`
);
const feedbackClass = computed(() =>
  feedback.value.includes("success") ? "feedback-success" : "feedback-error"
);

// Calculation logic
function recalculate() {
  const inputVal = Number(amountInput.value) || 0;
  const rate = Number(exchangeRate.value) || 11000; // fallback if rate not loaded
  const dollarVal = inputVal / rate;
  const cashVal = dollarVal * 20;
  dollarValue.value = dollarVal;
  cashValue.value = cashVal;
}

// Load Stripe JS
function loadStripeJs() {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Initialize Stripe Elements
async function initStripeElements() {
  await loadStripeJs();
  const stripeKey =
    "pk_test_51RqU0RCXGJ4Ku7szgzsOenUQgwX3WtImCmQ4gpmqQooJThqis1mCVItnIYPugSgUKxqLdEZV530UsZ4WAEb8AqZO00rnGfIsnU";

  stripe = window.Stripe(stripeKey);
  elements = stripe.elements();
  card = elements.create("card", { hidePostalCode: false });
  card.mount(cardElement.value);
  card.on(
    "change",
    (ev) => (cardError.value = ev.error ? ev.error.message : "")
  );
  stripeReady.value = true;
}

// Fetch exchange rate from API
async function fetchExchangeRate() {
  const { success, data, error } = await store.dispatch(
    "makeGetRequest",
    store.state.server + "api/exchange-rate"
  );

  if (success) {
    // assuming API returns { rate: number }
    exchangeRate.value = Number(data || 0);
    recalculate();
  } else {
    console.error("Failed to fetch exchange rate:", error);
  }
}

// Submit Payment via Vuex
async function submitPayment() {
  if (!stripe || !card) {
    feedback.value = "Stripe not initialized";
    return;
  }

  processing.value = true;
  feedback.value = "";
  cardError.value = "";

  try {
    const result = await stripe.createToken(card);
    if (result.error) {
      cardError.value = result.error.message;
      processing.value = false;
      return;
    }

    const formData = new FormData();
    formData.append("stripeToken", result.token.id);
    formData.append("amount", Number(dollarValue.value).toFixed(5));

    const { success, data, error } = await store.dispatch("makePostRequest", {
      url: store.state.server + "api/paymant",
      data: formData,
    });

    if (success) {
      feedback.value = data.message || "Payment success";
      amountInput.value = 0;
      recalculate();
    } else {
      feedback.value = error || "Payment failed";
    }
  } catch (err) {
    console.error(err);
    feedback.value = "Unexpected error occurred.";
  } finally {
    processing.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchExchangeRate();
  recalculate();
  await initStripeElements();
});

onUnmounted(() => {
  try {
    if (card) card.unmount();
  } catch (e) {
    console.log(e);
  }
});
</script>

<style scoped>
/* same styles as before */
.wallet-container {
  background-color: var(--color-bg);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
}
.payment-card {
  background-color: var(--color-surface);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card-title {
  font-size: 1.6rem;
  font-weight: 600;
  text-align: center;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.summary-card {
  background-color: var(--section-overlay-color);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.form-input {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-muted);
  font-size: 1rem;
  width: 100%;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
}
.summary-value {
  font-weight: 700;
  color: var(--color-primary-dark);
}
.exchange-rate {
  font-size: 0.875rem;
  color: var(--color-muted);
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}
.stripe-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.stripe-card input {
  color: var(--color-text) !important;
}
.card-element {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-muted);
  background-color: var(--color-bg);
}
.card-error {
  color: #ff4d4f;
  font-size: 0.875rem;
}
.btn-submit {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  background: var(--gradient-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;
}
.btn-submit:hover:enabled {
  filter: brightness(1.1);
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.feedback {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}
.feedback-success {
  background-color: #d4edda;
  color: #155724;
}
.feedback-error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
