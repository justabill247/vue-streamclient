<template>
  <div class="p-4 space-y-3">
    <div class="flex justify-between items-center mb-3">
      <h1 class="text-2xl font-bold text-spotify-text-primary">Recordings</h1>
      <button
        @click="showRecordModal = true"
        class="secondary-action submit-action px-4 py-2 rounded-lg transition font-semibold active:scale-95"
        title="Record Now"
      >
        Record Now
      </button>
    </div>

    <div v-if="loading" class="text-spotify-text-secondary text-center py-10">
      Loading recordings...
    </div>

    <div v-else-if="recordings.length === 0" class="text-spotify-text-secondary text-center py-10">
      No recordings found.
    </div>

    <div v-else class="grid grid-cols-1 gap-2">
      <RecordingListItem
        v-for="rec in recordings"
        :key="rec.id"
        :recording="rec"
        :subtitle="rec.stream_name"
        :logo-url="rec.logo_url"
        :show-download="true"
        :show-delete="true"
        @play="playRecording"
        @download="downloadRecording"
        @delete="deleteRecording"
      />
    </div>

    <!-- Record Now Modal -->
    <transition name="modal">
      <div
        v-if="showRecordModal"
        class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        <div class="bg-spotify-bg-secondary p-6 rounded-xl shadow-lg border border-spotify-border max-w-2xl w-full">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-spotify-text-primary">Record Now</h2>
            <p class="text-sm text-spotify-text-secondary mt-1">Start a manual recording from a saved stream or a one-off URL.</p>
          </div>

          <div class="space-y-6">
            <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
              <div>
                <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Recording Name</label>
                <input
                  v-model="recordForm.name"
                  type="text"
                  placeholder="e.g. Friday Mix Test"
                  class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-spotify-text-primary mb-2">Source</label>
                <div class="schedule-type-shell grid grid-cols-2 gap-2 rounded-lg bg-spotify-bg-tertiary p-1 border border-spotify-border">
                  <button
                    type="button"
                    class="schedule-type-button px-4 py-2 rounded-md text-sm font-semibold transition"
                    :class="recordForm.mode === 'preset' ? 'schedule-type-button-active text-spotify-green' : 'text-spotify-text-secondary hover:text-spotify-text-primary'"
                    @click="recordForm.mode = 'preset'"
                  >
                    From List
                  </button>
                  <button
                    type="button"
                    class="schedule-type-button px-4 py-2 rounded-md text-sm font-semibold transition"
                    :class="recordForm.mode === 'custom' ? 'schedule-type-button-active text-spotify-green' : 'text-spotify-text-secondary hover:text-spotify-text-primary'"
                    @click="recordForm.mode = 'custom'"
                  >
                    Custom URL
                  </button>
                </div>
              </div>

              <div v-if="recordForm.mode === 'preset'">
                <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Saved Stream</label>
                <select
                  v-model.number="recordForm.streamId"
                  class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                  required
                >
                  <option value="" class="bg-spotify-bg-secondary">Select a stream...</option>
                  <option v-for="s in allStreams" :key="s.id" :value="s.id" class="bg-spotify-bg-secondary">
                    {{ s.name }}
                  </option>
                </select>
              </div>

              <div v-else>
                <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Custom Stream URL</label>
                <input
                  v-model="recordForm.customUrl"
                  type="url"
                  placeholder="https://example.com/stream"
                  class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                  required
                />
                <p class="mt-2 text-xs text-spotify-text-disabled">Use this for a source you do not want to save as a stream.</p>
              </div>
            </div>

            <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
              <div>
                <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Duration</label>
                <div class="grid grid-cols-2 gap-3">
                  <select
                    v-model.number="durationHours"
                    class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                  >
                    <option v-for="hour in 24" :key="hour - 1" :value="hour - 1" class="bg-spotify-bg-secondary">
                      {{ hour - 1 }} hr
                    </option>
                  </select>
                  <select
                    v-model.number="durationMinutes"
                    class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                  >
                    <option v-for="minute in 60" :key="minute - 1" :value="minute - 1" class="bg-spotify-bg-secondary">
                      {{ minute - 1 }} min
                    </option>
                  </select>
                </div>
                <p class="text-xs text-spotify-text-disabled mt-2">Total duration: {{ durationLabel }}</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="startRecording"
                :disabled="isRecording"
                class="flex-1 bg-spotify-green hover:bg-spotify-green-bright text-black font-semibold py-3 px-4 rounded-lg transition active:scale-95 disabled:bg-spotify-bg-card disabled:text-spotify-text-disabled disabled:border disabled:border-spotify-border"
              >
                {{ isRecording ? "Recording..." : "Start Recording" }}
              </button>
              <button
                @click="showRecordModal = false"
                :disabled="isRecording"
                class="flex-1 secondary-action px-4 py-3 rounded-lg transition font-semibold active:scale-95 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { usePlayerStore } from "../stores/player";
import { useRecordingStatus } from "../composables/useRecordingStatus";
import RecordingListItem from "../components/RecordingListItem.vue";

const player = usePlayerStore();
const { activeRecordingCount } = useRecordingStatus();

