<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCardStore } from '~/stores/cardStore'

const cardStore = useCardStore()

const selectedCard = computed(() => cardStore.selectedCard)
const isCardEditorOpen = computed(() => !!selectedCard.value)

// State
// -----------------------------
const QuillEditor = ref(null)
const editorContent = ref('')
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

//=============================================================================
// Quill Editor Configuration
//=============================================================================

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
// -----------------------------
onMounted(async () => {
  if (process.client) {
    const { QuillEditor: QE } = await import('@vueup/vue-quill')
    QuillEditor.value = QE
  }

  initializeEditorContent()
})

// Watchers
// -----------------------------
watch(selectedCard, (newCard) => {
  if (newCard) {
    editorContent.value = newCard.description || ''
  }
})

//=============================================================================
// Editor Content Management
//=============================================================================

const initializeEditorContent = () => {
  if (selectedCard.value) {
    editorContent.value = selectedCard.value.description || ''
  }
}

const updateContent = async (content: string) => {
  editorContent.value = content
  if (selectedCard.value) {
    await cardStore.editCard(selectedCard.value.id, { description: content })
  }
}

// Debounce function to limit the frequency of updates
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Debounced update function
const debouncedUpdateContent = debounce(updateContent, 500)

//=============================================================================
// Card Management
//=============================================================================

const closeCardEditor = () => {
  cardStore.closeCard()
}

const updateCardTitle = (newTitle: string) => {
  if (selectedCard.value) {
    cardStore.editCard(selectedCard.value.id, { ...selectedCard.value, title: newTitle })
  }
}

const confirmDelete = async () => {
  if (selectedCard.value) {
    try {
      isDeleting.value = true
      const result = await cardStore.deleteCard(selectedCard.value.id)

      if (result.success) {
        // Show a success message (uncomment when you have a toast system)
        // useToast().add({
        //   title: 'Success',
        //   description: result.message,
        //   color: 'green'
        // })
        closeCardEditor()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      // Show an error message (uncomment when you have a toast system)
      // useToast().add({
      //   title: 'Error',
      //   description: error.message || 'Failed to delete card. Please try again.',
      //   color: 'red'
      // })
    } finally {
      isDeleting.value = false
      showDeleteConfirm.value = false
    }
  }
}

const saveChanges = async () => {
  if (selectedCard.value) {
    await cardStore.editCard(selectedCard.value.id, {
      ...selectedCard.value,
      description: editorContent.value
    })
    closeCardEditor()
  }
}
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
              :model-value="selectedCard.title"
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
              @update:content="debouncedUpdateContent"
          />
          <p v-else>Loading editor...</p>
        </ClientOnly>
        <div class="flex justify-end space-x-2">
          <UButton color="gray" @click="closeCardEditor">
            Cancel
          </UButton>
          <UButton color="primary" @click="saveChanges">
            Save Changes
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