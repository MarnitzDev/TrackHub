
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const QuillEditor = ref(null)
const editorContent = ref(props.modelValue)

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

onMounted(async () => {
  if (process.client) {
    const { QuillEditor: QE } = await import('@vueup/vue-quill')
    QuillEditor.value = QE
  }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== editorContent.value) {
    editorContent.value = newValue
  }
})

const updateContent = (content) => {
  editorContent.value = content
  emit('update:modelValue', content)
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