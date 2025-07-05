<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCardStore } from '~/stores/cardStore'
import { useListStore } from '~/stores/listStore'

const cardStore = useCardStore()
const listStore = useListStore()

const selectedCard = computed(() => cardStore.selectedCard)
const isCardEditorOpen = computed(() => !!selectedCard.value)

// State
const QuillEditor = ref(null)
const editorContent = ref('')
const editedTitle = ref('')
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const isSaving = ref(false)
const hasUnsavedChanges = ref(false)

// Quill Editor Configuration
const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  }
}

// Lifecycle Hooks
onMounted(async () => {
  if (process.client) {
    const { QuillEditor: QE } = await import('@vueup/vue-quill')
    QuillEditor.value = QE
  }
  initializeEditorContent()
})

// Watchers
watch(selectedCard, (newCard) => {
  if (newCard) {
    editorContent.value = newCard.description || ''
    editedTitle.value = newCard.title || ''
    hasUnsavedChanges.value = false
  }
})

// Editor Content Management
const initializeEditorContent = () => {
  if (selectedCard.value) {
    editorContent.value = selectedCard.value.description || ''
    editedTitle.value = selectedCard.value.title || ''
  }
}

const updateContent = (content: string) => {
  editorContent.value = content
  hasUnsavedChanges.value = true
}

const updateCardTitle = (newTitle: string) => {
  editedTitle.value = newTitle
  hasUnsavedChanges.value = true
}

// Card Management
const closeCardEditor = () => {
  if (hasUnsavedChanges.value) {
    // Optionally, show a confirmation dialog before closing
    if (confirm('You have unsaved changes. Are you sure you want to close?')) {
      cardStore.closeCard()
    }
  } else {
    cardStore.closeCard()
  }
}

const confirmDelete = async () => {
  if (selectedCard.value) {
    try {
      isDeleting.value = true
      const result = await cardStore.deleteCard(selectedCard.value.id)

      if (result.success) {
        listStore.removeCardFromList(selectedCard.value.listId, selectedCard.value.id)
        closeCardEditor()
        // Show success toast (implement when you have a toast system)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      // Show error toast (implement when you have a toast system)
    } finally {
      isDeleting.value = false
      showDeleteConfirm.value = false
    }
  }
}

const saveChanges = async () => {
  if (selectedCard.value && hasUnsavedChanges.value) {
    try {
      isSaving.value = true;
      const updatedCard = await cardStore.editCard(selectedCard.value.id, {
        title: editedTitle.value,
        description: editorContent.value
      });

      // Update both cardStore and listStore
      cardStore.updateCardInStore(updatedCard);
      listStore.updateCard(updatedCard.listId, updatedCard);

      // Force reactivity update
      cardStore.$patch((state) => {
        state.selectedCard = { ...updatedCard };
      });

      hasUnsavedChanges.value = false;
      // Show success toast (implement when you have a toast system)

      // Close the modal after successful save
      closeCardEditor();
    } catch (error) {
      console.error('Error saving card changes:', error);
      // Show error toast (implement when you have a toast system)
    } finally {
      isSaving.value = false;
    }
  }
};
</script>

<template>
  <UModal
      :open="isCardEditorOpen"
      @close="closeCardEditor"
      :ui="{ width: 'max-w-2xl' }"
      aria-labelledby="card-editor-title"
      aria-describedby="card-editor-description"
  >
    <template #content>
      <div v-if="selectedCard" class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <UInput
              :model-value="editedTitle"
              @update:model-value="updateCardTitle"
              placeholder="Card title"
              class="text-xl font-bold"
          />
          <UButton color="red" variant="soft" @click="showDeleteConfirm = true">
            Delete Card
          </UButton>
        </div>
        <ClientOnly>
          <component
              v-if="QuillEditor"
              :is="QuillEditor"
              v-model:content="editorContent"
              :options="quillOptions"
              contentType="html"
              @update:content="updateContent"
          />
          <p v-else>Loading editor...</p>
        </ClientOnly>
        <div class="flex justify-end space-x-2">
          <UButton color="gray" @click="closeCardEditor">
            Close
          </UButton>
          <UButton
              color="primary"
              :loading="isSaving"
              @click="saveChanges"
              :disabled="!hasUnsavedChanges"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Delete Confirmation Modal -->
  <UModal :open="showDeleteConfirm">
    <template #content>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">Confirm Delete</h3>
        <p>Are you sure you want to delete this card?</p>
        <div class="mt-4 flex justify-end gap-2">
          <UButton @click="showDeleteConfirm = false">Cancel</UButton>
          <UButton color="red" :loading="isDeleting" @click="confirmDelete">Delete</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style>
@import '@vueup/vue-quill/dist/vue-quill.snow.css';

.ql-container {
  min-height: 200px;
}
</style>