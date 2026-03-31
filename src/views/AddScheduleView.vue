<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="flex gap-4 items-center mb-6">
      <router-link to="/schedule" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Go back">
        <ArrowLeftIcon class="w-6 h-6" />
      </router-link>
      <h1 class="text-2xl font-bold text-spotify-text-primary">Add New Schedule</h1>
    </div>

    <form @submit.prevent="submitForm" class="space-y-5">
      <!-- Schedule Name -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Schedule Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Tuesday News Hour"
          class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          required
        />
      </div>

      <!-- Choose Saved Stream -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary"
          >Stream</label
        >
        <select
          v-model="form.streamId"
          class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
        >
          <option class="bg-spotify-bg-secondary" value="">— None (enter manual URL below) —</option>
          <option v-for="s in streams" :key="s.id" :value="s.id" class="bg-spotify-bg-secondary">
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- Or Manual URL -->
      <div class="hidden">
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Manual Stream URL</label>
        <input
          v-model="form.url"
          type="url"
          placeholder="https://example.com/live.m3u8"
          class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          :disabled="form.streamId"
        />
      </div>

      <!-- 🕓 Simplified Scheduling -->
      <div class="border-t border-spotify-border pt-5">
        <h2 class="text-lg font-semibold mb-3 text-spotify-text-primary">Schedule Time</h2>

        <div class="flex flex-col gap-4 mb-4">
          <!-- Time -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Time</label>
            <div class="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="23"
                v-model="form.hour"
                class="w-16 bg-spotify-bg-tertiary border border-spotify-border text-spotify-text-primary p-2 rounded focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
              />
              <span class="text-spotify-text-primary">:</span>
              <input
                type="number"
                min="0"
                max="59"
                v-model="form.minute"
                class="w-16 bg-spotify-bg-tertiary border border-spotify-border text-spotify-text-primary p-2 rounded focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
              />
            </div>
          </div>

          <!-- Frequency -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Frequency</label>
            <select
              v-model="form.frequency"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option class="bg-spotify-bg-secondary" value="daily">Daily</option>
              <option class="bg-spotify-bg-secondary" value="weekdays">Weekdays</option>
              <option class="bg-spotify-bg-secondary" value="hourly">Every Hour</option>
              <option class="bg-spotify-bg-secondary" value="specific">Specific Day</option>
              <option class="bg-spotify-bg-secondary" value="custom">Custom (enter cron)</option>
            </select>
          </div>

          <!-- Specific Day Options -->
          <div v-if="form.frequency === 'specific'" class="space-y-3">
            <label class="block text-sm font-semibold text-spotify-text-primary">Day Type</label>
            <select
              v-model="form.specificType"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option class="bg-spotify-bg-secondary" value="weekday">Day of Week</option>
              <option class="bg-spotify-bg-secondary" value="monthday">Day of Month</option>
            </select>

            <div v-if="form.specificType === 'weekday'">
              <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Day of Week</label>
              <select
                v-model="form.specificDay"
                class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
              >
                <option class="bg-spotify-bg-secondary" value="0">Sunday</option>
                <option class="bg-spotify-bg-secondary" value="1">Monday</option>
                <option class="bg-spotify-bg-secondary" value="2">Tuesday</option>
                <option class="bg-spotify-bg-secondary" value="3">Wednesday</option>
                <option class="bg-spotify-bg-secondary" value="4">Thursday</option>
                <option class="bg-spotify-bg-secondary" value="5">Friday</option>
                <option class="bg-spotify-bg-secondary" value="6">Saturday</option>
              </select>
            </div>

            <div v-if="form.specificType === 'monthday'">
              <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Day of Month</label>
              <input
                v-model.number="form.specificDay"
                type="number"
                min="1"
                max="31"
                class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
              />
            </div>
          </div>

          <!-- Custom Cron -->
          <div v-if="form.frequency === 'custom'">
            <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Custom Cron</label>
            <input
              v-model="form.cron"
              type="text"
              placeholder="* * * * *"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 font-mono placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            />
          </div>

          <!-- Auto-generated cron preview -->
          <div v-else class="text-sm text-spotify-text-secondary">
            Generated cron: <code class="text-spotify-text-secondary">{{ form.cron }}</code>
          </div>
        </div>
      </div>

      <!-- Duration -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Duration</label>
        <div class="flex gap-2">
          <!-- Hours dropdown -->
          <div class="flex-1">
            <select
              v-model.number="durationHours"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option v-for="h in 24" :key="h - 1" :value="h - 1" class="bg-spotify-bg-secondary">
                {{ h - 1 }} hr
              </option>
            </select>
          </div>

          <!-- Minutes dropdown -->
          <div class="flex-1">
            <select
              v-model.number="durationMinutes"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option v-for="m in 60" :key="m - 1" :value="m - 1" class="bg-spotify-bg-secondary">
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
          class="w-full bg-spotify-green hover:bg-spotify-green-bright text-black font-semibold py-3 px-4 rounded-lg transition active:scale-95"
        >
          Add Schedule
        </button>
      </div>
    </form>

    <div v-if="message" class="mt-4 text-center text-spotify-green font-medium">
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
