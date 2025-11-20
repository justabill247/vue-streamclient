<template>
  <div class="p-4 space-y-3">
    <h1 class="text-xl font-semibold mb-3">Recordings</h1>

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
            class="text-spotify-green text-lg"
            title="Play recording"
          >
            ▶️
          </button>

          <button
            @click="downloadRecording(rec)"
            class="text-gray-400 hover:text-white text-lg"
            title="Download"
          >
            ⬇️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePlayerStore } from "../stores/player";
import { useStreamStore } from "../stores/streams";
import dayjs from "dayjs";
const player = usePlayerStore();
const streams = useStreamStore();

const recordings = ref([]);
const loading = ref(true);

async function fetchRecordings() {
  try {
    const res = await fetch("/api/recordings");
    const data = await res.json();
    recordings.value = data;
    console.log("rd", recordings.value)
  } catch (err) {
    console.error("Error loading recordings:", err);
  } finally {
    loading.value = false;
  }
}

function playRecording(rec) {
  const filename = rec.file_path.match(/[^\\]+$/);
  const url = `${import.meta.env.VITE_API_BASE_URL}/audio/${filename}`;
  console.log('trying to play', url)
  player.playTrack({
    id: rec.id,
    name: rec.name,
    url: url,
    logo_url: rec.logo_url
  }); //single item playlist 


}

function downloadRecording(rec) {
  window.open(rec.url || `/audio/${rec.filename}`, "_blank");
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

onMounted(fetchRecordings);
</script>
