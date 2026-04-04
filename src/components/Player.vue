<template>
  <div class="player-shell bg-spotify-bg-secondary text-spotify-text-primary border-t border-spotify-border shadow-lg">
    <div class="px-4 py-3 flex items-center justify-between">
      <!-- Track Info -->
      <div class="flex items-center gap-3 flex-1">
        <img
          v-if="currentTrack?.logo_url"
          :src="getFullUrl(currentTrack?.logo_url)"
          alt="Cover"
          class="w-12 h-12 rounded-md object-cover"
        />
        <div class="flex flex-col min-w-0">
          <span class="font-semibold truncate text-spotify-text-primary">
            {{ currentTrack?.name || "Nothing playing" }}
          </span>
          <span class="text-spotify-text-secondary text-xs truncate">
            {{ currentTrack?.description || "" }}
          </span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-4">
        <button
          @click="togglePlay"
          class="text-spotify-text-primary hover:text-spotify-green transition active:scale-95 p-1"
        >
          <PlayIcon v-if="!isPlaying" class="w-6 h-6" />
          <StopIcon v-else-if="isLiveStream" class="w-6 h-6" />
          <PauseIcon v-else class="w-6 h-6" />
        </button>
        <!-- Show duration for recordings, LIVE + elapsed time for streams -->
        <div v-if="currentTrack" class="flex items-center gap-3">
          <div
            v-if="isLiveStream"
            class="flex items-center gap-2 text-xs font-bold"
          >
            <span class="text-spotify-text-secondary">{{ formatTime(currentTime)}}</span>
            <span class="bg-red-600 text-white px-2 py-1 rounded font-bold">LIVE</span>
          </div>
          <span v-else class="text-xs text-spotify-text-secondary whitespace-nowrap">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>

          <!-- Volume Control -->
          <div class="relative">
            <button
              @click="showVolumeControl = !showVolumeControl"
              class="text-spotify-text-secondary hover:text-spotify-text-primary transition p-1"
              title="Volume"
            >
              <SpeakerXMarkIcon v-if="volume === 0" class="w-5 h-5" />
              <SpeakerWaveIcon v-else-if="volume < 33" class="w-5 h-5" />
              <SpeakerWaveIcon v-else-if="volume < 66" class="w-5 h-5" />
              <SpeakerWaveIcon v-else class="w-5 h-5" />
            </button>

            <!-- Volume Slider Popup -->
            <div
              v-if="showVolumeControl"
              class="absolute bottom-full right-0 mb-3 bg-spotify-bg-tertiary rounded-lg p-3 flex flex-col items-center gap-2 border border-spotify-border shadow-lg"
            >
              <input
                v-model.number="volume"
                @input="onVolumeInput"
                type="range"
                min="0"
                max="100"
                class="volume-slider"
                title="Volume slider"
              />
              <span class="text-xs text-spotify-text-secondary w-8 text-center"
                >{{ volume }}%</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="currentTrack" class="h-1 bg-spotify-border">
      <div
        class="h-1 bg-spotify-green transition-all duration-200"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </div>

  <!-- Hidden Native Audio Player Element -->
  <audio
    ref="audioEl"
    :src="currentTrack?.url"
    @timeupdate="updateProgress"
    @ended="onEnded"
    @play="onAudioPlay"
    @pause="onAudioPause"
  ></audio>
</template>

<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { usePlayerStore } from "../stores/player";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/vue/24/outline";
import { getFullUrl } from "../utils/api";

const playerStore = usePlayerStore();
const audioEl = ref(null);
const progress = ref(0);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(100);
const showVolumeControl = ref(false);
const isAudioPlaying = ref(false);
let volumeHideTimeout = null;

const currentTrack = computed(() => playerStore.currentTrack);
const isPlaying = computed(() => isAudioPlaying.value);
const isLiveStream = computed(() => currentTrack.value?.mediaType === "stream");

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const resetPlaybackMetrics = () => {
  progress.value = 0;
  currentTime.value = 0;

  if (!isLiveStream.value) {
    duration.value = 0;
  }
};

