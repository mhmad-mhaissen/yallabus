import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "@/views/Auth/LoginView.vue";
import RegisterView from "@/views/Auth/RegisterView.vue";
import EmailVerification from "@/views/Auth/EmailVerification.vue";
import DashboardView from "@/views/Dashboards/DashboardView.vue";
import ShowEditProfile from "@/views/Dashboards/ProfileSettings/ShowEditProfile.vue";
import ChangePassword from "@/views/Dashboards/ProfileSettings/ChangePassword.vue";
import UsersManagement from "@/views/Dashboards/AdminDashboard/UsersManagement.vue";
import RolesManagement from "@/views/Dashboards/AdminDashboard/RolesManagement.vue";
import PermissionsManagement from "@/views/Dashboards/AdminDashboard/PermissionsManagement.vue";
import CurrencyManagement from "@/views/Dashboards/AdminDashboard/CurrencyManagement.vue";
import CountriesManagement from "@/views/Dashboards/AdminDashboard/CountriesManagement.vue";
import CitiesManagement from "@/views/Dashboards/AdminDashboard/CitiesManagement.vue";
import DriversView from "@/views/Dashboards/CompanyDashboard/DriversView.vue";
import BusesView from "@/views/Dashboards/CompanyDashboard/BusesView.vue";
import SeatsView from "@/views/Dashboards/CompanyDashboard/SeatsView.vue";
import TripsView from "@/views/Dashboards/CompanyDashboard/TripsView.vue";
import CheckTrips from "@/views/Trips/CheckTrips.vue";
import TripBook from "@/views/Trips/TripBook.vue";
import WalletView from "@/views/Wallet/WalletView.vue";

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
  {
    path: "/roles",
    name: "RolesManagement",
    component: RolesManagement,
  },
  {
    path: "/permissions",
    name: "PermissionsManagement",
    component: PermissionsManagement,
  },
  {
    path: "/currencies",
    name: "CurrencyManagement",
    component: CurrencyManagement,
  },
  {
    path: "/countries",
    name: "CountriesManagement",
    component: CountriesManagement,
  },
  {
    path: "/cities",
    name: "CitiesManagement",
    component: CitiesManagement,
  },
  {
    path: "/drivers",
    name: "DriversView",
    component: DriversView,
  },
  {
    path: "/buses",
    name: "BusesView",
    component: BusesView,
  },
  {
    path: "/seats",
    name: "SeatsView",
    component: SeatsView,
  },
  {
    path: "/trips",
    name: "TripsView",
    component: TripsView,
  },
  {
    path: "/check-trips",
    name: "CheckTrips",
    component: CheckTrips,
  },
  {
    path: "/trip-info",
    name: "TripBook",
    component: TripBook,
  },
  {
    path: "/my-wallet",
    name: "WalletView",
    component: WalletView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
