<template>
  <div class="p-4 space-y-2">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Header -->
      <div class="flex gap-2 items-center">
        <router-link to="/streams" class="text-white w-8 h-8 mr-2">
          <ArrowLeftIcon />
        </router-link>
        <img
          v-if="stream.logo_url"
          :src="getFullUrl(stream.logo_url)"
          alt="Logo"
          class="flex w-8 h-8 object-cover rounded-md border"
        />
        <h1 class="text-2xl font-bold">{{ stream.name }}</h1>
        
        <CheckIcon v-if="editing" class="w-5 h-5 text-gray-400" @click="updateStream(stream.id)"/>
        <PencilIcon v-else class="w-5 h-5 text-gray-400" @click="editSttream"/>
      </div>

      <!-- Edit Stream Info -->
      <div v-if="editing">
        <form @submit.prevent="updateStream" class="bg-gray-900 p-4 rounded-lg space-y-3">
          <div class="mb-3">
            <label for="name" class="block text-sm font-medium text-gray-200"
              >Name</label
            >
            <input
              v-model="stream.name"
              id="name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div class="mb-3">
            <label for="url">Stream URL</label>
            <input
              v-model="stream.url"
              id="url"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <!-- Logo Upload -->
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-200 mb-2">Logo</label>
            <div class="space-y-2">
              <div class="flex gap-3">
                <input
                  id="logoUpload"
                  class="hidden"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                />
                <label for="logoUpload" class="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-sm cursor-pointer transition">
                  Choose Logo
                </label>
                <img
                  v-if="preview"
                  :src="preview"
                  alt="New logo preview"
                  class="w-12 h-12 rounded-sm object-cover border border-gray-500"
                />
              </div>
              <div v-if="uploadError" class="text-red-500 text-sm">{{ uploadError }}</div>
            </div>
          </div>
        </form>
      </div>
      <!-- Recordings List -->
      <div>
        <h2 class="text-xl font-bold mb-2 mt-4">Recordings</h2>
        <div v-if="!stream.recordings || stream.recordings.length === 0" class="text-gray-400">
          <p>No recordings yet</p>
        </div>
        <div
          v-for="rec in stream.recordings"
          :key="rec.id"
          class="p-3 bg-gray-900 rounded-lg mb-3"
        >
          <div class="font-semibold">{{ rec.name }}</div>
          <div class="text-sm text-gray-400">
            {{ new Date(rec.start_time).toLocaleString() }}
          </div>
          <div v-if="rec.duration" class="text-sm text-gray-500">
            Duration: {{ Math.floor(rec.duration / 60) }}m {{ rec.duration % 60 }}s
          </div>
          <button 
            v-if="rec.file_path"
            class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
            @click="playRecording(rec)"
          >
            Play
          </button>
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
      description: `Recorded on ${new Date(recording.start_time).toLocaleString()}`,
      logo_url: stream.value?.logo_url,
    });
  }
}
</script>