const recordings = ref([]);
const allStreams = ref([]);
const loading = ref(true);
const showRecordModal = ref(false);
const isRecording = ref(false);
const durationHours = ref(0);
const durationMinutes = ref(5);

const durationSeconds = computed(() => durationHours.value * 3600 + durationMinutes.value * 60);
const durationLabel = computed(() => {
  const parts = [];

  if (durationHours.value > 0) {
    parts.push(`${durationHours.value} hr`);
  }

  if (durationMinutes.value > 0 || parts.length === 0) {
    parts.push(`${durationMinutes.value} min`);
  }

  return parts.join(" ");
});

const recordForm = ref({
  name: "",
  mode: "preset", // 'preset' or 'custom'
  streamId: "",
  customUrl: "",
});

async function fetchRecordings() {
  try {
    const res = await fetch("/api/recordings");
    const data = await res.json();
    recordings.value = data;
    console.log("[RecordingsView] Loaded recordings:", data.length);
  } catch (err) {
    console.error("Error loading recordings:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchStreams() {
  try {
    const res = await fetch("/api/streams");
    allStreams.value = await res.json();
  } catch (err) {
    console.error("Error loading streams:", err);
  }
}

// Watch for changes in active recording count to refresh recordings
watch(activeRecordingCount, async (newCount, oldCount) => {
  console.log(`[RecordingsView] Recording count changed: ${oldCount} → ${newCount}`);
  
  // Refresh recordings list when count changes
  if (newCount !== oldCount) {
    await fetchRecordings();
  }
});

async function startRecording() {
  // Validation
  if (!recordForm.value.name || !recordForm.value.name.trim()) {
    alert("Please enter a recording name");
    return;
  }

  if (durationSeconds.value <= 0) {
    alert("Duration must be greater than 0");
    return;
  }

  if (durationSeconds.value > 3600) {
    alert("Maximum duration is 1 hour (3600 seconds)");
    return;
  }

  let url = "";
  let streamId = null;

  if (recordForm.value.mode === "preset") {
    if (!recordForm.value.streamId) {
      alert("Please select a stream");
      return;
    }
    streamId = recordForm.value.streamId;
  } else {
    if (!recordForm.value.customUrl) {
      alert("Please enter a stream URL");
      return;
    }
    url = recordForm.value.customUrl;
  }

  try {
    isRecording.value = true;

    const response = await fetch("/api/recordings/record-now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: recordForm.value.name.trim(),
        streamId: streamId,
        url: url,
        duration: durationSeconds.value
      })
    });

    const result = await response.json();

    if (response.ok) {
      const refreshDelayMs = durationSeconds.value * 1000 + 1000;

      alert(`Recording started: ${recordForm.value.name.trim()} for ${durationLabel.value}.`);
      showRecordModal.value = false;
      
      // Reset form
      recordForm.value = {
        name: "",
        mode: "preset",
        streamId: "",
        customUrl: "",
      };
      durationHours.value = 0;
      durationMinutes.value = 5;

      // Refresh recordings after a delay
      setTimeout(() => {
        fetchRecordings();
      }, refreshDelayMs);
    } else {
      alert(result.error || "Failed to start recording");
    }
  } catch (err) {
    console.error("Error starting recording:", err);
    alert("Failed to start recording");
  } finally {
    isRecording.value = false;
  }
}

function playRecording(rec) {
  const filename = rec.file_path.match(/[^\\]+$/);
  const url = `${import.meta.env.VITE_API_BASE_URL}/audio/${filename}`;
  player.playTrack({
    id: rec.id,
    name: rec.name,
    url: url,
    logo_url: rec.logo_url,
    recordedAt: rec.start_time,
  });
}

function downloadRecording(rec) {
  window.open(rec.url || `/audio/${rec.filename}`, "_blank");
}

async function deleteRecording(rec) {
  if (!confirm(`Delete recording "${rec.name}"? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`/api/recordings/${rec.id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      console.log(`Deleted recording ${rec.id}`);
      await fetchRecordings();
    } else {
      const error = await response.json();
      alert(error.error || "Failed to delete recording");
    }
  } catch (err) {
    console.error("Error deleting recording:", err);
    alert("Failed to delete recording");
  }
}

onMounted(() => {
  fetchRecordings();
  fetchStreams();
});
</script>

<style scoped>
.schedule-type-shell {
  background-color: rgba(31, 41, 55, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.schedule-type-button {
  border: 1px solid transparent;
}

.schedule-type-button-active {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%);
  border-color: rgba(29, 185, 84, 0.55);
  box-shadow:
    inset 0 0 0 1px rgba(29, 185, 84, 0.18),
    0 0 0 1px rgba(29, 185, 84, 0.14),
    0 8px 20px rgba(0, 0, 0, 0.28);
}

.schedule-type-button:not(.schedule-type-button-active) {
  background-color: rgba(15, 23, 42, 0.45);
}

.schedule-type-button:not(.schedule-type-button-active):hover {
  background-color: rgba(51, 65, 85, 0.65);
}

.themed-native-control {
  color-scheme: dark;
  background-color: rgb(31, 41, 55);
  color: rgb(241, 245, 249);
}

.themed-native-control option,
.themed-native-control optgroup {
  background-color: rgb(15, 23, 42);
  color: rgb(241, 245, 249);
}

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
</style>
