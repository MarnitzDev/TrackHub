<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'

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

const props = defineProps<{
  column: Column
}>()

const emit = defineEmits(['taskChange', 'addTask', 'openTaskModal'])

const newTask = ref({ title: '', description: '' })
const isAddingTask = ref(false)

const log = (evt: any) => {
  emit('taskChange', evt)
}

const startAddingTask = () => {
  isAddingTask.value = true
  newTask.value = { title: '', description: '' }
}

const saveNewTask = () => {
  if (newTask.value.title.trim()) {
    emit('addTask', { ...newTask.value, columnId: props.column.id })
    newTask.value = { title: '', description: '' }
    isAddingTask.value = false
  }
}

const cancelNewTask = () => {
  newTask.value = { title: '', description: '' }
  isAddingTask.value = false
}

const openTaskModal = (task: Task) => {
  emit('openTaskModal', task, props.column.id)
}
</script>

<template>
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
          <div class="bg-white p-2 mb-2 rounded-lg cursor-pointer" @click="openTaskModal(task)">
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
    <div v-if="isAddingTask">
      <div class="bg-white rounded-lg p-2 mb-2">
        <UInput v-model="newTask.title" variant="none" placeholder="Enter task title" class="w-full" />
      </div>
      <div class="flex space-x-2 mt-2">
        <UButton color="primary" @click="saveNewTask">Add task</UButton>
        <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="cancelNewTask" />
      </div>
    </div>
    <UButton v-else color="neutral" variant="soft" class="w-full mt-2" @click="startAddingTask">
      + Add Task
    </UButton>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>