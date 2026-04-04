<template>
  <div class="p-4 space-y-4">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div class="flex items-start gap-3 mb-4">
        <router-link to="/schedule" class="text-spotify-text-primary hover:text-spotify-green transition p-1 mt-1" title="Back">
          <ArrowLeftIcon class="w-6 h-6" />
        </router-link>
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-spotify-text-primary truncate">{{ schedule.name }}</h1>
          <div v-if="schedule.stream" class="flex items-center gap-2 mt-1.5 min-w-0">
            <img
              v-if="schedule.stream.logo_url"
              :src="getFullUrl(schedule.stream.logo_url)"
              alt="Stream logo"
              class="w-5 h-5 rounded-sm object-cover border border-spotify-border shrink-0"
            />
            <span class="text-base text-spotify-text-secondary truncate">{{ schedule.stream.name }}</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap mt-1">
            <span class="text-sm text-spotify-text-secondary px-2 py-0.5 rounded-full border border-spotify-border bg-spotify-bg-card leading-none">
              {{ scheduleTypeLabel }}
            </span>
            <p class="text-sm text-spotify-text-secondary">
              {{ scheduleSummary }}
              <span class="text-spotify-text-disabled"> for {{ scheduleDuration }}</span>
            </p>
          </div>
        </div>
        <button
          @click="showDeleteDialog = true"
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition active:scale-95 shrink-0"
        >
          Delete
        </button>
      </div>

      <section class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
        <div>
          <h2 class="text-2xl font-bold text-spotify-text-primary">Recordings</h2>
        </div>

        <div v-if="!schedule.recordings || schedule.recordings.length === 0">
          <p class="text-xs text-spotify-text-secondary mt-1 mb-2">Recordings created by this schedule will appear here.</p>
          <p class="text-spotify-text-secondary">No recordings yet</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-2">
          <RecordingListItem
            v-for="rec in schedule.recordings"
            :key="rec.id"
            :recording="rec"
            :logo-url="schedule.stream?.logo_url"
            @play="playRecording"
          />
        </div>
      </section>

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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import router from "../router";
import { usePlayerStore } from "../stores/player";
import { getFullUrl } from "../utils/api";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { useRecordingStatus } from "../composables/useRecordingStatus";
import RecordingListItem from "../components/RecordingListItem.vue";
import cronstrue from "cronstrue";
import { formatTimeHrsMins } from "../utils/time";

const route = useRoute();
const player = usePlayerStore();
const showDeleteDialog = ref(false);
const schedule = ref(null);
const loading = ref(true);
const { schedules, fetchScheduleState, scheduleStateLoaded } = useRecordingStatus();
const scheduleTypeLabel = computed(() => (schedule.value?.oneShot ? "One-Time" : "Recurring"));
const scheduleSummary = computed(() => {
  if (!schedule.value?.cron) return "No schedule configured";

  try {
    return cronstrue.toString(schedule.value.cron);
  } catch {
    return schedule.value.cron;
  }
});
const scheduleDuration = computed(() => {
  if (typeof schedule.value?.duration !== "number") return "Unknown";
  return formatTimeHrsMins(schedule.value.duration);
});

watch(schedules, (nextSchedules) => {
  if (loading.value || !schedule.value) {
    return;
  }

  const stillExists = nextSchedules.some((item) => String(item.id) === String(route.params.id));
  if (!stillExists) {
    router.push("/schedule");
  }
});

onMounted(async () => {
  if (!scheduleStateLoaded.value) {
    fetchScheduleState();
  }

  const id = route.params.id;
  const res = await fetch(`/api/schedule/${id}/details`);
  if (!res.ok) {
    loading.value = false;
    router.push("/schedule");
    return;
  }

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
      logo_url: schedule.value?.stream?.logo_url,
      recordedAt: recording.start_time,
    });
  }
}
</script>
