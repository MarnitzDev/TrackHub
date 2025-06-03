<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import { useTasks } from '~/composables/useTasks'

// We'll use a ref to hold the Quill module
const QuillEditor = ref(null)

// Load Quill only on client-side
onMounted(async () => {
  if (process.client) {
    const quillModule = await import('@vueup/vue-quill')
    QuillEditor.value = quillModule.QuillEditor
    await import('@vueup/vue-quill/dist/vue-quill.snow.css')
  }
})

// Use the tasks composable
const { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTasks()

// Define interfaces for Task and Column
interface Task {
  id: number
  title: string
  description: string
  status: string
}

interface Column {
  id: number
  title: string
  tasks: Task[]
}

// Initialize columns
const columns = ref<Column[]>([
  { id: 1, title: 'To Do', tasks: [] },
  { id: 2, title: 'In Progress', tasks: [] },
  { id: 3, title: 'Done', tasks: [] }
])

// Watch for changes in tasks and update columns
watch(tasks, (newTasks) => {
  columns.value.forEach(column => {
    column.tasks = newTasks.filter(task => task.status === column.title.toLowerCase().replace(' ', '_'))
  })
}, { deep: true })

// Log changes in task and column order
const log = async (evt: any) => {
  console.log('Task change:', evt)
  if (evt.added) {
    const task = evt.added.element
    const newStatus = columns.value.find(col => col.tasks.includes(task))?.title.toLowerCase().replace(' ', '_')
    if (newStatus) {
      await updateTask(task.id, { status: newStatus })
    }
  }
}

const logColumnChange = (evt: any) => {
  console.log('Column change:', evt)
}

// State for task editing and creation
const editingTask = ref<Task | null>(null)
const newTask = ref<{ columnId: number | null, title: string, description: string }>({
  columnId: null,
  title: '',
  description: ''
})

// Function to start adding a new task
const startAddingTask = (columnId: number) => {
  newTask.value = { columnId, title: '', description: '' }
}

// Function to save a new task
const saveNewTask = async () => {
  if (!newTask.value.columnId || !newTask.value.title.trim()) {
    console.error('Invalid task data')
    return
  }

  const column = columns.value.find(col => col.id === newTask.value.columnId)
  if (!column) {
    console.error('Selected column not found')
    return
  }

  const status = column.title.toLowerCase().replace(' ', '_')
  const taskToAdd = {
    title: newTask.value.title.trim(),
    description: newTask.value.description.trim() || '',
    status: status,
    column_id: newTask.value.columnId,
    position: column.tasks.length
  }

  const addedTask = await addTask(taskToAdd)
  if (addedTask) {
    column.tasks.push(addedTask)
  }
  newTask.value = { columnId: null, title: '', description: '' }
}

// Function to cancel adding a new task
const cancelNewTask = () => {
  newTask.value = { columnId: null, title: '', description: '' }
}

// State for new column creation
const newColumnTitle = ref('')
const isAddingColumn = ref(false)

// Function to start adding a new column
const startAddingColumn = () => {
  isAddingColumn.value = true
  newColumnTitle.value = ''
}

// Function to save a new column
const saveNewColumn = () => {
  if (newColumnTitle.value.trim()) {
    const newColumnId = Math.max(...columns.value.map(col => col.id)) + 1
    columns.value.push({
      id: newColumnId,
      title: newColumnTitle.value.trim(),
      tasks: []
    })
    isAddingColumn.value = false
    newColumnTitle.value = ''
  }
}

// Function to cancel adding a new column
const cancelAddingColumn = () => {
  isAddingColumn.value = false
  newColumnTitle.value = ''
}

// Modal state and functions
const isModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)
const selectedColumnId = ref<number | null>(null)

const openTaskModal = (task: Task, columnId: number) => {
  selectedTask.value = { ...task }
  selectedColumnId.value = columnId
  isModalOpen.value = true
}

const closeTaskModal = () => {
  isModalOpen.value = false
  selectedTask.value = null
  selectedColumnId.value = null
}

const saveTaskChanges = async () => {
  if (selectedTask.value && selectedColumnId.value !== null) {
    const column = columns.value.find(col => col.id === selectedColumnId.value)
    if (column) {
      await updateTask(selectedTask.value.id, {
        title: selectedTask.value.title,
        description: selectedTask.value.description,
        status: column.title.toLowerCase().replace(' ', '_')
      })
    }
  }
  closeTaskModal()
}

// Quill Editor configuration
const quillOptions = ref({
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
})

