<template>
  <div class="p-4 space-y-2">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Title -->
      <div class="flex justify-between items-center">
        <router-link to="/schedule" class="text-white w-8 h-8">
          <ArrowLeftIcon />
        </router-link>
        <h1 class="flex items-center text-2xl font-bold ml-4 w-full">{{ schedule.name }}</h1>
        <button
          @click="showDeleteDialog = true"
          class="bg-red-600 p-2 rounded-sm"
        >
          Delete Schedule
        </button>
      </div>

      <!-- Stream Info -->
      <div
        v-if="schedule.stream"
        class="flex items-center mb-6 p-4 bg-gray-800 rounded-lg"
      >
        <img
          :src="getFullUrl(schedule.stream.logo_url)"
          alt="logo"
          class="w-14 h-14 rounded mr-4"
        />
        <div>
          <div class="text-lg font-semibold">{{ schedule.stream.name }}</div>
        </div>
      </div>

      <!-- Schedule Details -->
      <div class="mb-6">
        <p><strong>Cron</strong> {{ schedule.cron }}</p>
        <p><strong>Duration</strong> {{ schedule.duration }}</p>
      </div>

      <!-- Recordings List -->
      <h2 class="text-xl font-bold mb-2">Recordings</h2>
      <div v-if="!schedule.recordings || schedule.recordings.length === 0">
        <p class="text-gray-400">No recordings yet</p>
      </div>
      <div
        v-for="rec in schedule.recordings"
        :key="rec.id"
        class="p-3 bg-gray-900 rounded-lg mb-3"
      >
        <div class="font-semibold">{{ rec.name }}</div>
        <div class="text-sm text-gray-400">
          {{ new Date(rec.start_time).toLocaleString() }}
        </div>
        <div v-if="rec.duration" class="text-sm text-gray-500">
          Duration: {{ Math.floor(rec.duration / 60) }}m {{ rec.duration % 60 }}s
        </div>
        <button 
          v-if="rec.file_path"
          class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
          @click="playRecording(rec)"
        >
          Play
        </button>
      </div>

      <!-- Delete Dialog -->
      <transition name="modal">
        <div
          v-if="showDeleteDialog"
          class="fixed inset-0 bg-black opacity-50 flex items-center justify-center"
        >
          <div class="bg-white p-4 rounded-lg shadow-lg">
            <h2 class="text-xl font-bold mb-3">Confirm Delete</h2>
            <p>Are you sure you want to delete this schedule?</p>
            <button
              @click="deleteSchedule(schedule.id, false)"
              class="bg-green-600 p-2 rounded-sm mr-2"
            >
              Keep Recordings
            </button>
            <button
              @click="deleteSchedule(schedule.id, true)"
              class="bg-red-600 p-2 rounded-sm"
            >
              Delete Recordings
            </button>
            <button
              @click="showDeleteDialog = false"
              class="bg-gray-300 p-2 rounded-sm ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import router from "../router";
import { usePlayerStore } from "../stores/player";
import { getFullUrl } from "../utils/api";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const player = usePlayerStore();
const showDeleteDialog = ref(false);
const schedule = ref(null);
const loading = ref(true);

onMounted(async () => {
  const id = route.params.id;
  const res = await fetch(`/api/schedule/${id}/details`);
  schedule.value = await res.json();
  loading.value = false;
});

async function deleteSchedule(id, deleteRecordings) {
  if (
    !confirm(
      `Are you sure you want to delete this schedule? Recordings will be ${!deleteRecordings ? "kept" : "deleted"}.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/schedule/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deleteRecordings }),
    });

    if (response.ok) {
      alert(`Schedule deleted.`);
      showDeleteDialog.value = false;
      router.push("/schedule");
    } else {
      const result = await response.json();
      alert(
        result.message || `Failed to delete schedule: ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error deleting schedule:", error);
    alert("Failed to delete schedule.");
  }
}

function playRecording(recording) {
  if (recording.file_path) {
    const filename = recording.file_path.split(/[\\/]/).pop();
    player.playTrack({
      id: recording.id,
      name: recording.name,
      url: `${import.meta.env.VITE_API_BASE_URL}/audio/${filename}`,
      description: `Recorded on ${new Date(recording.start_time).toLocaleString()}`,
      logo_url: schedule.value?.stream?.logo_url,
    });
  }
}
</script>
