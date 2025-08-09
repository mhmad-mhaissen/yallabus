import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/CSS/main.css";
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 800, // animation duration
  once: true, // animate only once
});

router.afterEach(() => {
  AOS.refresh();
});

createApp(App).use(store).use(router).mount("#app");
