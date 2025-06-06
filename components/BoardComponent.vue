<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useAuth } from '~/composables/useAuth'
import { useTasks } from '~/composables/useTasks'
import { useColumns } from '~/composables/useColumns'
import TaskModal from '~/components/TaskModal.vue'
import ColumnComponent from '~/components/ColumnComponent.vue'

// Use composables
const { isUserGuest } = useAuth()
const { tasks, loading: tasksLoading, error: tasksError, fetchTasks, addTask, updateTask, deleteTask } = useTasks()
const { columns: rawColumns, loading: columnsLoading, error: columnsError, fetchColumns, addColumn, updateColumnPositions } = useColumns()

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
  position: number
  tasks: Task[]
}

// Computed property to combine columns and tasks
const processedColumns = computed<Column[]>(() => {
  if (!rawColumns.value || !tasks.value) return []

  return rawColumns.value.map(column => ({
    ...column,
    tasks: tasks.value.filter(task => task.status === column.title.toLowerCase().replace(' ', '_'))
  }))
})

// Use watchEffect for any side effects when columns or tasks change
watchEffect(() => {
  console.log('Columns updated:', processedColumns.value)
  // Any other side effects you need to perform when columns or tasks change
})

// Log changes in task and column order
const log = async (evt: any) => {
  console.log('Task change:', evt)
  if (evt.added) {
    const task = evt.added.element
    const newStatus = processedColumns.value.find(col => col.tasks.includes(task))?.title.toLowerCase().replace(' ', '_')
    if (newStatus) {
      await updateTask(task.id, { status: newStatus })
    }
  }
}

const logColumnChange = (evt: any) => {
  console.log('Column change:', evt)
  if (evt.moved) {
    const updatedColumns = processedColumns.value.map((column, index) => ({
      ...column,
      position: index
    }))
    updateColumnPositions(updatedColumns)
  }
}

// Handle adding a new task
const handleAddTask = async (newTaskData: { title: string, description: string, columnId: number }) => {
  const column = processedColumns.value.find(col => col.id === newTaskData.columnId)
  if (column) {
    const status = column.title.toLowerCase().replace(' ', '_')
    const taskToAdd = {
      title: newTaskData.title.trim(),
      description: newTaskData.description.trim() || '',
      status: status,
      column_id: newTaskData.columnId,
      position: column.tasks?.length || 0
    }

    const addedTask = await addTask(taskToAdd)
    if (addedTask) {
      await fetchTasks()
    } else {
      console.error('Failed to add task')
    }
  }
}

// State for new column creation
const isAddingColumn = ref(false)
const newColumnTitle = ref('')

// Function to start adding a new column
const startAddingColumn = () => {
  isAddingColumn.value = true
  newColumnTitle.value = ''
}

// Function to handle adding a new column
const handleAddColumn = async () => {
  if (newColumnTitle.value.trim()) {
    const addedColumn = await addColumn({ title: newColumnTitle.value.trim() })
    if (addedColumn) {
      isAddingColumn.value = false
      newColumnTitle.value = ''
      await fetchColumns()

      if (isUserGuest.value) {
        rawColumns.value.push({
          id: addedColumn.id,
          title: addedColumn.title,
          position: rawColumns.value.length,
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
    const column = processedColumns.value.find(col => col.id === selectedColumnId.value)
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
    const success = await deleteTask(taskId)
    if (success) {
      await fetchTasks()
    } else {
      console.error('Failed to delete task')
    }
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
    <div v-if="columnsLoading || tasksLoading">Loading board...</div>
    <div v-else-if="columnsError || tasksError">Error: {{ columnsError || tasksError }}</div>
    <div v-else class="flex space-x-4">
      <!-- Draggable container for columns -->
      <draggable
          v-model="processedColumns"
          group="columns"
          item-key="id"
          class="flex space-x-4"
          @change="logColumnChange"
      >
        <template #item="{ element: column }">
          <ColumnComponent
              :column="column"
              @task-change="log"
              @add-task="handleAddTask"
              @open-task-modal="openTaskModal"
          />
        </template>
      </draggable>

      <!-- New column creation UI -->
      <div v-if="isAddingColumn" class="bg-gray-100 p-4 rounded-lg w-64 flex-shrink-0">
        <UInput
            v-model="newColumnTitle"
            variant="none"
            placeholder="Enter column title"
            class="w-full mb-2"
        />
        <div class="flex space-x-2 mt-2">
          <UButton color="primary" @click="handleAddColumn">Add Column</UButton>
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
          class="h-12 px-4 self-start flex-shrink-0"
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
.sortable-ghost {
  opacity: 0.8;
  background: #c8ebfb;
}
.sortable-drag {
  opacity: 0.5;
}
</style>