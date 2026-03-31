import { ref } from "vue";

/**
 * Composable for handling logo file uploads
 * Provides file validation, preview generation, and FormData preparation
 */
export function useLogoUpload() {
  const preview = ref(null);
  const selectedFile = ref(null);
  const uploadError = ref(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  /**
   * Handle file input change event
   * Validates file type and size, generates preview
   */
  const onFileChange = (e) => {
    uploadError.value = null;
    const file = e.target.files?.[0];

    if (!file) {
      clearPreview();
      return;
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      uploadError.value = `Invalid file type. Accepted: ${ACCEPTED_TYPES.map((t) => t.split("/")[1]).join(", ")}`;
      clearPreview();
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      uploadError.value = `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
      clearPreview();
      return;
    }

    selectedFile.value = file;
    preview.value = URL.createObjectURL(file);
  };

  /**
   * Clear file selection and preview
   */
  const clearPreview = () => {
    selectedFile.value = null;
    if (preview.value) {
      URL.revokeObjectURL(preview.value);
      preview.value = null;
    }
  };

  /**
   * Append logo file to FormData if one is selected
   * @param {FormData} formData - The FormData object to append to
   */
  const appendLogoToFormData = (formData) => {
    if (selectedFile.value) {
      formData.append("logo", selectedFile.value);
    }
  };

  return {
    preview,
    selectedFile,
    uploadError,
    onFileChange,
    clearPreview,
    appendLogoToFormData,
  };
}
