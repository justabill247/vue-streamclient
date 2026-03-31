<template>
  <div class="bg-gray-900 text-white px-4 py-2 flex items-center justify-between shadow-md rounded-t-md bottom-18">
    <!-- Track Info -->
    <div class="flex items-center gap-3">
      <img
        v-if="currentTrack?.logo_url"
        :src="getFullUrl(currentTrack?.logo_url)"
        alt="Cover"
        class="w-12 h-12 rounded-sm object-cover"
      />
      <div class="flex flex-col">
        <span class="font-semibold truncate max-w-xs">
          {{ currentTrack?.name || "Nothing playing" }}
        </span>
        <span class="text-gray-400 text-xs truncate max-w-xs">
          {{ currentTrack?.description || "" }}
        </span>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4">
      <button @click="togglePlay" class="text-white text-2xl">
        <PlayIcon v-if="!isPlaying" class="w-6 h-6"/>
        <PauseIcon v-else class="w-6 h-6"/>
      </button>
      <span v-if="currentTrack" class="text-xs text-gray-400 whitespace-nowrap">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
    </div>
  </div>

  <!-- Progress Bar -->
  <div v-if="currentTrack" class="h-1 bg-gray-700">
    <div
      class="h-1 bg-green-500 transition-all duration-200"
      :style="{ width: progress + '%' }"
    ></div>
  </div>

  <!-- Hidden Native Audio Player Element -->
  <audio
    ref="audioEl"
    :src="currentTrack?.url"
    @timeupdate="updateProgress"
    @ended="onEnded"
  ></audio>
</template>

<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { usePlayerStore } from "../stores/player";
import { PlayIcon, PauseIcon } from "@heroicons/vue/24/outline";
import { getFullUrl } from "../utils/api";

const playerStore = usePlayerStore();
const audioEl = ref(null);
const progress = ref(0);
const currentTime = ref(0);
const duration = ref(0);

const currentTrack = computed(() => playerStore.currentTrack);
const isPlaying = computed(() => playerStore.isPlaying);

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const togglePlay = () => {
  if (!currentTrack.value) return;
  if (audioEl.value.paused) {
    audioEl.value.play();
  } else {
    audioEl.value.pause();
  }
};

const updateProgress = () => {
  if (!audioEl.value) return;
  currentTime.value = audioEl.value.currentTime;
  duration.value = audioEl.value.duration;
  progress.value = (audioEl.value.currentTime / audioEl.value.duration) * 100;
};

const onEnded = () => {
  playerStore.setPlaying(false);
  progress.value = 0;
  currentTime.value = 0;
};

// watch for changes to current track
watch(currentTrack, async (newTrack) => {
  if(!newTrack || !audioEl.value) return

  // bugfix: wait for dom to update
  await nextTick();

  // load and play the track, update store
  audioEl.value.load()
  audioEl.value.play().then(() =>{
    playerStore.setPlaying = true;
  }).catch((err) => {
    console.warn("play failed:", err)
  })
});
</script>

<style scoped>
/* optional scrollbar fix for mobile */
audio {
  display: none;
}
</style>
