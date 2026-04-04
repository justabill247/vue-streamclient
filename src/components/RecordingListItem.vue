<template>
  <div
    class="bg-spotify-bg-card hover:bg-spotify-bg-tertiary rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 transition border border-spotify-border hover:border-spotify-text-secondary group"
  >
    <div class="flex flex-col overflow-hidden min-w-0 gap-0.5">
      <span class="text-sm font-semibold text-spotify-text-primary truncate">{{ recording.name }}</span>
      <div v-if="subtitle" class="flex items-center gap-2 min-w-0">
        <img
          v-if="logoUrl"
          :src="getFullUrl(logoUrl)"
          alt="Stream logo"
          class="w-4 h-4 rounded-sm object-cover border border-spotify-border shrink-0"
        />
        <span class="text-[11px] text-spotify-text-secondary truncate">{{ subtitle }}</span>
      </div>
      <span class="text-[11px] text-spotify-text-disabled truncate">{{ metaText }}</span>
    </div>

    <div class="flex items-center gap-1 transition shrink-0">
      <button
        v-if="showPlay && recording.file_path"
        @click="$emit('play', recording)"
        class="text-spotify-green hover:text-spotify-green-bright transition p-1.5"
        title="Play recording"
      >
        <PlayIcon class="w-4 h-4" />
      </button>

      <button
        v-if="showDownload"
        @click="$emit('download', recording)"
        class="text-spotify-text-secondary hover:text-spotify-text-primary transition p-1.5"
        title="Download"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
      </button>

      <button
        v-if="showDelete"
        @click="$emit('delete', recording)"
        class="text-spotify-text-secondary hover:text-red-500 transition p-1.5"
        title="Delete"
      >
        <TrashIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  PlayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { formatDateTime, formatDurationCompact } from "../utils/time";
import { getFullUrl } from "../utils/api";

const props = defineProps({
  recording: {
    type: Object,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  logoUrl: {
    type: String,
    default: "",
  },
  showPlay: {
    type: Boolean,
    default: true,
  },
  showDownload: {
    type: Boolean,
    default: false,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["play", "download", "delete"]);

const metaText = computed(() => {
  const parts = [];

  if (props.recording.start_time) {
    parts.push(formatDateTime(props.recording.start_time));
  }

  if (typeof props.recording.duration === "number") {
    parts.push(formatDurationCompact(props.recording.duration));
  }

  return parts.join(" • ");
});
</script>