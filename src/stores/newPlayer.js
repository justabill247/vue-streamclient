import {defineStore} from "pinia"

export const useNewPlayerStore = defineStore("player", {
    state: () => ({
        playing: false,
        currentTrack: null

    }),

    getters: {
        currentTrack: this.currentTrack
    },

    actions: {
        playStream(stream) {
            this.currentTrack.value = stream
        },

        playRecording(recording) {
            this.currentTrack.value = recording
        }
    }
})