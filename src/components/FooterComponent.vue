<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Left: Logo + Info -->
      <div class="footer-section">
        <div class="footer-logo">
          <img src="@/assets/logo.png" alt="YallaBus Logo" />
          <span>YallaBus</span>
        </div>
        <p class="footer-desc">
          Smart, professional inter-governorate transport platform.
        </p>
      </div>

      <!-- Center: Navigation -->
      <div class="footer-section">
        <h4>Navigation</h4>
        <nav class="footer-nav">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/trips">Trips</RouterLink>
          <RouterLink to="/bookings">Bookings</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
        </nav>
      </div>

      <!-- Right: Contact / Social -->
      <div class="footer-section">
        <h4>Contact</h4>
        <p>Email: support@yallabus.com</p>
        <p>Phone: +963 912 345 678</p>
        <p>Address: Damascus, Syria</p>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      © {{ new Date().getFullYear() }} YallaBus. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
// No script needed for static footer (unless dynamic content is added)
</script>

<style scoped>
.footer {
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: 2rem 1.5rem 1rem;
  border-top: 1px solid var(--color-border);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.footer-container {
  max-width: 1200px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
}

.footer-section {
  flex: 1 1 200px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.footer-logo img {
  height: 150px;
}

.footer-desc {
  font-size: 0.95rem;
  line-height: 1.5;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
}

.footer-nav a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-nav a:hover {
  color: var(--color-accent);
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.85rem;
  color: var(--color-muted);
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
