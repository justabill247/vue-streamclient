<template>
  <div class="p-4 space-y-3">
    <div class="flex justify-between items-center mb-3">
      <h1 class="text-xl font-semibold">Recordings</h1>
      <button
        @click="showRecordModal = true"
        class="bg-red-600 hover:bg-red-700 border border-gray-500 text-white font-semibold px-4 py-2 rounded-full transition flex items-center gap-2"
        title="Record Now"
      >
        
        Record Now
      </button>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-10">
      Loading recordings...
    </div>

    <div v-else-if="recordings.length === 0" class="text-gray-400 text-center py-10">
      No recordings found.
    </div>

    <div v-else class="grid grid-cols-1 gap-3">
      <div
        v-for="rec in recordings"
        :key="rec.id"
        class="bg-gray-800 rounded-xl p-3 flex items-center justify-between"
      >
        <div class="flex flex-col overflow-hidden">
          <span class="font-semibold truncate">{{ rec.name }}</span>
          <span class="text-xs text-gray-400 truncate">{{ rec.stream_name }}</span>
          <span class="text-xs text-gray-400 truncate">{{ formatDate(rec.start_time) }} for {{formatDuration(rec.duration)}}</span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="playRecording(rec)"
            class="text-spotify-green hover:text-green-400 transition"
            title="Play recording"
          >
            <PlayIcon class="w-5 h-5" />
          </button>

          <button
            @click="downloadRecording(rec)"
            class="text-gray-400 hover:text-white transition"
            title="Download"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
          </button>

          <button
            @click="deleteRecording(rec)"
            class="text-gray-400 hover:text-red-500 transition"
            title="Delete"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Record Now Modal -->
    <transition name="modal">
      <div
        v-if="showRecordModal"
        class="fixed inset-0 bg-black opacity-90 flex items-center justify-center z-50"
      >
        <div class="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4 text-white">Record Now</h2>

          <!-- Stream Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Stream</label>
            <div class="flex gap-2 mb-3">
              <button
                @click="recordForm.mode = 'preset'"
                :class="[
                  'flex-1 py-2 rounded-lg font-medium transition',
                  recordForm.mode === 'preset'
                    ? 'bg-spotify-green text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                From List
              </button>
              <button
                @click="recordForm.mode = 'custom'"
                :class="[
                  'flex-1 py-2 rounded-lg font-medium transition',
                  recordForm.mode === 'custom'
                    ? 'bg-spotify-green text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                Custom URL
              </button>
            </div>

            <!-- Stream Selection Dropdown -->
            <select
              v-if="recordForm.mode === 'preset'"
              v-model.number="recordForm.streamId"
              class="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 mb-4"
              required
            >
              <option value="">Select a stream...</option>
              <option v-for="s in allStreams" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>

            <!-- Custom URL Input -->
            <input
              v-else
              v-model="recordForm.customUrl"
              type="url"
              placeholder="Enter stream URL (e.g., https://example.com/stream)"
              class="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 mb-4"
              required
            />
          </div>

          <!-- Duration Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
            <input
              v-model.number="recordForm.duration"
              type="number"
              min="1"
              max="3600"
              placeholder="300"
              class="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2"
              required
            />
            <p class="text-xs text-gray-400 mt-1">Max 1 hour (3600 seconds)</p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="startRecording"
              :disabled="isRecording"
              class="flex-1 bg-spotify-green hover:bg-green-600 disabled:bg-gray-600 text-black font-semibold py-2 rounded-lg transition"
            >
              {{ isRecording ? "Recording..." : "Start Recording" }}
            </button>
            <button
              @click="showRecordModal = false"
              :disabled="isRecording"
              class="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { usePlayerStore } from "../stores/player";
import { useRecordingStatus } from "../composables/useRecordingStatus";
import { PlayIcon, ArrowDownTrayIcon, TrashIcon, StopIcon } from "@heroicons/vue/24/outline";
import dayjs from "dayjs";

const player = usePlayerStore();
const { activeRecordingCount } = useRecordingStatus();

const recordings = ref([]);
const allStreams = ref([]);
const loading = ref(true);
const showRecordModal = ref(false);
const isRecording = ref(false);

const recordForm = ref({
  mode: "preset", // 'preset' or 'custom'
  streamId: "",
  customUrl: "",
  duration: 300 // 5 minutes default
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
  if (!recordForm.value.duration || recordForm.value.duration <= 0) {
    alert("Duration must be greater than 0");
    return;
  }

  if (recordForm.value.duration > 3600) {
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
        streamId: streamId,
        url: url,
        duration: recordForm.value.duration
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(`Recording started! Recording for ${recordForm.value.duration} seconds.`);
      showRecordModal.value = false;
      
      // Reset form
      recordForm.value = {
        mode: "preset",
        streamId: "",
        customUrl: "",
        duration: 300
      };

      // Refresh recordings after a delay
      setTimeout(() => {
        fetchRecordings();
      }, recordForm.value.duration * 1000 + 1000);
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
    logo_url: rec.logo_url
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

function formatDate(dateString) {
  const day = dayjs(dateString).format("MM/DD/YYYY")
  const time = dayjs(dateString).format("h:mm A")
  return `${day} at ${time}`;
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
  } else {
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  }
}

onMounted(() => {
  fetchRecordings();
  fetchStreams();
});
</script>
