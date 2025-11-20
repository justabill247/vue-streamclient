<template>
  <div class="p-4 space-y-2">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Schedule</h1>
      <router-link to="/add-schedule" class="text-white w-8 h-8">
        <PlusIcon />
      </router-link>
    </div>

    <div
      v-for="s in schedules"
      :key="s.name"
      class="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
    >
      <div class="flex items-center" @click="onScheduleClick(s.id)">
        <img
          v-if="s.stream.logo_url"
          :src="getFullUrl(s.stream.logo_url)"
          alt="Logo"
          class="w-10 h-10 object-cover rounded-md border"
        />

        <div class="flex flex-col ml-3">
          <div class="font-bold">{{ s.name }}</div>
        </div>

        <div class="text-xs text-gray-400">
          {{ s.url }}
        </div>
      </div>
      <div class="flex flex-col">
       <span class="text-gray-400">{{ cronstrue.toString(s.cron) }}</span>
       <span class="text-gray-500">for {{formatTimeHrsMins(s.duration) }}</span> 
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import router from "../router";
import cronstrue from "cronstrue";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/vue/24/outline";
import { getFullUrl } from "../utils/api";
import { formatTimeHrsMins } from "../utils/time";


const schedules = ref([]);

function onScheduleClick(id){
console.log('sc',id)
router.push({ name: "ScheduleDetails", params: { id: id } });
}


onMounted(async () => {
  const res = await fetch("/api/schedule");
  const data = await res.json();
  schedules.value = data.schedules;
  console.log("schedule", schedules.value);
});
</script>
