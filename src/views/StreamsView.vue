<template>
  <div class="p-4 space-y-2">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-xl font-semibold">Streams</h1>
      <router-link to="/add-stream" class="text-white w-8 h-8">
        <PlusIcon />
      </router-link>
    </div>

    <div
      v-for="stream in store.streams"
      :key="stream.id"
      class="bg-gray-800 rounded-lg p-2 flex justify-between items-center"
      @click.stop="goToStreamDetails(stream.id)"
    >
      <div class="flex gap-4 items-center">
        <img
          v-if="stream.logo_url"
          :src="getFullUrl(stream.logo_url)"
          alt="Logo"
          class="w-10 h-10 object-cover rounded-md border"
        />
        <div class="flex flex-col">
          <span class="text-lg">{{ stream.name }}</span>
        </div>
      </div>

      <div class="flex text-gray-300 gap-3">
        <button @click="playStream(stream)" class="text-spotify-green text-lg">
          <PlayIcon class="h-6 w-6" />
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
