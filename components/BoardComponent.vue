<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import { useAuth } from '~/composables/useAuth'
import { useTasks } from '~/composables/useTasks'
import { useColumns } from '~/composables/useColumns'
import TaskModal from '~/components/TaskModal.vue'

// Use composables
const { isUserGuest } = useAuth()
const { tasks, loading: tasksLoading, error: tasksError, guestMessage, fetchTasks, addTask, updateTask, deleteTask } = useTasks()
const { columns, loading: columnsLoading, error: columnsError, fetchColumns, addColumn } = useColumns()

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
    position: column.tasks?.length || 0
  }

  const tempNewTask = { ...newTask.value }
  newTask.value = { columnId: null, title: '', description: '' }

  const addedTask = await addTask(taskToAdd)
  if (addedTask) {
    const updatedColumn = columns.value.find(col => col.id === tempNewTask.columnId)
    if (updatedColumn) {
      if (!updatedColumn.tasks) {
        updatedColumn.tasks = []
      }
      updatedColumn.tasks = updatedColumn.tasks.filter(task => task.id !== addedTask.id)
      updatedColumn.tasks.push(addedTask)
    }
  } else {
    newTask.value = tempNewTask
    console.error('Failed to add task')
  }
}

// Function to cancel adding a new task
const cancelNewTask = () => {
  newTask.value = { columnId: null, title: '', description: '' }
}

// Function to delete a task
const deleteTaskFromBoard = async (taskId: number, columnId: number) => {
  const success = await deleteTask(taskId)
  if (success) {
    const column = columns.value.find(col => col.id === columnId)
    if (column) {
      column.tasks = column.tasks.filter(task => task.id !== taskId)
    }
  } else {
    console.error('Failed to delete task')
  }
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
const saveNewColumn = async () => {
  if (newColumnTitle.value.trim()) {
    const newColumnData = {
      title: newColumnTitle.value.trim(),
    }

    const addedColumn = await addColumn(newColumnData)
    if (addedColumn) {
      isAddingColumn.value = false
      newColumnTitle.value = ''
      await fetchColumns()

      if (isUserGuest.value) {
        columns.value.push({
          id: addedColumn.id,
          title: addedColumn.title,
          tasks: []
        })
      }
    } else {
      console.error('Failed to add column')
    }
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
  selectedTask.value = task
  selectedColumnId.value = columnId
  isModalOpen.value = true
}

const handleTaskSave = async (updatedTask: Task) => {
  if (selectedColumnId.value !== null) {
    const column = columns.value.find(col => col.id === selectedColumnId.value)
    if (column) {
      await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: column.title.toLowerCase().replace(' ', '_')
      })
    }
  }
  await fetchTasks()
}

const handleTaskDelete = async (taskId: number) => {
  if (selectedColumnId.value !== null) {
    await deleteTaskFromBoard(taskId, selectedColumnId.value)
    await fetchTasks()
  }
}

// Fetch tasks and columns on component mount
onMounted(async () => {
  await fetchColumns()
  await fetchTasks()
})
</script>

<template>
  <div class="board">
    <div v-if="isUserGuest" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <p>You are using guest mode. Your changes will not be saved. <UButton color="primary" @click="$router.push('/auth/login')">Sign in to save your work</UButton></p>
    </div>
    <div v-if="tasksLoading || columnsLoading">Loading board...</div>
    <div v-else-if="tasksError || columnsError">Error: {{ tasksError || columnsError }}</div>
    <div v-else class="flex space-x-4">
      <!-- Draggable container for columns -->
      <draggable
          v-model="columns"
          group="columns"
          item-key="id"
          class="flex space-x-4"
          @change="logColumnChange"
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
                :item-key="task => task.id"
                @change="log"
            >
              <template #item="{ element: task }">
                <div class="task-wrapper">
                  <div class="bg-white p-2 mb-2 rounded-lg cursor-pointer" @click="openTaskModal(task, column.id)">
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

    <TaskModal
        :is-open="isModalOpen"
        :task="selectedTask"
        :column-id="selectedColumnId"
        @update:is-open="isModalOpen = $event"
        @save="handleTaskSave"
        @delete="handleTaskDelete"
    />
  </div>
</template>

<style scoped>
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