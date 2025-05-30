<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'

// Define interfaces for Task and Column
interface Task {
  id: number
  title: string
  description: string
}

interface Column {
  id: number
  title: string
  tasks: Task[]
}

// Initialize columns with some sample data
const columns = ref<Column[]>([
  {
    id: 1,
    title: 'To Do',
    tasks: [
      { id: 1, title: 'Task 1', description: 'Description for Task 1' },
      { id: 2, title: 'Task 2', description: 'Description for Task 2' },
    ]
  },
  {
    id: 2,
    title: 'In Progress',
    tasks: [
      { id: 3, title: 'Task 3', description: 'Description for Task 3' },
    ]
  },
  {
    id: 3,
    title: 'Done',
    tasks: [
      { id: 4, title: 'Task 4', description: 'Description for Task 4' },
    ]
  }
])

// Log changes in task and column order
const log = (evt: any) => {
  console.log('Task change:', evt)
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
const saveNewTask = () => {
  if (newTask.value.columnId !== null && newTask.value.title.trim()) {
    const column = columns.value.find(col => col.id === newTask.value.columnId)
    if (column) {
      const newTaskId = Math.max(...columns.value.flatMap(col => col.tasks.map(task => task.id))) + 1
      column.tasks.push({
        id: newTaskId,
        title: newTask.value.title.trim(),
        description: newTask.value.description || 'No description'
      })
    }
    newTask.value = { columnId: null, title: '', description: '' }
  }
}

// Function to cancel adding a new task
const cancelNewTask = () => {
  newTask.value = { columnId: null, title: '', description: '' }
}

// Function to start editing an existing task
const startEditing = (task: Task) => {
  editingTask.value = { ...task }
}

// Function to save edits to an existing task
const saveEdit = (columnId: number) => {
  if (editingTask.value) {
    const column = columns.value.find(col => col.id === columnId)
    if (column) {
      const taskIndex = column.tasks.findIndex(task => task.id === editingTask.value!.id)
      if (taskIndex !== -1) {
        column.tasks[taskIndex] = { ...editingTask.value }
      }
    }
    editingTask.value = null
  }
}

// Function to cancel editing a task
const cancelEdit = () => {
  editingTask.value = null
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
</script>

<template>
  <div class="board">
    <h1 class="text-2xl font-bold mb-4">Project Board</h1>
    <div class="flex space-x-4">
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
              <UButton icon="i-lucide-grip-vertical" color="gray" variant="ghost" class="cursor-move" />
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
                  <div v-if="editingTask && editingTask.id === task.id" class="bg-white p-2 mb-2 rounded-lg">
                    <UInput v-model="editingTask.title" class="w-full mb-2" variant="none" placeholder="Task title" />
                    <div class="flex justify-end space-x-2">
                      <UButton color="primary" @click="saveEdit(column.id)">Save</UButton>
                      <UButton color="gray" variant="soft" @click="cancelEdit">Cancel</UButton>
                    </div>
                  </div>
                  <div v-else @click="startEditing(task)" class="bg-white p-2 mb-2 rounded-lg cursor-move">
                    <h3 class="font-semibold">{{ task.title }}</h3>
                  </div>
                </div>
              </template>
            </draggable>
            <!-- New task input or add task button -->
            <div v-if="newTask.columnId === column.id">
              <div class="bg-white rounded-lg p-2 mb-2">
                <UInput v-model="newTask.title" variant="none" placeholder="Enter task title" class="w-full" />
              </div>
              <div class="flex space-x-2 mt-2">
                <UButton color="primary" @click="saveNewTask">Add task</UButton>
                <UButton icon="i-lucide-x" color="gray" variant="soft" @click="cancelNewTask" />
              </div>
            </div>
            <UButton v-else color="gray" variant="soft" class="w-full mt-2" @click="startAddingTask(column.id)">
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
              color="gray"
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
</style>