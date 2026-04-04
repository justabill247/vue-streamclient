<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex gap-4 items-center mb-6">
      <router-link to="/" class="text-spotify-text-primary hover:text-spotify-green transition p-1" title="Go back">
        <ArrowLeftIcon class="w-6 h-6" />
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-spotify-text-primary">Add New Stream</h1>
        <p class="text-sm text-spotify-text-secondary">Save a stream source and optional logo for quick playback and scheduling.</p>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
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

        <div>
          <label class="block text-sm font-semibold mb-2 text-spotify-text-primary">Stream URL</label>
          <input
            v-model="form.url"
            type="url"
            placeholder="https://example.com/live.m3u8"
            class="w-full bg-spotify-bg-tertiary text-spotify-text-primary border border-spotify-border rounded-lg p-3 placeholder-spotify-text-disabled focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          />
        </div>

      </div>

      <div class="bg-spotify-bg-card border border-spotify-border rounded-xl p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-spotify-text-primary">Logo</h2>
            <p class="text-xs text-spotify-text-secondary mt-1">Optional artwork used in the player and stream lists.</p>
          </div>
        </div>

        <div class="logo-panel rounded-xl border border-spotify-border p-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div class="logo-preview-shell shrink-0">
            <img
              v-if="preview"
              :src="preview"
              alt="Logo preview"
              class="w-full h-full object-cover"
            />
            <div v-else class="logo-preview-empty">
              No logo
            </div>
          </div>

          <div class="flex-1 space-y-3 min-w-0">
            <div>
              <div class="text-sm font-semibold text-spotify-text-primary">Upload artwork</div>
              <div class="text-xs text-spotify-text-disabled mt-1">Square images work best. PNG, JPG, and GIF are supported.</div>
            </div>

            <div class="flex flex-wrap gap-2">
              <input
                id="fileUpload"
                class="hidden"
                type="file"
                accept="image/*"
                @change="onFileChange"
              />
              <label for="fileUpload" class="secondary-action px-4 py-2 rounded-lg cursor-pointer transition font-semibold active:scale-95">
                {{ preview ? "Replace Logo" : "Choose Logo" }}
              </label>
              <button
                v-if="preview"
                type="button"
                @click="clearPreview()"
                class="secondary-action px-4 py-2 rounded-lg transition font-semibold active:scale-95"
              >
                Remove
              </button>
            </div>

            <div v-if="uploadError" class="text-red-500 text-sm">{{ uploadError }}</div>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          class="w-full secondary-action submit-action py-3 px-4 rounded-lg transition font-semibold active:scale-95"
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

<style scoped>
.secondary-action {
  background-color: rgba(15, 23, 42, 0.7);
  color: rgb(241, 245, 249);
  border: 1px solid rgba(71, 85, 105, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.secondary-action:hover {
  background-color: rgba(30, 41, 59, 0.95);
  border-color: rgba(100, 116, 139, 0.9);
}

.submit-action {
  color: rgb(29, 185, 84);
}

.submit-action:hover {
  color: rgb(30, 215, 96);
}

.logo-panel {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.46) 0%, rgba(17, 24, 39, 0.72) 100%);
}

.logo-preview-shell {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(71, 85, 105, 0.65);
  background-color: rgba(15, 23, 42, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview-empty {
  color: rgb(148, 163, 184);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
</style>
