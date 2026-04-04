<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex gap-4 items-center mb-6">
      <router-link to="/schedule" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Go back">
        <ArrowLeftIcon class="w-6 h-6" />
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-spotify-text-primary">Add New Schedule</h1>
        <p class="text-sm text-spotify-text-secondary">Choose a repeating schedule or a one-time recording.</p>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Schedule Type</label>
          <div class="schedule-type-shell grid grid-cols-2 gap-2 rounded-lg bg-spotify-bg-tertiary p-1 border border-spotify-border">
            <button
              type="button"
              class="schedule-type-button px-4 py-2 rounded-md text-sm font-semibold transition"
              :class="form.mode === 'recurring' ? 'schedule-type-button-active text-spotify-green' : 'text-spotify-text-secondary hover:text-spotify-text-primary'"
              @click="form.mode = 'recurring'"
            >
              Recurring
            </button>
            <button
              type="button"
              class="schedule-type-button px-4 py-2 rounded-md text-sm font-semibold transition"
              :class="form.mode === 'oneShot' ? 'schedule-type-button-active text-spotify-green' : 'text-spotify-text-secondary hover:text-spotify-text-primary'"
              @click="form.mode = 'oneShot'"
            >
              One Time
            </button>
          </div>
        </div>

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

        <div>
          <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Saved Stream</label>
          <select
            v-model="form.streamId"
            class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          >
            <option class="bg-spotify-bg-secondary" value="">Use Custom URL Instead</option>
            <option v-for="stream in streams" :key="stream.id" :value="stream.id" class="bg-spotify-bg-secondary">
              {{ stream.name }}
            </option>
          </select>
        </div>

        <div v-if="!form.streamId">
          <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Custom Stream URL</label>
          <input
            v-model="form.url"
            type="url"
            placeholder="https://example.com/live.m3u8"
            class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          />
          <p class="mt-2 text-xs text-spotify-text-disabled">Leave this blank if you selected a saved stream above.</p>
        </div>
      </div>

      <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-spotify-text-primary">When Should It Run?</h2>
          <span class="text-xs uppercase tracking-wide text-spotify-text-disabled">
            {{ form.mode === 'oneShot' ? 'Runs once' : 'Repeats' }}
          </span>
        </div>

        <template v-if="form.mode === 'oneShot'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Date</label>
              <input
                v-model="form.runDate"
                type="date"
                class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Time</label>
              <input
                v-model="form.runTime"
                type="time"
                class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                required
              />
            </div>
          </div>
          <div class="rounded-lg border border-spotify-border bg-spotify-bg-tertiary p-3">
            <div class="text-sm font-semibold text-spotify-text-primary mb-1">Run Preview</div>
            <div class="text-sm text-spotify-text-secondary">{{ schedulePreview }}</div>
            <div class="mt-2 text-xs text-spotify-text-disabled">Generated cron: <code>{{ generatedCron }}</code></div>
          </div>
        </template>

        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Time</label>
              <input
                v-model="form.runTime"
                type="time"
                class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Repeats</label>
              <select
                v-model="form.frequency"
                class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
              >
                <option class="bg-spotify-bg-secondary" value="daily">Daily</option>
                <option class="bg-spotify-bg-secondary" value="weekdays">Weekdays</option>
                <option class="bg-spotify-bg-secondary" value="weekly">Weekly</option>
                <option class="bg-spotify-bg-secondary" value="monthly">Monthly</option>
                <option class="bg-spotify-bg-secondary" value="hourly">Every Hour</option>
                <option class="bg-spotify-bg-secondary" value="custom">Custom Cron</option>
              </select>
            </div>
          </div>

          <div v-if="form.frequency === 'weekly'">
            <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Day of Week</label>
            <select
              v-model="form.weekday"
              class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option v-for="day in weekdayOptions" :key="day.value" :value="day.value" class="bg-spotify-bg-secondary">
                {{ day.label }}
              </option>
            </select>
          </div>

          <div v-if="form.frequency === 'monthly'">
            <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Day of Month</label>
            <input
              v-model.number="form.monthDay"
              type="number"
              min="1"
              max="31"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            />
          </div>

          <div v-if="form.frequency === 'custom'">
            <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Custom Cron</label>
            <input
              v-model="form.customCron"
              type="text"
              placeholder="0 16 * * 2"
              class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 font-mono placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            />
          </div>

          <div class="rounded-lg border border-spotify-border bg-spotify-bg-tertiary p-3">
            <div class="text-sm font-semibold text-spotify-text-primary mb-1">Schedule Preview</div>
            <div class="text-sm text-spotify-text-secondary">{{ schedulePreview }}</div>
            <div class="mt-2 text-xs text-spotify-text-disabled">Generated cron: <code>{{ generatedCron }}</code></div>
          </div>
        </template>
      </div>

      <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Duration</label>
          <div class="grid grid-cols-2 gap-3">
            <select
              v-model.number="durationHours"
              class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option v-for="hour in 24" :key="hour - 1" :value="hour - 1" class="bg-spotify-bg-secondary">
                {{ hour - 1 }} hr
              </option>
            </select>
            <select
              v-model.number="durationMinutes"
              class="themed-native-control w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            >
              <option v-for="minute in 60" :key="minute - 1" :value="minute - 1" class="bg-spotify-bg-secondary">
                {{ minute - 1 }} min
              </option>
            </select>
          </div>
          <p class="mt-2 text-xs text-spotify-text-disabled">Total duration: {{ durationLabel }}</p>
        </div>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          class="w-full bg-spotify-green hover:bg-spotify-green-bright text-black font-semibold py-3 px-4 rounded-lg transition active:scale-95"
        >
          Add {{ form.mode === 'oneShot' ? 'One-Time Recording' : 'Schedule' }}
        </button>
      </div>
    </form>

    <div v-if="message" class="mt-4 text-center text-spotify-green font-medium">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import cronstrue from "cronstrue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const streams = ref([]);
