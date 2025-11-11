<template>
  <div class="p-4">
    <h1 class="text-xl font-semibold mb-2">Settings</h1>
    <p class="text-gray-400">Server: /api</p>

    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-2">Danger Zone</h2>
      <button
        @click="deleteAllSchedules"
        class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        Delete All Schedules
      </button>
      <button
        @click="deleteAllRecordings"
        class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        Delete All Recordings
      </button>
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
