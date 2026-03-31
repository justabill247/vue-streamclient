<template>
  <div class="p-4 space-y-2">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Title -->
      <div class="flex justify-between items-center mb-6">
        <router-link to="/schedule" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Back">
          <ArrowLeftIcon class="w-6 h-6" />
        </router-link>
        <h1 class="flex items-center text-2xl font-bold text-spotify-text-primary flex-1 mx-4">{{ schedule.name }}</h1>
        <button
          @click="showDeleteDialog = true"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition active:scale-95"
        >
          Delete Schedule
        </button>
      </div>

      <!-- Stream Info -->
      <div
        v-if="schedule.stream"
        class="flex items-center mb-6 p-4 bg-spotify-bg-card rounded-lg border border-spotify-border hover:border-spotify-text-secondary transition"
      >
        <img
          :src="getFullUrl(schedule.stream.logo_url)"
          alt="logo"
          class="w-16 h-16 rounded-md mr-4 border border-spotify-border"
        />
        <div>
          <div class="text-lg font-semibold text-spotify-text-primary">{{ schedule.stream.name }}</div>
        </div>
      </div>

      <!-- Schedule Details -->
      <div class="mb-6 bg-spotify-bg-card p-4 rounded-lg border border-spotify-border">
        <p class="text-spotify-text-primary mb-2"><strong>Cron:</strong> <code class="text-spotify-text-secondary">{{ schedule.cron }}</code></p>
        <p class="text-spotify-text-primary"><strong>Duration:</strong> <span class="text-spotify-text-secondary">{{ schedule.duration }}</span></p>
      </div>

      <!-- Recordings List -->
      <h2 class="text-2xl font-bold mb-4 text-spotify-text-primary">Recordings</h2>
      <div v-if="!schedule.recordings || schedule.recordings.length === 0">
        <p class="text-spotify-text-secondary">No recordings yet</p>
      </div>
      <div
        v-for="rec in schedule.recordings"
        :key="rec.id"
        class="p-3 bg-spotify-bg-card hover:bg-spotify-bg-tertiary rounded-lg mb-3 border border-spotify-border hover:border-spotify-text-secondary transition"
      >
        <div class="font-semibold text-spotify-text-primary">{{ rec.name }}</div>
        <div class="text-sm text-spotify-text-secondary">
          {{ new Date(rec.start_time).toLocaleString() }}
        </div>
        <div v-if="rec.duration" class="text-sm text-spotify-text-disabled">
          Duration: {{ Math.floor(rec.duration / 60) }}m {{ rec.duration % 60 }}s
        </div>
        <button 
          v-if="rec.file_path"
          class="mt-2 bg-spotify-green hover:bg-spotify-green-bright text-black px-3 py-1 rounded-lg text-sm transition font-semibold active:scale-95"
          @click="playRecording(rec)"
        >
          Play
        </button>
      </div>

      <!-- Delete Dialog -->
      <transition name="modal">
        <div
          v-if="showDeleteDialog"
          class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          <div class="bg-spotify-bg-secondary p-6 rounded-lg shadow-lg border border-spotify-border max-w-md w-full">
            <h2 class="text-2xl font-bold mb-4 text-spotify-text-primary">Confirm Delete</h2>
            <p class="text-spotify-text-secondary mb-6">Are you sure you want to delete this schedule?</p>
            <div class="flex gap-3">
              <button
                @click="deleteSchedule(schedule.id, false)"
                class="flex-1 bg-spotify-green hover:bg-spotify-green-bright text-black px-4 py-2 rounded-lg font-semibold transition active:scale-95"
              >
                Keep Recordings
              </button>
              <button
                @click="deleteSchedule(schedule.id, true)"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition active:scale-95"
              >
                Delete Recordings
              </button>
              <button
                @click="showDeleteDialog = false"
                class="flex-1 bg-spotify-bg-tertiary hover:bg-spotify-bg-card text-spotify-text-primary px-4 py-2 rounded-lg font-semibold transition border border-spotify-border active:scale-95"
              >
                Cancel
              </button>
            </div>
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
