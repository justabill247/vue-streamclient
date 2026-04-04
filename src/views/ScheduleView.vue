<template>
  <div class="p-4 space-y-3">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-2xl font-bold text-spotify-text-primary">Schedule</h1>
      <router-link to="/add-schedule" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Add schedule">
        <PlusIcon class="w-6 h-6" />
      </router-link>
    </div>

    <div
      v-for="s in schedules"
      :key="s.name"
      class="bg-spotify-bg-card hover:bg-spotify-bg-tertiary rounded-lg p-3 flex justify-between items-center transition border border-spotify-border hover:border-spotify-text-secondary cursor-pointer group"
      @click="onScheduleClick(s.id)"
    >
      <div class="flex items-center gap-3 flex-1">
        <img
          v-if="s.stream.logo_url"
          :src="getFullUrl(s.stream.logo_url)"
          alt="Logo"
          class="w-12 h-12 object-cover rounded-md border border-spotify-border"
        />

        <div class="flex flex-col">
          <div class="font-semibold text-spotify-text-primary">{{ s.name }}</div>
          <div class="text-xs text-spotify-text-secondary truncate">
            {{ s.url }}
          </div>
        </div>
      </div>
      <div class="flex flex-col text-right">
       <span class="text-spotify-text-secondary text-sm">{{ cronstrue.toString(s.cron) }}</span>
       <span class="text-spotify-text-disabled text-xs">for {{formatTimeHrsMins(s.duration) }}</span> 
      </div>
      
    </div>
  </div>
</template>

<script setup>
import router from "../router";
import cronstrue from "cronstrue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import { getFullUrl } from "../utils/api";
import { formatTimeHrsMins } from "../utils/time";
import { useRecordingStatus } from "../composables/useRecordingStatus";

const { schedules, fetchScheduleState, scheduleStateLoaded } = useRecordingStatus();

function onScheduleClick(id){
console.log('sc',id)
router.push({ name: "ScheduleDetails", params: { id: id } });
}

if (!scheduleStateLoaded.value) {
  fetchScheduleState();
}
</script>
