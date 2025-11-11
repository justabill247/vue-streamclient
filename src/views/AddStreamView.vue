<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="flex gap-4 items-center mb-4">
      <router-link to="/" class="text-white w-8 h-8">
        <ArrowLeftIcon />
      </router-link>
      <h1 class="text-2xl font-bold">Add New Stream</h1>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Stream Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Stream Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. BBC Radio 1"
          class="w-full border rounded-lg p-2"
          required
        />
      </div>

      <!-- Stream URL -->
      <div>
        <label class="block text-sm font-medium mb-1">Stream URL</label>
        <input
          v-model="form.url"
          type="url"
          placeholder="https://example.com/live.m3u8"
          class="w-full border rounded-lg p-2"
        />
      </div>

      <!-- Stream Description -->
      <div>
        <label class="block text-sm font-medium mb-1">Stream Description</label>
        <input
          v-model="form.description"
          type="text"
          placeholder="BBC Radio 1 Main Stream"
          class="w-full border rounded-lg p-2"
        />
      </div>

      <!-- Logo -->
      <div>
        <label class="block text-sm font-medium mb-1">Logo</label>
        <div class="flex">
          <input
            id="fileUpload"
            class="hidden"
            type="file"
            accept="image/*"
            @change="onFileChange"
          />
          <label for="fileUpload" class="bg-blue-800 text-white px-4 py-2 rounded-sm">
            Upload File
          </label>
          <img
            v-if="preview"
            :src="preview"
            alt="Logo preview"
            class="w-20 h-20 mt-2 rounded-sm object-cover"
          />
        </div>
      </div>

      <!-- Submit -->
      <div class="pt-4">
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Add Stream
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

const message = ref("");
const preview = ref(null);
const selectedFile = ref(null);

const form = ref({
  name: "",
  url: "",
  description: "",
});

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    preview.value = URL.createObjectURL(file);
  }
};

async function submitForm() {
  if (!form.value.name || !form.value.url) {
    alert("You must provide a name and URL.");
    return;
  }

  // Build FormData object
  const data = new FormData();
  data.append("name", form.value.name);
  data.append("url", form.value.url);
  data.append("description", form.value.description);
  if (selectedFile.value) {
    data.append("logo", selectedFile.value);
  }

  try {
    const res = await fetch("/api/streams", {
      method: "POST",
      body: data, // ✅ correct variable
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }

    message.value = "✅ Stream added successfully!";
    alert(message.value);

    // Reset form
    form.value = { name: "", url: "", description: "" };
    selectedFile.value = null;
    preview.value = null;
  } catch (err) {
    console.error("Error adding stream:", err);
    alert("Error adding stream: " + err.message);
  }
}

</script>
