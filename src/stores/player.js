import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("player", () => {
  // --- State ---
  const currentTrack = ref(null); // { id, name, url, description, logo_url }
  const isPlaying = ref(false);

  // --- Actions ---
  function playTrack(track) {
    console.log("playing", track.url)
    currentTrack.value = {
      ...track,
      mediaType: track.mediaType ?? "recording",
    };
    isPlaying.value = true;
    console.log('isPlaying is', isPlaying)
  }

  function playStream(stream) {
    console.log("playing stream", stream.url)
    currentTrack.value = {
      ...stream,
      mediaType: "stream",
    };
    isPlaying.value = true;
  }

  function pause() {
    isPlaying.value = false;
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value;
  }

  function setPlaying(playing) {
    isPlaying.value = playing;
    console.log('playing status', playing)
  }

  return {
    currentTrack,
    isPlaying,
    playTrack,
    playStream,
    pause,
    togglePlay,
    setPlaying
  };
});
