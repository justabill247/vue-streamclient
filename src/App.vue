<template>
  <div class="flex flex-col h-screen bg-spotify-gray">
    
    <!-- Main Content -->
     <main class="flex-1 overflow-y-auto pb-36">
      <router-view/>
     </main>
    

    <!-- Global Player Component -->
     <div class="fixed bottom-18 left-0 right-0 z-50">
        <Player />
     </div>
  

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 h-18 bg-black flex justify-around items-center text-gray-400 border-t border-gray-800 z-50">
      <router-link to="/" class="flex flex-col items-center h-full p-2">
        <HomeIcon />
        <span class="text-xs mt-1">Home</span>
      </router-link>      
      <router-link to="/streams" class="flex flex-col items-center h-full p-2">
        <RadioIcon />
        <span class="text-xs mt-1">Streams</span>
      </router-link>
      <router-link to="/recordings" class="flex flex-col items-center h-full p-2">
        <CircleStackIcon />
        <span class="text-xs mt-1">Recordings</span>
      </router-link>
      <router-link to="/schedule" class="flex flex-col items-center h-full p-2">
        <CalendarDaysIcon />
        <span class="text-xs mt-1">Schedule</span>
      </router-link>
      <router-link to="/settings" class="flex flex-col items-center h-full p-2">
                <Cog6ToothIcon />
        <span class="text-xs mt-1">Settings</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useStreamStore } from "./stores/streams";
import { usePlayerStore } from "./stores/player";
import Player from "./components/Player.vue";
import { RadioIcon, CircleStackIcon, CalendarDaysIcon, Cog6ToothIcon, PlayIcon, PauseIcon, HomeIcon } from "@heroicons/vue/24/outline";
const streamStore = useStreamStore();
const playerStore = usePlayerStore();

</script>

<style scoped>
nav a.router-link-active {
  color: white;
}
</style>
