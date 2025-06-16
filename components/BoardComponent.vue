<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useAuth } from '~/composables/useAuth'
import { useTasks } from '~/composables/useTasks'
import { useColumns } from '~/composables/useColumns'
import { useProjects } from '~/composables/useProjects'
import TaskModal from '~/components/TaskModal.vue'
import BoardColumn from '~/components/BoardColumn.vue'

// Use composables
const { isUserGuest } = useAuth()
const { projects, loading: projectsLoading, error: projectsError, fetchProjects, createProject, setCurrentProject } = useProjects()
const { columns: rawColumns, loading: columnsLoading, error: columnsError, fetchColumns, addColumn, updateColumnPositions } = useColumns()
const { tasks, fetchTasks, addTask, updateTask, deleteTask, updateTaskPositions } = useTasks()

const currentProject = ref(null)

// Define interfaces for Task and Column
interface Task {
  id: number
  title: string
  description: string
  status: string
  columnId: number
}

interface Column {
  id: number
  title: string
  position: number
  tasks: Task[]
}

// Computed property to combine columns and tasks
const processedColumns = computed(() => {
  if (!rawColumns.value || !Array.isArray(rawColumns.value)) {
    return []
  }

  return rawColumns.value.map(column => ({
    ...column,
    tasks: tasks.value.filter(task => task.columnId === column.id)
  }))
})

// Watch for changes in processedColumns
watch(processedColumns, (newColumns) => {
  console.log('Processed Columns changed:', newColumns)
}, { deep: true })

// Handle column reordering
const handleColumnReorder = async (evt: any) => {
  if (evt.moved) {
    const updatedColumns = processedColumns.value.map((column, index) => ({
      ...column,
      position: index
    }))
    await updateColumnPositions(updatedColumns)
  }
}

// Handle task changes (moving between columns or reordering within a column)
const handleTaskChange = async ({ added, removed, moved }) => {
  if (added) {
    // Task moved to a new column
    const task = added.element
    const newColumnId = added.newList.id // Make sure this is the correct way to get the new column id
    try {
      if (!task.title || !currentProject.value?.id || !newColumnId) {
        throw new Error('Missing required fields for task update')
      }
      await updateTask(task.id, {
        title: task.title,
        projectId: currentProject.value.id,
        columnId: newColumnId
      })
      // Update local state
      const updatedColumns = processedColumns.value.map(column => {
        if (column.id === newColumnId) {
          return { ...column, tasks: [...column.tasks, task] }
        } else if (column.id === removed.element.columnId) {
          return { ...column, tasks: column.tasks.filter(t => t.id !== task.id) }
        }
        return column
      })
      processedColumns.value = updatedColumns
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert the change in the UI
      await fetchProjectData()
    }
  } else if (moved) {
    // Task reordered within the same column
    const columnId = moved.from
    const column = processedColumns.value.find(col => col.id === columnId)
    if (column) {
      const newTaskOrder = column.tasks.map(t => t.id)
      try {
        await updateTaskPositions(columnId, newTaskOrder)
        // The local state is already updated by vue-draggable, so we don't need to do anything here
      } catch (error) {
        console.error('Error updating task positions:', error)
        // Revert the change in the UI
        await fetchProjectData()
      }
    }
  }
}

// Handle adding a new task
const handleAddTask = async (newTaskData: Partial<Task>, columnId: string) => {
  if (!currentProject.value) {
    console.error('No current project selected')
    return
  }
  try {
    const addedTask = await addTask({
      title: newTaskData.title,
      description: newTaskData.description,
      projectId: currentProject.value.id,
      columnId: columnId,
      status: 'todo',
      position: tasks.value.length
    })
    if (addedTask) {
      console.log('Task added successfully:', addedTask)
      await fetchTasks(currentProject.value.id)
    } else {
      console.error('Failed to add task: No task returned')
    }
  } catch (error) {
    console.error('Error in handleAddTask:', error)
  }
}

// State for new column creation
const isAddingColumn = ref(false)
const newColumnTitle = ref('')

