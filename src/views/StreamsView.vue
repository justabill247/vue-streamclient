<template>
  <div class="p-4 space-y-3">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-2xl font-bold text-spotify-text-primary">Streams</h1>
      <router-link to="/add-stream" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Add stream">
        <PlusIcon class="w-6 h-6" />
      </router-link>
    </div>

    <div
      v-for="stream in store.streams"
      :key="stream.id"
      class="bg-spotify-bg-card hover:bg-spotify-bg-tertiary rounded-lg p-3 flex justify-between items-center transition border border-spotify-border hover:border-spotify-text-secondary cursor-pointer group"
      @click.stop="goToStreamDetails(stream.id)"
    >
      <div class="flex gap-4 items-center flex-1">
        <img
          v-if="stream.logo_url"
          :src="getFullUrl(stream.logo_url)"
          alt="Logo"
          class="w-12 h-12 object-cover rounded-md border border-spotify-border"
        />
        <div class="flex flex-col">
          <span class="text-lg font-semibold text-spotify-text-primary">{{ stream.name }}</span>
        </div>
      </div>

      <div class="flex text-spotify-text-secondary gap-2 opacity-0 group-hover:opacity-100 transition">
        <button @click.stop="playStream(stream)" class="text-spotify-green hover:text-spotify-green-bright transition p-2" title="Play">
          <PlayIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useStreamStore } from "../stores/streams";
import { usePlayerStore } from "../stores/player";
import { getFullUrl } from "../utils/api";
import router from "../router";
import {
  PlusIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL;
const store = useStreamStore();
const player = usePlayerStore();
onMounted(store.fetchStreams);

function playStream(stream) {
  player.playTrack({
    id: stream.id,
    name: stream.name,
    url: stream.url,
    logo_url: stream.logo_url,
  });
}

function goToStreamDetails(id) {
  router.push(`/stream/${id}/details`);
}
</script>