const stopStreamPlayback = () => {
  if (!audioEl.value) return;

  audioEl.value.pause();
  try {
    audioEl.value.currentTime = 0;
  } catch {
    // Live streams may not allow seeking; state reset is enough.
  }

  isAudioPlaying.value = false;
  playerStore.setPlaying(false);
  resetPlaybackMetrics();
};

const togglePlay = () => {
  if (!currentTrack.value || !audioEl.value) return;

  if (isPlaying.value && isLiveStream.value) {
    stopStreamPlayback();
    return;
  }

  if (audioEl.value.paused) {
    audioEl.value
      .play()
      .then(() => {
        isAudioPlaying.value = true;
        playerStore.setPlaying(true);
      })
      .catch((err) => {
        isAudioPlaying.value = false;
        playerStore.setPlaying(false);
        console.warn("play failed:", err);
      });
  } else {
    audioEl.value.pause();
    isAudioPlaying.value = false;
    playerStore.setPlaying(false);
  }
};

const updateProgress = () => {
  if (!audioEl.value) return;
  currentTime.value = audioEl.value.currentTime;
  duration.value = audioEl.value.duration;

  // Only update progress if duration is valid (recording)
  if (isFinite(duration.value)) {
    progress.value = (audioEl.value.currentTime / audioEl.value.duration) * 100;
  } else {
    // For live streams, show current playback time
    progress.value = 0;
  }
};

const onEnded = () => {
  isAudioPlaying.value = false;
  playerStore.setPlaying(false);
  resetPlaybackMetrics();
};

const onAudioPlay = () => {
  isAudioPlaying.value = true;
  playerStore.setPlaying(true);
};

const onAudioPause = () => {
  isAudioPlaying.value = false;
  playerStore.setPlaying(false);
};

const updateVolume = () => {
  if (!audioEl.value) return;
  audioEl.value.volume = volume.value / 100;
};

const onVolumeInput = () => {
  updateVolume();

  // Clear existing timeout
  if (volumeHideTimeout) clearTimeout(volumeHideTimeout);

  // Set new timeout to hide after 2 seconds of no changes
  volumeHideTimeout = setTimeout(() => {
    showVolumeControl.value = false;
  }, 2000);
};

// watch for changes to current track
watch(currentTrack, async (newTrack) => {
  if (!audioEl.value) return;

  resetPlaybackMetrics();
  duration.value = 0;

  if (!newTrack) {
    isAudioPlaying.value = false;
    playerStore.setPlaying(false);
    return;
  }

  // bugfix: wait for dom to update
  await nextTick();

  // load and play the track, update store
  audioEl.value.load();
  audioEl.value
    .play()
    .then(() => {
      isAudioPlaying.value = true;
      playerStore.setPlaying(true);
    })
    .catch((err) => {
      isAudioPlaying.value = false;
      playerStore.setPlaying(false);
      console.warn("play failed:", err);
    });
});
</script>

<style scoped>
.player-shell {
  width: 100%;
  background-color: rgb(25, 20, 20);
}

/* optional scrollbar fix for mobile */
audio {
  display: none;
}

/* Vertical volume slider */
.volume-slider {
  appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
  width: 4px;
  height: 100px;
  writing-mode: bt-lr;
  cursor: pointer;
}

/* Slider styling for webkit browsers (Chrome, Safari, Edge) */
.volume-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgb(34, 197, 94);
  cursor: pointer;
  margin-left: -5px;
  margin-right: -5px;
}

.volume-slider::-webkit-slider-runnable-track {
  appearance: none;
  -webkit-appearance: none;
  width: 4px;
  height: 100px;
  background: rgb(55, 65, 81);
  border-radius: 2px;
}

/* Slider styling for Firefox */
.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgb(34, 197, 94);
  cursor: pointer;
  border: none;
  transform: translateX(-50%);
}

.volume-slider::-moz-range-track {
  background: transparent;
  border: none;
}

.volume-slider::-moz-range-progress {
  background: transparent;
  height: 4px;
}
</style>