const message = ref("");
const submitOkDelay = 1500;

const weekdayOptions = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

function pad(value) {
  return value.toString().padStart(2, "0");
}

function getDefaultDateTime() {
  const next = new Date();
  next.setMinutes(next.getMinutes() + 15);
  next.setSeconds(0, 0);

  return {
    date: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`,
    time: `${pad(next.getHours())}:${pad(next.getMinutes())}`,
  };
}

function createDefaultForm() {
  const defaults = getDefaultDateTime();

  return {
    name: "",
    streamId: "",
    url: "",
    mode: "recurring",
    runDate: defaults.date,
    runTime: defaults.time,
    frequency: "daily",
    weekday: "1",
    monthDay: 1,
    customCron: "",
  };
}

const form = ref(createDefaultForm());
const durationHours = ref(0);
const durationMinutes = ref(30);
const durationSeconds = computed(() => durationHours.value * 3600 + durationMinutes.value * 60);
const durationLabel = computed(() => {
  const parts = [];

  if (durationHours.value > 0) {
    parts.push(`${durationHours.value} hr`);
  }

  if (durationMinutes.value > 0 || parts.length === 0) {
    parts.push(`${durationMinutes.value} min`);
  }

  return parts.join(" ");
});

const generatedCron = computed(() => {
  const [hour = "00", minute = "00"] = (form.value.runTime || "00:00").split(":");

  if (form.value.mode === "oneShot") {
    if (!form.value.runDate || !form.value.runTime) {
      return "";
    }

    const [year, month, day] = form.value.runDate.split("-");
    if (!year || !month || !day) {
      return "";
    }

    return `0 ${Number(minute)} ${Number(hour)} ${Number(day)} ${Number(month)} *`;
  }

  switch (form.value.frequency) {
    case "daily":
      return `${Number(minute)} ${Number(hour)} * * *`;
    case "weekdays":
      return `${Number(minute)} ${Number(hour)} * * 1-5`;
    case "weekly":
      return `${Number(minute)} ${Number(hour)} * * ${form.value.weekday}`;
    case "monthly":
      return `${Number(minute)} ${Number(hour)} ${form.value.monthDay} * *`;
    case "hourly":
      return `0 * * * *`;
    case "custom":
      return form.value.customCron.trim();
    default:
      return "";
  }
});

const schedulePreview = computed(() => {
  if (!generatedCron.value) {
    return "Complete the schedule details to see a preview.";
  }

  if (form.value.mode === "oneShot") {
    const runAt = new Date(`${form.value.runDate}T${form.value.runTime}:00`);
    if (Number.isNaN(runAt.getTime())) {
      return "Choose a valid date and time.";
    }

    return `Runs once on ${runAt.toLocaleString()}.`;
  }

  try {
    return cronstrue.toString(generatedCron.value);
  } catch {
    return "Enter a valid cron expression.";
  }
});

watch(
  () => form.value.streamId,
  (streamId) => {
    if (streamId) {
      form.value.url = "";
    }
  }
);

onMounted(async () => {
  const response = await fetch("/api/streams");
  streams.value = await response.json();
});

function resetForm() {
  form.value = createDefaultForm();
  durationHours.value = 0;
  durationMinutes.value = 30;
}

function validateForm() {
  if (!form.value.streamId && !form.value.url) {
    return "You must select a stream or provide a URL.";
  }

  if (durationSeconds.value <= 0) {
    return "Duration must be at least 1 minute.";
  }

  if (!generatedCron.value) {
    return "Schedule details are incomplete.";
  }

  if (form.value.mode === "oneShot") {
    const runAt = new Date(`${form.value.runDate}T${form.value.runTime}:00`);
    if (Number.isNaN(runAt.getTime())) {
      return "Please choose a valid date and time.";
    }

    if (runAt <= new Date()) {
      return "One-time schedules must be in the future.";
    }
  }

  return null;
}

async function submitForm() {
  const validationError = validateForm();
  if (validationError) {
    alert(validationError);
    return;
  }

  const payload = {
    name: form.value.name,
    streamId: form.value.streamId ? Number(form.value.streamId) : null,
    url: form.value.url || undefined,
    duration: durationSeconds.value,
    cron: generatedCron.value,
    oneShot: form.value.mode === "oneShot",
  };

  const response = await fetch("/api/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    message.value = form.value.mode === "oneShot"
      ? "One-time recording scheduled successfully."
      : "Schedule added successfully.";

    resetForm();

    setTimeout(() => {
      router.push("/schedule");
    }, submitOkDelay);
    return;
  }

  const error = await response.json();
  alert("Error adding schedule: " + (error.error || response.statusText));
}
</script>

<style scoped>
.schedule-type-shell {
  background-color: rgba(31, 41, 55, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.schedule-type-button {
  border: 1px solid transparent;
}

.schedule-type-button-active {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%);
  border-color: rgba(29, 185, 84, 0.55);
  box-shadow:
    inset 0 0 0 1px rgba(29, 185, 84, 0.18),
    0 0 0 1px rgba(29, 185, 84, 0.14),
    0 8px 20px rgba(0, 0, 0, 0.28);
}

.schedule-type-button:not(.schedule-type-button-active) {
  background-color: rgba(15, 23, 42, 0.45);
}

.schedule-type-button:not(.schedule-type-button-active):hover {
  background-color: rgba(51, 65, 85, 0.65);
}

.themed-native-control {
  color-scheme: dark;
  background-color: rgb(31, 41, 55);
  color: rgb(241, 245, 249);
}

.themed-native-control option,
.themed-native-control optgroup {
  background-color: rgb(15, 23, 42);
  color: rgb(241, 245, 249);
}

.themed-native-control::-webkit-calendar-picker-indicator {
  filter: invert(1) brightness(0.9);
  opacity: 0.8;
}
</style>
