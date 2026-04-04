<template>
  <div class="p-4 space-y-2">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Header -->
      <div class="flex gap-2 items-center mb-6">
        <router-link to="/streams" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Back">
          <ArrowLeftIcon class="w-6 h-6" />
        </router-link>
        <img
          v-if="stream.logo_url"
          :src="getFullUrl(stream.logo_url)"
          alt="Logo"
          class="w-12 h-12 object-cover rounded-md border border-spotify-border"
        />
        <h1 class="text-2xl font-bold text-spotify-text-primary">{{ stream.name }}</h1>
        
        <CheckIcon v-if="editing" class="w-5 h-5 text-spotify-green cursor-pointer transition hover:text-spotify-green-bright" @click="updateStream(stream.id)"/>
        <PencilIcon v-else class="w-5 h-5 text-spotify-text-secondary cursor-pointer transition hover:text-spotify-text-primary" @click="editSttream"/>
      </div>

      <!-- Edit Stream Info -->
      <div v-if="editing">
        <form @submit.prevent="updateStream" class="bg-spotify-bg-secondary p-4 rounded-lg space-y-3 border border-spotify-border">
          <div class="mb-3">
            <label for="name" class="block text-sm font-semibold text-spotify-text-primary"
              >Name</label
            >
            <input
              v-model="stream.name"
              id="name"
              type="text"
              class="mt-1 block w-full px-3 py-2 bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg shadow-sm focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            />
          </div>

          <div class="mb-3">
            <label for="url" class="block text-sm font-semibold text-spotify-text-primary">Stream URL</label>
            <input
              v-model="stream.url"
              id="url"
              type="text"
              class="mt-1 block w-full px-3 py-2 bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg shadow-sm focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
            />
          </div>

          <!-- Logo Upload -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-spotify-text-primary mb-2">Logo</label>
            <div class="space-y-2">
              <div class="flex gap-3">
                <input
                  id="logoUpload"
                  class="hidden"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                />
                <label for="logoUpload" class="bg-spotify-green hover:bg-spotify-green-bright text-black px-4 py-2 rounded-lg cursor-pointer transition font-semibold active:scale-95">
                  Choose Logo
                </label>
                <img
                  v-if="preview"
                  :src="preview"
                  alt="New logo preview"
                  class="w-12 h-12 rounded-md object-cover border border-spotify-border"
                />
              </div>
              <div v-if="uploadError" class="text-red-500 text-sm">{{ uploadError }}</div>
            </div>
          </div>
        </form>
      </div>
      <!-- Recordings List -->
      <div>
        <h2 class="text-2xl font-bold mb-4 mt-6 text-spotify-text-primary">Recordings</h2>
        <div v-if="!stream.recordings || stream.recordings.length === 0" class="text-spotify-text-secondary">
          <p>No recordings yet</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-2">
          <RecordingListItem
            v-for="rec in stream.recordings"
            :key="rec.id"
            :recording="rec"
            :logo-url="stream.logo_url"
            @play="playRecording"
          />
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { usePlayerStore } from "../stores/player";
import router from "../router";
import { getFullUrl } from "../utils/api";
import { ArrowLeftIcon, PencilIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { useLogoUpload } from "../composables/useLogoUpload";
import RecordingListItem from "../components/RecordingListItem.vue";

const route = useRoute();
const player = usePlayerStore();
const { preview, uploadError, onFileChange, appendLogoToFormData } = useLogoUpload();

const stream = ref(null);
const loading = ref(true);
const editing = ref(false);

onMounted(async () => {
  const id = route.params.id;
  const res = await fetch(`/api/streams/${id}/details`);
  stream.value = await res.json();
  loading.value = false;
});

function editSttream() {
  editing.value = !editing.value;
}

async function updateStream() {
  if (uploadError.value) {
    alert("Please fix upload error: " + uploadError.value);
    return;
  }

  try {
    // If we have a new logo file, use FormData
    if (preview.value) {
      const formData = new FormData();
      formData.append("name", stream.value.name);
      formData.append("url", stream.value.url);
      if (stream.value.description) {
        formData.append("description", stream.value.description);
      }
      appendLogoToFormData(formData);

      const response = await fetch(`/api/streams/${stream.value.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        alert(`Stream updated.`);
        editing.value = false;
        // Refresh stream data
        const refreshRes = await fetch(`/api/streams/${stream.value.id}/details`);
        stream.value = await refreshRes.json();
      } else {
        const result = await response.json();
        alert(
          result.message || `Failed to update stream: ${response.statusText}`,
        );
      }
    } else {
      // No new logo, use JSON for metadata-only updates
      const updatedData = { ...stream.value };
      if (updatedData.logo_url === "") {
        delete updatedData.logo_url;
      }
      const response = await fetch(`/api/streams/${stream.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert(`Stream updated.`);
        editing.value = false;
      } else {
        const result = await response.json();
        alert(
          result.message || `Failed to update stream: ${response.statusText}`,
        );
      }
    }
  } catch (error) {
    console.error("Error updating stream:", error);
    alert("Failed to update stream.");
  }
}

function playRecording(recording) {
  if (recording.file_path) {
    const filename = recording.file_path.split(/[\\/]/).pop();
    player.playTrack({
      id: recording.id,
      name: recording.name,
      url: `${import.meta.env.VITE_API_BASE_URL}/audio/${filename}`,
      logo_url: stream.value?.logo_url,
      recordedAt: recording.start_time,
    });
  }
}
</script>
