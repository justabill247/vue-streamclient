<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4 text-spotify-text-primary">Settings</h1>
    <p class="text-spotify-text-secondary">Server: <span class="text-spotify-text-primary">/api</span></p>

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
      <div class="space-y-2">
        <button
          @click="deleteAllSchedules"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition active:scale-95"
        >
          Delete All Schedules
        </button>
        <button
          @click="deleteAllRecordings"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition active:scale-95"
        >
          Delete All Recordings
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";

async function deleteAllSchedules() {
  if (
    !confirm(
      "Are you sure you want to delete all schedules? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch("/api/schedule/deleteAll", { method: "POST" });
    const result = await response.json();

    alert(`Deleted all schedules.`);
  } catch (error) {
    console.error("Error deleting schedules:", error);
    alert("Failed to delete schedules.");
  }
}

async function deleteAllRecordings() {
  if (
    !confirm(
      "Are you sure you want to delete all recordings? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch("/api/recordings/all", { method: "DELETE" });
    const result = await response.json();

    alert(`Deleted all recordings.`);
  } catch (error) {
    console.error("Error deleting recordings:", error);
    alert("Failed to delete recordings.");
  }
}
</script>
