import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import StreamsView from "../views/StreamsView.vue";
import RecordingsView from "../views/RecordingsView.vue";
import ScheduleView from "../views/ScheduleView.vue";
import SettingsView from "../views/SettingsView.vue";
import AddScheduleView from "../views/AddScheduleView.vue";
import AddStreamView from "../views/AddStreamView.vue";
import ScheduleDetailsView from "../views/ScheduleDetailsView.vue";


const routes = [
  { path: "/", component: HomeView },
  { path: "/streams", component: StreamsView },
  { path: "/add-stream", component: AddStreamView },
  { path: "/schedule", component: ScheduleView },
  { path: "/add-schedule", component: AddScheduleView },
  { path: "/schedule/:id/details", name:"ScheduleDetails", component: ScheduleDetailsView, props: true},
  { path: "/recordings", component: RecordingsView },
  { path: "/settings", component: SettingsView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
