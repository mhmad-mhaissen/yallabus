import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "@/views/Auth/LoginView.vue";
import RegisterView from "@/views/Auth/RegisterView.vue";
import EmailVerification from "@/views/Auth/EmailVerification.vue";
import DashboardView from "@/views/Dashboards/DashboardView.vue";
import ShowEditProfile from "@/views/Dashboards/ProfileSettings/ShowEditProfile.vue";
import ChangePassword from "@/views/Dashboards/ProfileSettings/ChangePassword.vue";
import UsersManagement from "@/views/Dashboards/AdminDashboard/UsersManagement.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "LoginView",
    component: LoginView,
  },
  {
    path: "/register",
    name: "RegisterView",
    component: RegisterView,
  },
  {
    path: "/email-verification",
    name: "EmailVerification",
    component: EmailVerification,
  },
  {
    path: "/dashboard",
    name: "DashboardView",
    component: DashboardView,
  },
  {
    path: "/profile",
    name: "ShowEditProfile",
    component: ShowEditProfile,
  },
  {
    path: "/change-password",
    name: "ChangePassword",
    component: ChangePassword,
  },
  {
    path: "/users-management",
    name: "UsersManagement",
    component: UsersManagement,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