// Function to update task description
const updateTaskDescription = (value: string) => {
  if (selectedTask.value) {
    selectedTask.value.description = value
  }
}

// Fetch tasks on component mount
onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <div class="board">
    <h1 class="text-2xl font-bold mb-4">Project Board</h1>
    <div v-if="loading">Loading tasks...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else class="flex space-x-4">
      <!-- Draggable container for columns -->
      <draggable
          v-model="columns"
          group="columns"
          item-key="id"
          @change="logColumnChange"
          class="flex space-x-4"
      >
        <template #item="{ element: column }">
          <div class="bg-gray-100 p-4 rounded-lg w-64">
            <!-- Column header with drag handle -->
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-bold">{{ column.title }}</h2>
              <UButton icon="i-lucide-grip-vertical" color="neutral" variant="ghost" class="cursor-move" />
            </div>
            <!-- Draggable container for tasks -->
            <draggable
                :list="column.tasks"
                group="tasks"
                ghost-class="ghost"
                item-key="id"
                @change="log"
            >
              <template #item="{ element: task }">
                <div class="task-wrapper">
                  <div @click="openTaskModal(task, column.id)" class="bg-white p-2 mb-2 rounded-lg cursor-pointer">
                    <h3 class="font-semibold">{{ task.title }}</h3>
                  </div>
                </div>
              </template>
            </draggable>
            <!-- Message for empty column -->
            <div v-if="column.tasks.length === 0" class="text-gray-500 text-sm italic mb-2">
              No tasks in this column
            </div>
            <!-- New task input or add task button -->
            <div v-if="newTask.columnId === column.id">
              <div class="bg-white rounded-lg p-2 mb-2">
                <UInput v-model="newTask.title" variant="none" placeholder="Enter task title" class="w-full" />
              </div>
              <div class="flex space-x-2 mt-2">
                <UButton color="primary" @click="saveNewTask">Add task</UButton>
                <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="cancelNewTask" />
              </div>
            </div>
            <UButton v-else color="neutral" variant="soft" class="w-full mt-2" @click="startAddingTask(column.id)">
              + Add Task
            </UButton>
          </div>
        </template>
      </draggable>

      <!-- New column creation UI -->
      <div v-if="isAddingColumn" class="bg-gray-100 p-4 rounded-lg w-64">
        <UInput
            v-model="newColumnTitle"
            variant="none"
            placeholder="Enter column title"
            class="w-full mb-2"
        />
        <div class="flex space-x-2 mt-2">
          <UButton color="primary" @click="saveNewColumn">Add Column</UButton>
          <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="soft"
              @click="cancelAddingColumn"
          />
        </div>
      </div>

      <!-- Add Column button -->
      <UButton
          v-else
          color="neutral"
          variant="soft"
          class="h-12 px-4 self-start"
          @click="startAddingColumn"
      >
        + Add Column
      </UButton>
    </div>

    <!-- Task Modal -->
    <UModal v-model:open="isModalOpen" :title="selectedTask?.title || 'Task Details'" prevent-close :ui="{ footer: 'justify-end' }">
      <template #body>
        <div v-if="selectedTask" class="space-y-4">
          <div class="flex items-start space-x-3">
            <UIcon name="i-lucide-edit" class="mt-1 flex-shrink-0" />
            <div class="flex-grow">
              <h4 class="font-medium mb-2">Title</h4>
              <UInput
                  v-model="selectedTask.title"
                  placeholder="Task title"
                  class="w-full"
              />
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <UIcon name="i-lucide-list" class="mt-1 flex-shrink-0" />
            <div class="flex-grow">
              <h4 class="font-medium mb-2">Description</h4>
              <ClientOnly>
                <component
                    :is="QuillEditor"
                    v-if="QuillEditor"
                    v-model:content="selectedTask.description"
                    :options="quillOptions"
                    contentType="html"
                    @update:content="updateTaskDescription"
                />
                <p v-else>Loading editor...</p>
              </ClientOnly>
            </div>
          </div>
          <!-- Add more sections here (e.g., comments, attachments) -->
        </div>
      </template>

      <template #footer="{ close }">
        <UButton color="neutral" variant="soft" @click="closeTaskModal">
          Close
        </UButton>
        <UButton color="primary" @click="saveTaskChanges">
          Save Changes
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.board {
  padding: 20px;
}
.ghost {
  opacity: 0.5;
}
.sortable-ghost {
  opacity: 0.8;
  background: #c8ebfb;
}
.sortable-drag {
  opacity: 0.5;
}
/* Add some basic styling for Quill editor */
:deep(.ql-container) {
  min-height: 200px;
}
</style>