// Function to handle adding a new column
const handleAddColumn = async () => {
  if (newColumnTitle.value.trim() && currentProject.value) {
    try {
      await addColumn(currentProject.value.id, newColumnTitle.value.trim())
      isAddingColumn.value = false
      newColumnTitle.value = ''
      await fetchColumns(currentProject.value.id)
    } catch (e) {
      console.error('Error adding column:', e)
    }
  }
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
  await fetchTasks(currentProject.value?.id)
}

const handleTaskDelete = async (taskId: number) => {
  if (selectedColumnId.value !== null) {
    const success = await deleteTask(taskId)
    if (success) {
      await fetchTasks(currentProject.value?.id)
    } else {
      console.error('Failed to delete task')
    }
  }
}

// Function to handle project creation
const handleCreateProject = async () => {
  if (newProjectTitle.value.trim()) {
    const newProject = await createProject(newProjectTitle.value.trim())
    if (newProject) {
      setCurrentProject(newProject.id)
      isCreatingProject.value = false
      newProjectTitle.value = ''
      await fetchProjectData()
    }
  }
}

// Fetch projects, tasks, and columns on component mount
onMounted(async () => {
  await fetchProjects()
  if (projects.value.length > 0) {
    currentProject.value = projects.value[0]
    await fetchProjectData()
  }
})

// Function to fetch both columns and tasks
const fetchProjectData = async () => {
  if (currentProject.value) {
    await Promise.all([
      fetchColumns(currentProject.value.id),
      fetchTasks(currentProject.value.id)
    ])
  } else {
    console.error('No current project selected')
  }
}

const handleProjectChange = async (event: Event) => {
  const select = event.target as HTMLSelectElement
  const selectedProjectId = select.value
  const selectedProject = projects.value.find(p => p.id === selectedProjectId)
  if (selectedProject) {
    currentProject.value = selectedProject
    await fetchProjectData()
  }
}
</script>

<template>
  <div class="board">
    <div v-if="isUserGuest" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <p>You are using guest mode. Your changes will not be saved. <UButton color="primary" @click="$router.push('/auth/login')">Sign in to save your work</UButton></p>
    </div>

    <div v-if="projectsLoading || columnsLoading || tasksLoading">Loading...</div>
    <div v-else-if="projectsError || columnsError || tasksError">Error: {{ projectsError || columnsError || tasksError }}</div>
    <div v-else>
      <!-- Project selection -->
      <div v-if="projects.length > 0" class="mb-4">
        <label for="project-select" class="mr-2">Select Project:</label>
        <select id="project-select" @change="handleProjectChange($event)">
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.title }}
          </option>
        </select>
      </div>

      <!-- Create project UI -->
      <div v-if="projects.length === 0 || isCreatingProject" class="mb-4">
        <input v-model="newProjectTitle" placeholder="Enter project title" class="mr-2" />
        <UButton color="primary" @click="handleCreateProject">Create Project</UButton>
      </div>

      <!-- Show create project button if no projects exist -->
      <UButton v-if="projects.length === 0 && !isCreatingProject" color="primary" @click="isCreatingProject = true">Create Your First Project</UButton>

      <!-- Board content -->
      <div v-if="currentProject" class="mt-4">
        <h2 class="text-2xl font-bold mb-4">{{ currentProject.title }}</h2>

        <div class="flex space-x-4 overflow-x-auto">
          <!-- Draggable container for columns -->
          <draggable
              v-model="processedColumns"
              group="columns"
              item-key="id"
              class="flex space-x-4"
              @change="handleColumnReorder"
          >
            <template #item="{ element: column }">
              <BoardColumn
                  :key="column.id"
                  :column="column"
                  @task-change="handleTaskChange"
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
                  @click="isAddingColumn = false"
              />
            </div>
          </div>

          <!-- Add Column button -->
          <UButton
              v-if="currentProject && !isAddingColumn"
              color="neutral"
              variant="soft"
              class="h-12 px-4 self-start flex-shrink-0"
              @click="isAddingColumn = true"
          >
            + Add Column
          </UButton>
        </div>
      </div>
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
.board {
  overflow-x: auto;
}

.sortable-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.sortable-drag {
  opacity: 0.8;
}
</style>