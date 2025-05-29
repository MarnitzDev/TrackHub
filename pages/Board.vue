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
            ghost-class="ghost"
            item-key="id"
            @change="log"
        >
          <template #item="{ element }">
            <div v-if="editingTask && editingTask.id === element.id" class="">
              <UInput v-model="editingTask.title" class="w-full mb-2 p-1 border rounded"  variant="none" />
<!--              <textarea v-model="editingTask.description" class="w-full mb-2 p-1 border rounded" rows="2"/>-->
              <div class="flex">
                <UButton class="bg-blue-500 text-white" @click="saveEdit(column.id)">Save</UButton>
                <UButton class="bg-gray-300 px-2 py-1 rounded" @click="cancelEdit">Cancel</UButton>
              </div>
            </div>
            <div v-else class="bg-white p-2 mb-2 rounded-lg cursor-move">
              <h3 class="font-semibold">{{ element.title }}</h3>
<!--              <p class="text-sm text-gray-600">{{ element.description }}</p>-->
            </div>
          </template>
        </draggable>
        <div v-if="newTask.columnId === column.id">
          <div class="bg-white rounded-lg p-2 mb-2">
            <UInput v-model="newTask.title" variant="none" placeholder="Enter task title" class="" />
          </div>
          <div class="flex space-x-2 mt-4">
            <UButton color="primary" @click="saveNewTask">Add task</UButton>
            <UButton icon="i-lucide-x" size="xl" color="neutral" variant="soft" @click="cancelNewTask" />
          </div>
        </div>
        <UButton v-else color="neutral" variant="soft" @click="startAddingTask(column.id)">
          + Add Task
        </UButton>
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