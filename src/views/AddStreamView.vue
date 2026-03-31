<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="flex gap-4 items-center mb-6">
      <router-link to="/" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Go back">
        <ArrowLeftIcon class="w-6 h-6" />
      </router-link>
      <h1 class="text-2xl font-bold text-spotify-text-primary">Add New Stream</h1>
    </div>

    <form @submit.prevent="submitForm" class="space-y-5">
      <!-- Stream Name -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Stream Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. BBC Radio 1"
          class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          required
        />
      </div>

      <!-- Stream URL -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Stream URL</label>
        <input
          v-model="form.url"
          type="url"
          placeholder="https://example.com/live.m3u8"
          class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
        />
      </div>

      <!-- Stream Description -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Stream Description</label>
        <input
          v-model="form.description"
          type="text"
          placeholder="BBC Radio 1 Main Stream"
          class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
        />
      </div>

      <!-- Logo -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Logo</label>
        <div class="space-y-3">
          <div class="flex gap-3">
            <input
              id="fileUpload"
              class="hidden"
              type="file"
              accept="image/*"
              @change="onFileChange"
            />
            <label for="fileUpload" class="bg-spotify-green hover:bg-spotify-green-bright text-black px-4 py-2 rounded-lg cursor-pointer transition font-semibold active:scale-95">
              Upload File
            </label>
            <img
              v-if="preview"
              :src="preview"
              alt="Logo preview"
              class="w-20 h-20 rounded-md object-cover border border-spotify-border"
            />
          </div>
          <div v-if="uploadError" class="text-red-500 text-sm">{{ uploadError }}</div>
        </div>
      </div>

      <!-- Submit -->
      <div class="pt-4">
        <button
          type="submit"
          class="w-full bg-spotify-green hover:bg-spotify-green-bright text-black font-semibold py-3 px-4 rounded-lg transition active:scale-95"
        >
          Add Stream
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { useLogoUpload } from "../composables/useLogoUpload";

const message = ref("");
const { preview, selectedFile, uploadError, onFileChange, clearPreview, appendLogoToFormData } = useLogoUpload();

const form = ref({
  name: "",
  url: "",
  description: "",
});

async function submitForm() {
  if (!form.value.name || !form.value.url) {
    alert("You must provide a name and URL.");
    return;
  }

  if (uploadError.value) {
    alert("Please fix upload error: " + uploadError.value);
    return;
  }

  // Build FormData object
  const data = new FormData();
  data.append("name", form.value.name);
  data.append("url", form.value.url);
  data.append("description", form.value.description);
  appendLogoToFormData(data);

  try {
    const res = await fetch("/api/streams", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }

    message.value = "✅ Stream added successfully!";
    alert(message.value);

    // Reset form
    form.value = { name: "", url: "", description: "" };
    clearPreview();
  } catch (err) {
    console.error("Error adding stream:", err);
    alert("Error adding stream: " + err.message);
  }
}

</script>
