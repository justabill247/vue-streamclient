<template>
  <div class="p-4 space-y-2">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Title -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold mb-4">{{ schedule.name }}</h1>
        <button @click="deleteSchedule(schedule.name)" class="bg-red-600 p-2 rounded-sm">
          Delete Schedule
        </button>
      </div>

      <!-- Stream Info -->
      <div
        v-if="schedule.stream"
        class="flex items-center mb-6 p-4 bg-gray-800 rounded-lg"
      >
        <img
          :src="schedule.stream.logo_url"
          alt="logo"
          class="w-14 h-14 rounded mr-4"
        />
        <div>
          <div class="text-lg font-semibold">{{ schedule.stream.name }}</div>
          <div class="text-sm text-gray-400">{{ schedule.stream.url }}</div>
        </div>
      </div>

      <!-- Schedule Details -->
      <div class="mb-6">
        <p><strong>Cron</strong>{{ schedule.cron }}</p>
        <p><strong>Duration</strong>{{ schedule.duration }}</p>
      </div>

      <!-- Recordings List -->
      <h2 class="text-xl font-bold mb-2">Recordings</h2>
      <div v-if="schedule.recordings.length === 0">
        <p class="text-gray-400">No recordings yet</p>
      </div>
      <div
        v-for="rec in schedule.recordings"
        :key="rec.id"
        class="p-3 bg-gray-900 rounded-lg mb-3"
      >
        <div class="font-semibold">{{ rec.name }}</div>
        <div class="text-sm text-gray-400">
          {{ rec.start_time }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { usePlayerStore } from "../stores/player";

const route = useRoute();
const player = usePlayerStore();

const schedule = ref(null);
const loading = ref(true);

onMounted(async () => {
  const id = route.params.id;
  const res = await fetch(`/api/schedule/${id}/details`);
  schedule.value = await res.json();
  loading.value = false;
});

async function deleteSchedule(name) {
  if (
    !confirm(
      "Are you sure you want to delete this schedule? Recordings will be kept."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/schedule/${name}`, { method: "DELETE" });
    const result = await response.json();

    alert(`Deleted scheudle.`);
  } catch (error) {
    console.error("Error deleting schedule:", error);
    alert("Failed to delete schedule.");
  }
}
</script>
