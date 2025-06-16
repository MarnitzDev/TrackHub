<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'

interface Task {
  id: number | string;
  title: string;
  description?: string;
}

interface Column {
  id: number | string;
  title: string;
  tasks: Task[];
}

const props = defineProps<{
  column: Column
}>()

const emit = defineEmits(['task-change', 'add-task', 'open-task-modal'])

const dragging = ref(false)
const isAddingTask = ref(false)
const newTaskTitle = ref('')

const draggingInfo = computed(() => {
  return dragging.value ? "under drag" : "";
})

const emitTaskChange = (evt: any) => {
  emit('task-change', { columnId: props.column.id, ...evt })
}

const onStart = () => {
  dragging.value = true;
}

const onEnd = () => {
  dragging.value = false;
}

const startAddingTask = () => {
  isAddingTask.value = true;
  newTaskTitle.value = '';
}

const cancelAddingTask = () => {
  isAddingTask.value = false;
}

const submitNewTask = () => {
  if (newTaskTitle.value.trim()) {
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.value.trim()
    };
    emit('add-task', { task: newTask, columnId: props.column.id });
    isAddingTask.value = false;
    newTaskTitle.value = '';
  }
}

const openTaskModal = (task: Task) => {
  emit('open-task-modal', task, props.column.id);
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg w-64">
    <h2 class="font-bold mb-2">{{ column.title }}</h2>

    <div v-if="!isAddingTask">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" @click="startAddingTask">
        Add Task
      </button>
    </div>

    <div v-else class="mb-2">
      <input v-model="newTaskTitle" placeholder="Task title" class="w-full p-2 mb-2 rounded" />
      <div class="flex justify-between">
        <button @click="submitNewTask" class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
          Save
        </button>
        <button @click="cancelAddingTask" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
          Cancel
        </button>
      </div>
    </div>

    <draggable
        :list="column.tasks"
        group="tasks"
        item-key="id"
        @change="emitTaskChange"
        @start="onStart"
        @end="onEnd"
        ghost-class="ghost"
        drag-class="drag"
    >
      <template #item="{ element: task }">
        <div
            class="task bg-white p-2 mb-2 rounded shadow cursor-move"
            @click.stop="openTaskModal(task)"
        >
          {{ task.title }}
        </div>
      </template>
    </draggable>

    <div v-if="column.tasks.length === 0" class="text-gray-500 text-center py-4">
      No tasks in this column
    </div>

    <div class="mt-2">
      <small>{{ draggingInfo }}</small>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb !important;
}

.drag {
  opacity: 0.8;
}

.task:hover {
  box-shadow: 0 0 11px rgba(33,33,33,.2);
}
</style>