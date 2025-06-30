<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCardStore } from '~/stores/cardStore'

// Props
// -----------------------------
const props = defineProps(['cardId'])

// Store
// -----------------------------
const cardStore = useCardStore()

// State
// -----------------------------
const QuillEditor = ref(null)
const editorContent = ref('')

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

  // Initialize editor content from the store
  const card = cardStore.cards.find(c => c.id === props.cardId)
  if (card) {
    editorContent.value = card.description || ''
  }
})

// Watchers
// -----------------------------
watch(() => cardStore.selectedCard, (newCard) => {
  if (newCard && newCard.id === props.cardId) {
    editorContent.value = newCard.description || ''
  }
})

//=============================================================================
// Editor Content Management
//=============================================================================

const updateContent = async (content: string) => {
  editorContent.value = content
  await cardStore.editCard(props.cardId, { description: content })
}
</script>

<template>
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
</template>

<style>
@import '@vueup/vue-quill/dist/vue-quill.snow.css';

.ql-container {
  min-height: 200px;
}
</style>