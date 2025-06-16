<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'

interface Task {
  id: number | string;
  title: string;
  description: string;
}

interface Column {
  id: number | string;
  title: string;
  tasks: Task[];
}

const props = defineProps<{
  column: Column
}>()

const emit = defineEmits(['taskChange', 'addTask', 'openTaskModal'])

const enabled = ref(true)
const dragging = ref(false)

const draggingInfo = computed(() => {
  return dragging.value ? "under drag" : "";
})

const checkMove = (e: any) => {
  console.log("Future index: " + e.draggedContext.futureIndex);
}

const onStart = () => {
  dragging.value = true;
}

const onEnd = (e: any) => {
  dragging.value = false;
  emit('taskChange', e);
}

const addNewTask = () => {
  emit('addTask', {
    columnId: props.column.id,
    title: `New Task ${Date.now()}`,
    description: 'Task description'
  });
}

const openTaskModal = (task: Task) => {
  emit('openTaskModal', task, props.column.id);
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg w-64">
    <h2 class="font-bold mb-2">{{ column.title }}</h2>

    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" @click="addNewTask">
      Add Task
    </button>

    <draggable
        :list="column.tasks"
        :disabled="!enabled"
        class="list-group"
        ghost-class="ghost"
        :move="checkMove"
        @start="onStart"
        @end="onEnd"
        item-key="id"
        group="tasks"
    >
      <template #item="{ element }">
        <div
            class="list-group-item bg-white p-2 mb-2 rounded shadow cursor-pointer"
            @click="openTaskModal(element)"
        >
          <h3 class="font-semibold">{{ element.title }}</h3>
          <p class="text-sm text-gray-600">{{ element.description }}</p>
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

.list-group-item {
  cursor: move;
}

.list-group-item:hover {
  box-shadow: 0 0 11px rgba(33,33,33,.2);
}

.list-group {
  min-height: 20px;
}
</style>