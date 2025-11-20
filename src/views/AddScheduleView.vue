<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="flex gap-4 items-center mb-4">
      <router-link to="/schedule" class="text-white w-8 h-8">
        <ArrowLeftIcon />
      </router-link>
      <h1 class="text-2xl font-bold mb-4">Add New Schedule</h1>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Schedule Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Schedule Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Tuesday News Hour"
          class="w-full border rounded-lg p-2"
          required
        />
      </div>

      <!-- Choose Saved Stream -->
      <div>
        <label class="block text-sm font-medium mb-1"
          >Stream</label
        >
        <select
          v-model="form.streamId"
          class="w-full border rounded-lg p-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option class="hidden" value="">— None (enter manual URL below) —</option>
          <option v-for="s in streams" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- Or Manual URL -->
      <div class="hidden">
        <label class="block text-sm font-medium mb-1">Manual Stream URL</label>
        <input
          v-model="form.url"
          type="url"
          placeholder="https://example.com/live.m3u8"
          class="w-full border rounded-lg p-2"
          :disabled="form.streamId"
        />
      </div>

      <!-- 🕓 Simplified Scheduling -->
      <div class="border-t pt-4">
        <h2 class="text-lg font-semibold mb-2">Schedule Time</h2>

        <div class="flex flex-col gap-3 mb-3">
          <!-- Time -->
          <div>
            <label class="block text-sm font-medium mb-1">Time</label>
            <input
              type="number"
              min="0"
              max="23"
              v-model="form.hour"
              class="w-16 border p-1 rounded"
            />
            :
            <input
              type="number"
              min="0"
              max="59"
              v-model="form.minute"
              class="w-16 border p-1 rounded"
            />
          </div>

          <!-- Frequency -->
          <div>
            <label class="block text-sm font-medium mb-1">Frequency</label>
            <select
              v-model="form.frequency"
              class="w-full border rounded-lg p-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="hourly">Every Hour</option>
              <option value="specific">Specific Day</option>
              <option value="custom">Custom (enter cron)</option>
            </select>
          </div>

          <!-- Specific Day Options -->
          <div v-if="form.frequency === 'specific'" class="space-y-2">
            <label class="block text-sm font-medium mb-1">Day Type</label>
            <select
              v-model="form.specificType"
              class="w-full border rounded-lg p-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekday">Day of Week</option>
              <option value="monthday">Day of Month</option>
            </select>

            <div v-if="form.specificType === 'weekday'">
              <label class="block text-sm font-medium mb-1">Day of Week</label>
              <select
                v-model="form.specificDay"
                class="w-full border rounded-lg p-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>

            <div v-if="form.specificType === 'monthday'">
              <label class="block text-sm font-medium mb-1">Day of Month</label>
              <input
                v-model.number="form.specificDay"
                type="number"
                min="1"
                max="31"
                class="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <!-- Custom Cron -->
          <div v-if="form.frequency === 'custom'">
            <label class="block text-sm font-medium mb-1">Custom Cron</label>
            <input
              v-model="form.cron"
              type="text"
              placeholder="* * * * *"
              class="w-full border rounded-lg p-2 font-mono"
            />
          </div>

          <!-- Auto-generated cron preview -->
          <div v-else class="text-sm text-gray-500">
            Generated cron: <code>{{ form.cron }}</code>
          </div>
        </div>
      </div>

      <!-- Duration -->
      <div>
        <label class="block text-sm font-medium mb-1">Duration</label>
        <div class="flex gap-2">
          <!-- Hours dropdown -->
          <div class="flex-1">
            <select
              v-model.number="durationHours"
              class="w-full border rounded-lg p-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="h in 24" :key="h - 1" :value="h - 1">
                {{ h - 1 }} hr
              </option>
            </select>
          </div>

          <!-- Minutes dropdown -->
          <div class="flex-1">
            <select
              v-model.number="durationMinutes"
              class="w-full border rounded-lg p-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="m in 60" :key="m - 1" :value="m - 1">
                {{ m - 1 }} min
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="pt-4">
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Add Schedule
        </button>
      </div>
    </form>

    <div v-if="message" class="mt-4 text-center text-green-600 font-medium">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const streams = ref([]);
const message = ref("");

const durationHours = ref(0);
const durationMinutes = ref(1);
const submitOkDelay = 1500;

//default time
const now = new Date();
const pad = (n) => n.toString().padStart(2, "0");

// form state
const form = ref({
  name: "",
  duration: 60,
  hour: pad(now.getHours()), // default to current hour
  minute: pad(now.getMinutes()), // default to current minute
  cron: "",
  frequency: "daily",
  specificDay: "",
  specificType: "weekday",
});

onMounted(async () => {
  const res = await fetch("/api/streams");
  streams.value = await res.json();
});

// Convert into seconds automatically
watch([durationHours, durationMinutes], () => {
  form.value.duration = durationHours.value * 3600 + durationMinutes.value * 60;
});

// --- Watcher to generate cron
watch(
  [
    () => form.value.hour,
    () => form.value.minute,
    () => form.value.frequency,
    () => form.value.specificDay,
    () => form.value.specificType,
  ],
  () => {
    const hour = form.value.hour;
    const minute = form.value.minute;

    switch (form.value.frequency) {
      case "daily":
        form.value.cron = `${minute} ${hour} * * *`;
        break;
      case "weekdays":
        form.value.cron = `${minute} ${hour} * * 1-5`;
        break;
      case "hourly":
        form.value.cron = `0 * * * *`;
        break;
      case "specific":
        if (form.value.specificType === "weekday") {
          form.value.cron = `${minute} ${hour} * * ${form.value.specificDay}`;
        } else {
          form.value.cron = `${minute} ${hour} ${form.value.specificDay} * *`;
        }
        break;
      case "custom":
        // leave as-is for manual cron entry
        break;
    }
  },
  { immediate: true }
);

async function submitForm() {
  console.log("form", form.value);
  if (!form.value.streamId && !form.value.url) {
    alert("You must select a stream or provide a URL.");
    return;
  }

  const res = await fetch("/api/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form.value),
  });

  if (res.ok) {
    message.value = "✅ Schedule added successfully!";
    form.value = {
      name: "",
      streamId: "",
      url: "",
      cron: "",
      duration: 300,
    };

    setTimeout(() => {
      router.push("/schedule");
    }, submitOkDelay);
  } else {
    const err = await res.json();
    alert("Error adding schedule: " + (err.error || res.statusText));
  }
}
</script>
