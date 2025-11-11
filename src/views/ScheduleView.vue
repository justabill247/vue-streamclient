<template>
  <div class="p-4 space-y-2">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Scheduled Recordings</h1>
      <router-link to="/add-schedule" class="text-white w-8 h-8">
        <PlusIcon />
      </router-link>
    </div>

    <div
      v-for="s in schedules"
      :key="s.name"
      class="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
    >
      <div>
        <div class="flex flex-col">
         <div class="font-bold">{{ s.name }}</div>
         <div class="font-light truncate max-w-xs">{{ s.source_url }}</div> 
        </div>
        
        <div class="text-xs text-gray-400">
          {{ s.url }}
        </div>
      </div>
      <span class="text-gray-400">{{ cronstrue.toString(s.cron) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import cronstrue from "cronstrue"
import { PlusIcon } from "@heroicons/vue/24/outline";


const schedules = ref([]);



onMounted(async () => {
  const res = await fetch("/api/schedule");
  const data = await res.json();
  schedules.value = data.schedules;
  console.log("schedule",schedules)
});
</script>
