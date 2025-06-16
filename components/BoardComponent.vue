<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
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
const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTasks()

// Use ref for currentProject instead of getting it from useProjects
const currentProject = ref(null)

const props = defineProps<{
  currentProject?: { id: string; title: string }
}>()

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
  console.log('Raw columns:', rawColumns.value)
  console.log('Tasks:', tasks.value)

  if (!rawColumns.value || !Array.isArray(rawColumns.value)) {
    console.log('Raw columns is not an array or is undefined')
    return []
  }

  const result = rawColumns.value.map(column => ({
    ...column,
    tasks: tasks.value.filter(task => task.columnId === column.id)
  }))

  console.log('Processed columns:', result)
  return result
})

// Use watchEffect for any side effects when columns or tasks change
watchEffect(() => {
  console.log('Columns updated:', processedColumns.value)
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
const handleAddTask = async (newTaskData: Task) => {
  console.log('Handling add task:', newTaskData);
  if (!currentProject.value) {
    console.error('No current project selected');
    return;
  }
  try {
    const addedTask = await addTask({
      ...newTaskData,
      projectId: currentProject.value.id,
      status: 'todo',
      position: tasks.value.length
    });
    if (addedTask) {
      console.log('Task added successfully:', addedTask);
      // Update the local state with only the newly added task
      const columnIndex = processedColumns.value.findIndex(col => col.id === newTaskData.columnId);
      if (columnIndex !== -1) {
        processedColumns.value[columnIndex].tasks.push(addedTask);
      }
    } else {
      console.error('Failed to add task: No task returned');
    }
  } catch (error) {
    console.error('Error in handleAddTask:', error);
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
  if (newColumnTitle.value.trim() && currentProject.value) {
    try {
      await addColumn(currentProject.value.id, newColumnTitle.value.trim())
      isAddingColumn.value = false
      newColumnTitle.value = ''
      // Refresh the columns for the current project
      if (currentProject.value) {
        await fetchColumns(currentProject.value.id)
      }
    } catch (e) {
      console.error('Error adding column:', e)
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

// New state for project creation
const isCreatingProject = ref(false)
const newProjectTitle = ref('')

// Function to handle project creation
const handleCreateProject = async () => {
  if (newProjectTitle.value.trim()) {
    const newProject = await createProject(newProjectTitle.value.trim())
    if (newProject) {
      setCurrentProject(newProject.id)
      isCreatingProject.value = false
      newProjectTitle.value = ''
    }
  }
}

// Fetch projects, tasks, and columns on component mount
onMounted(async () => {
  await fetchProjects();
  if (projects.value.length > 0) {
    currentProject.value = projects.value[0];
    await fetchProjectData();
  }
});

// Function to fetch both columns and tasks
const fetchProjectData = async () => {
  if (currentProject.value) {
    await fetchColumns(currentProject.value.id);
    await fetchTasks(currentProject.value.id);

    // After fetching tasks, distribute them to their respective columns
    processedColumns.value = rawColumns.value.map(column => ({
      ...column,
      tasks: tasks.value.filter(task => task.columnId === column.id)
    }));
  } else {
    console.error('No current project selected');
  }
}

const handleProjectChange = async (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const selectedProjectId = select.value;
  const selectedProject = projects.value.find(p => p.id === selectedProjectId);
  if (selectedProject) {
    currentProject.value = selectedProject;
    await fetchProjectData();
  }
}

const handleTaskChange = async ({ task, newColumnId, oldColumnId, newIndex, oldIndex }) => {
  if (newColumnId && oldColumnId) {
    // Task moved between columns
    const oldColumn = columns.value.find(col => col.id === oldColumnId);
    const newColumn = columns.value.find(col => col.id === newColumnId);

    if (oldColumn && newColumn) {
      // Remove task from old column
      oldColumn.tasks = oldColumn.tasks.filter(t => t.id !== task.id);

      // Add task to new column
      newColumn.tasks.splice(newIndex, 0, task);

      // Update task in the backend
      await updateTask(task.id, { columnId: newColumnId });
    }
  } else if (newIndex !== undefined) {
    // Task reordered within the same column
    const column = columns.value.find(col => col.id === task.columnId);
    if (column) {
      // Remove task from its old position and insert it at the new position
      column.tasks = column.tasks.filter(t => t.id !== task.id);
      column.tasks.splice(newIndex, 0, task);

      // Update task order in the backend
      // You might want to update all tasks' positions in this column
      await updateTaskPositions(column.id, column.tasks.map(t => t.id));
    }
  }
};
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

        <div class="flex space-x-4">
          <!-- Draggable container for columns -->
          <draggable
              v-model="processedColumns"
              group="columns"
              item-key="id"
              class="flex space-x-4"
              @change="logColumnChange"
          >
            <template #item="{ element: column }">
              <BoardColumn
                  v-for="column in processedColumns"
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
                  @click="cancelAddingColumn"
              />
            </div>
          </div>

          <!-- Add Column button -->
          <UButton
              v-if="currentProject && !isAddingColumn"
              color="neutral"
              variant="soft"
              class="h-12 px-4 self-start flex-shrink-0"
              @click="startAddingColumn"
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

    <!-- Debug section -->
    <div v-if="currentProject" class="mt-8 p-4 bg-gray-100 rounded">
      <h3 class="text-lg font-bold mb-2">Debug Info:</h3>
      <p>Current Project: {{ currentProject }}</p>
      <p>Raw Columns: {{ rawColumns }}</p>
      <p>Processed Columns: {{ processedColumns }}</p>
    </div>

    <div v-for="task in tasks" :key="task.id">
      {{ task.title }}
    </div>
    <p>Total tasks: {{ tasks.length }}</p>

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