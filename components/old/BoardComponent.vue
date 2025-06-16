<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import { useProjects } from '~/composables/useProjects'
import { useColumns } from '~/composables/useColumns'
import { useTasks } from '~/composables/useTasks'
import BoardColumn from '~/components/BoardColumn.vue'

const emit = defineEmits(['taskAdded', 'taskUpdated', 'taskDeleted', 'columnAdded'])

const { projects, currentProject, fetchProjects, setCurrentProject } = useProjects()
const { columns, fetchColumns, addColumn, updateColumnPositions } = useColumns()
const { tasks, fetchTasks, addTask, updateTask, reorderTasks, deleteTask } = useTasks()

const loading = ref(true)
const selectedProjectId = ref(null)
const isAddingColumn = ref(false)
const newColumnTitle = ref('')
const isModalOpen = ref(false)
const selectedTask = ref(null)
const selectedColumnId = ref(null)
const isCreatingProject = ref(false)
const newProjectTitle = ref('')

onMounted(async () => {
  await fetchProjects()
  if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id
  }
})

watch(selectedProjectId, async (newProjectId) => {
  if (newProjectId) {
    await fetchProjectData(newProjectId)
  }
})

const fetchProjectData = async (projectId) => {
  loading.value = true
  try {
    await Promise.all([
      fetchColumns(projectId),
      fetchTasks(projectId)
    ])
    setCurrentProject(projectId)
  } catch (error) {
    console.error('Error fetching project data:', error)
  } finally {
    loading.value = false
  }
}

const processedColumns = computed(() => {
  return columns.value.map(column => ({
    ...column,
    tasks: tasks.value.filter(task => task.columnId === column.id)
  }))
})

const handleColumnReorder = async (event) => {
  const { newIndex, oldIndex } = event
  const movedColumn = columns.value.splice(oldIndex, 1)[0]
  columns.value.splice(newIndex, 0, movedColumn)

  const updatedColumns = columns.value.map((column, index) => ({
    ...column,
    position: index
  }))

  await updateColumnPositions(updatedColumns)
}

const handleTaskChange = async ({ columnId, event }) => {
  if (event.added) {
    const { element: task, newIndex } = event.added
    await updateTask(task.id, { columnId, position: newIndex })
  } else if (event.moved) {
    const { element: task, newIndex } = event.moved
    await updateTask(task.id, { position: newIndex })
  }
  await reorderTasks(columnId, event.moved ? event.moved.element.columnId : columnId)
}

const handleAddTask = async ({ columnId, title }) => {
  if (currentProject.value) {
    const newTask = await addTask({
      title,
      description: '',
      status: 'todo',
      position: tasks.value.filter(t => t.columnId === columnId).length,
      columnId,
      projectId: currentProject.value.id
    })
    tasks.value.push(newTask)
    emit('taskAdded', newTask)
  }
}

const addNewColumn = async () => {
  if (currentProject.value && newColumnTitle.value.trim()) {
    const newColumn = await addColumn({
      title: newColumnTitle.value,
      projectId: currentProject.value.id,
      position: columns.value.length
    })
    columns.value.push(newColumn)
    emit('columnAdded', newColumn)
    newColumnTitle.value = ''
    isAddingColumn.value = false
  }
}

const openTaskModal = (task, columnId) => {
  selectedTask.value = task
  selectedColumnId.value = columnId
  isModalOpen.value = true
}

const handleTaskSave = async (updatedTask) => {
  await updateTask(updatedTask.id, updatedTask)
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
  }
  emit('taskUpdated', updatedTask)
  isModalOpen.value = false
}

const handleTaskDelete = async (taskId) => {
  await deleteTask(taskId)
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  emit('taskDeleted', taskId)
  isModalOpen.value = false
}

const handleProjectChange = (event) => {
  const projectId = event.target.value
  selectedProjectId.value = projectId
}

const handleCreateProject = async () => {
  if (newProjectTitle.value.trim()) {
    const newProject = await createProject({ title: newProjectTitle.value })
    projects.value.push(newProject)
    selectedProjectId.value = newProject.id
    newProjectTitle.value = ''
    isCreatingProject.value = false
  }
}

const isUserGuest = computed(() => {
  // Implement your logic to determine if the user is a guest
  return false // Placeholder
})
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
      <button @click="addNewColumn" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Add Column
      </button>
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