<template>
  <div class="flex flex-col h-screen bg-spotify-bg-primary">
    
    <!-- Main Content -->
     <main class="flex-1 overflow-y-auto pb-36">
      <router-view/>
     </main>
    

    <!-- Global Player Component -->
     <div class="fixed bottom-18 left-0 right-0 z-50">
        <Player />
     </div>
  

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 h-18 bg-black flex justify-around items-center text-spotify-text-secondary border-t border-spotify-border z-50">
      <router-link to="/" class="flex flex-col items-center h-full p-2 hover:text-white transition">
        <HomeIcon />
        <span class="text-xs mt-1">Home</span>
      </router-link>      
      <router-link to="/streams" class="flex flex-col items-center h-full p-2 hover:text-white transition">
        <RadioIcon />
        <span class="text-xs mt-1">Streams</span>
      </router-link>
      <router-link to="/recordings" class="flex flex-col items-center h-full p-2 relative hover:text-white transition">
        <CircleStackIcon />
        <span class="text-xs mt-1">Recordings</span>
        <!-- Recording Badge with Pulsing Animation -->
        <div 
          v-if="activeRecordingCount > 0"
          class="badge-recording"
        >
          {{ activeRecordingCount }}
        </div>
        <div 
          v-else
          class="absolute top-1 right-1 bg-spotify-bg-card text-spotify-text-disabled text-xs font-bold px-1.5 py-0.5 rounded"
        >
          Idle
        </div>
      </router-link>
      <router-link to="/schedule" class="flex flex-col items-center h-full p-2 hover:text-white transition">
        <CalendarDaysIcon />
        <span class="text-xs mt-1">Schedule</span>
      </router-link>
      <router-link to="/settings" class="flex flex-col items-center h-full p-2 hover:text-white transition">
                <Cog6ToothIcon />
        <span class="text-xs mt-1">Settings</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useStreamStore } from "./stores/streams";
import { usePlayerStore } from "./stores/player";
import { useRecordingStatus } from "./composables/useRecordingStatus";
import Player from "./components/Player.vue";
import { RadioIcon, CircleStackIcon, CalendarDaysIcon, Cog6ToothIcon, PlayIcon, PauseIcon, HomeIcon } from "@heroicons/vue/24/outline";

const streamStore = useStreamStore();
const playerStore = usePlayerStore();
const { activeRecordingCount } = useRecordingStatus();
</script>

<style scoped>
nav a.router-link-active {
  color: white;
}

.badge-recording {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: rgb(220, 38, 38);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulseBadge 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseBadge {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}
</style>
