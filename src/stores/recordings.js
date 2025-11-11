import { defineStore } from "pinia";

export const useRecordingsStore = defineStore("recordings", {
  state: () => ({
    recordings: [],
    current: null,
    audio: null,
    playing: false,
  }),

  actions: {
    async fetchRecordings() {
      const res = await fetch("/api/recordings");
      this.recordings = await res.json();
    },

    async deleteRecording() {
      const confirmed = confirm(
        "Are you sure you want to delete this recording?"
      );
      if (!confirmed) return;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/recordings/${id}`, {
        method: "DELETE",
      });

      if(res.ok) {
        //update local store
        this.recordings.filter((s) => s.id !== id)
      } else {
        alert("Failed to delete recording")
      }
    },
  },
});
