import { defineStore } from 'pinia'
export const useAudioList = defineStore({
  // id is required so that Pinia can connect the store to the devtools
  id: 'audioList',
  state: () => ({
    audioList: new Map(),
  }),
  actions: {
    pushAudio(key, audio) {
      this.audioList.set(key, audio)
    },
    deleteAudio(key) {
      this.audioList.delete(key)
    },
  },
})
