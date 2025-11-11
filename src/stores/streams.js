import { defineStore } from "pinia";

export const useStreamStore = defineStore("streams", {
  state: () => ({
    streams: [],
    current: null,
    audio: null,
    playing: false
  }),

  actions: {
    async fetchStreams() {
      const res = await fetch("/api/streams");
      this.streams = await res.json();
      console.log('streams', this.streams)
    },

    async deleteStream(id) {
      const confirmed = confirm("Are you sure you want to delete this stream?")
      if(!confirmed) return;
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/streams/${id}`, {
          method: "DELETE",
        });

        if(res.ok) {
          //update local store
          this.streams = this.streams.filter((s) => s.id !== id);
        } else {
          alert("Failed to delete stream")
        }
    },

    playStream(stream) {
      if (this.audio) this.audio.pause();
      this.audio = new Audio(stream.url);
      this.audio.play();
      this.current = stream;
      this.playing = true;
    },
    togglePlay() {
      if (!this.audio) return;
      if (this.playing) this.audio.pause();
      else this.audio.play();
      this.playing = !this.playing;
    }
  }
});
