<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps(['column'])
const emit = defineEmits(['task-change', 'add-task', 'open-task-modal'])

const newTaskTitle = ref('')

const columnTasks = computed({
  get: () => props.column.tasks,
  set: (value) => emit('task-change', { columnId: props.column.id, tasks: value })
})

const onTaskMove = (event) => {
  emit('task-change', { columnId: props.column.id, event })
}

const addTask = () => {
  if (newTaskTitle.value.trim()) {
    emit('add-task', { columnId: props.column.id, title: newTaskTitle.value })
    newTaskTitle.value = ''
  }
}
</script>

<template>
  <div class="column bg-gray-100 p-4 rounded-lg w-64 flex-shrink-0">
    <h3 class="font-bold mb-2">{{ column.title }}</h3>

    <!-- Task list -->
    <draggable v-model="columnTasks" group="tasks" item-key="id" @change="onTaskMove">
      <template #item="{ element: task }">
        <div @click="$emit('open-task-modal', task, column.id)" class="task bg-white p-2 mb-2 rounded cursor-pointer">
          {{ task.title }}
        </div>
      </template>
    </draggable>

    <!-- New task form -->
    <div class="mt-4">
      <input v-model="newTaskTitle" placeholder="New task title" class="w-full p-2 mb-2 border rounded" />
      <button @click="addTask" class="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Add Task
      </button>
    </div>
  </div>
</template>