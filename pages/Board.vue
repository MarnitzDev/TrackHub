<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'

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

const log = (evt: any) => {
  console.log(evt)
}

const editingTask = ref<Task | null>(null)
const newTask = ref<{ columnId: number | null, title: string, description: string }>({
  columnId: null,
  title: '',
  description: ''
})

const startAddingTask = (columnId: number) => {
  newTask.value = { columnId, title: '', description: '' }
}

const saveNewTask = () => {
  if (newTask.value.columnId !== null) {
    const column = columns.value.find(col => col.id === newTask.value.columnId)
    if (column) {
      const newTaskId = Math.max(...columns.value.flatMap(col => col.tasks.map(task => task.id))) + 1
      column.tasks.push({
        id: newTaskId,
        title: newTask.value.title || `New Task ${newTaskId}`,
        description: newTask.value.description || 'No description'
      })
    }
    newTask.value = { columnId: null, title: '', description: '' }
  }
}

const cancelNewTask = () => {
  newTask.value = { columnId: null, title: '', description: '' }
}

const startEditing = (task: Task) => {
  editingTask.value = { ...task }
}

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

const cancelEdit = () => {
  editingTask.value = null
}
</script>

<template>
  <div class="board">
    <h1 class="text-2xl font-bold mb-4">Project Board</h1>
    <div class="flex space-x-4">
      <div v-for="column in columns" :key="column.id" class="bg-gray-100 p-4 rounded-lg w-64">
        <h2 class="font-bold mb-2">{{ column.title }}</h2>
        <draggable
            :list="column.tasks"
            group="tasks"
            @change="log"
            ghost-class="ghost"
            item-key="id"
            class="min-h-[50px]"
        >
          <template #item="{ element }">
            <div v-if="editingTask && editingTask.id === element.id" class="bg-white p-2 mb-2 rounded shadow">
              <input v-model="editingTask.title" class="w-full mb-2 p-1 border rounded" />
              <textarea v-model="editingTask.description" class="w-full mb-2 p-1 border rounded" rows="2"></textarea>
              <div class="flex justify-end">
                <button @click="saveEdit(column.id)" class="bg-blue-500 text-white px-2 py-1 rounded mr-2">Save</button>
                <button @click="cancelEdit" class="bg-gray-300 px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
            <div v-else @click="startEditing(element)" class="bg-white p-2 mb-2 rounded shadow cursor-move">
              <h3 class="font-semibold">{{ element.title }}</h3>
              <p class="text-sm text-gray-600">{{ element.description }}</p>
            </div>
          </template>
        </draggable>
        <div v-if="newTask.columnId === column.id" class="bg-white p-2 mb-2 rounded shadow">
          <input v-model="newTask.title" placeholder="Enter task title" class="w-full mb-2 p-1 border rounded" />
          <textarea v-model="newTask.description" placeholder="Enter task description" class="w-full mb-2 p-1 border rounded" rows="2"></textarea>
          <div class="flex justify-end">
            <button @click="saveNewTask" class="bg-blue-500 text-white px-2 py-1 rounded mr-2">Save</button>
            <button @click="cancelNewTask" class="bg-gray-300 px-2 py-1 rounded">Cancel</button>
          </div>
        </div>
        <button v-else @click="startAddingTask(column.id)" class="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
          + Add Task
        </button>
      </div>
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
</style>