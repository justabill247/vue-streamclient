<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <div class="w-full flex justify-between items-start gap-4">
      <div>
        <h1 class="text-2xl font-bold text-spotify-text-primary">Home</h1>
        <p class="text-sm text-spotify-text-secondary">Quick access to your latest recordings and upcoming activity.</p>
      </div>
      <div class="flex flex-col text-right pt-1">
        <span class="text-xs text-spotify-text-disabled">disk space graph</span>
      </div>
    </div>

    <section class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-spotify-text-primary">Recent Recordings</h2>
          <p class="text-xs text-spotify-text-secondary mt-1">The most recent recordings across every stream.</p>
        </div>
        <button
          v-if="recentRecordings.length > initialVisibleCount"
          type="button"
          class="secondary-action px-3 py-2 rounded-lg text-sm font-semibold transition active:scale-95"
          @click="toggleExpanded"
        >
          {{ isExpanded ? "Show Less" : `Show ${recentRecordings.length - initialVisibleCount} More` }}
        </button>
      </div>

      <div v-if="loadingRecent" class="text-sm text-spotify-text-secondary">Loading recent recordings...</div>
      <div v-else-if="recentRecordings.length === 0" class="rounded-xl border border-dashed border-spotify-border bg-spotify-bg-tertiary p-4 text-sm text-spotify-text-secondary">
        No recordings yet.
      </div>
      <div v-else class="grid grid-cols-1 gap-2">
        <RecordingListItem
          v-for="recording in visibleRecentRecordings"
          :key="recording.id"
          :recording="recording"
          :subtitle="recording.stream_name"
          :logo-url="recording.logo_url"
          @play="playRecording"
        />
      </div>
    </section>

    <section class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
      <div>
        <h2 class="text-lg font-semibold text-spotify-text-primary">Upcoming Recordings</h2>
        <p class="text-xs text-spotify-text-secondary mt-1">This section will use a dedicated backend endpoint when it is ready.</p>
      </div>

      <div class="placeholder-panel rounded-xl border border-spotify-border p-4">
        <div class="text-sm font-semibold text-spotify-text-primary">Coming later</div>
        <div class="text-xs text-spotify-text-disabled mt-1">Upcoming scheduled runs will appear here once the backend exposes them.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { usePlayerStore } from "../stores/player";
import { useRecordingStatus } from "../composables/useRecordingStatus";
import RecordingListItem from "../components/RecordingListItem.vue";

const player = usePlayerStore();
const { activeRecordingCount } = useRecordingStatus();

const recentRecordings = ref([]);
const loadingRecent = ref(true);
const isExpanded = ref(false);
const initialVisibleCount = 3;

const visibleRecentRecordings = computed(() => {
  return isExpanded.value
    ? recentRecordings.value
    : recentRecordings.value.slice(0, initialVisibleCount);
});

async function fetchRecentRecordings() {
  try {
    loadingRecent.value = true;
    const response = await fetch("/api/recordings");
    const data = await response.json();

    recentRecordings.value = [...data].sort((left, right) => {
      return new Date(right.start_time).getTime() - new Date(left.start_time).getTime();
    });
  } catch (error) {
    console.error("Error loading recent recordings:", error);
    recentRecordings.value = [];
  } finally {
    loadingRecent.value = false;
  }
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function playRecording(recording) {
  if (!recording.file_path) {
    return;
  }

  const filename = recording.file_path.split(/[\\/]/).pop();
  player.playTrack({
    id: recording.id,
    name: recording.name,
    url: `${import.meta.env.VITE_API_BASE_URL}/audio/${filename}`,
    logo_url: recording.logo_url,
    recordedAt: recording.start_time,
  });
}

watch(activeRecordingCount, async (nextCount, previousCount) => {
  if (nextCount !== previousCount) {
    await fetchRecentRecordings();
  }
});

onMounted(async () => {
  await fetchRecentRecordings();
});
</script>

<style scoped>
.secondary-action {
  background-color: rgba(15, 23, 42, 0.7);
  color: rgb(241, 245, 249);
  border: 1px solid rgba(71, 85, 105, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.secondary-action:hover {
  background-color: rgba(30, 41, 59, 0.95);
  border-color: rgba(100, 116, 139, 0.9);
}

.placeholder-panel {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.46) 0%, rgba(17, 24, 39, 0.72) 100%);
}
</style>
